<template>
  <div>
    <div v-if="tableConfig.download?.enable">
      <button @click="exportFile">Download</button>
    </div>

    <table :id="id">
      <caption>
        Color names and values
      </caption>
      
      <thead>
        <tr v-for="(group, index) in orderedColumnGroup" :key="index">
          <th v-for="col in group" :key="col.order" :scope="col.scope || 'col'" :colspan="col.colspan || 1">
            {{ col.title}}
          </th>
        </tr>

        <tr>
          <th 
            v-for="column in columns"
            :key="column.key" 
            :scope="column.scope || 'col'" 
            :class="{'cursor-pointer': column.sortable}"
            @click.exact="setSortConfig(column, 'single')" 
            @click.shift="setSortConfig(column, 'multiple')"
            >
              {{ column.title }}

            <svg v-if="!!getSortConfig(column)" width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" :class="{'sort-up': getSortConfig(column)?.direction === 'desc' }">
              <path d="M7 10L1.80385 4L12.1962 4L7 10Z" fill="#5D6B7C"/>
            </svg>            
          </th>
        </tr>
      </thead>
      
      <tbody>
        <tr v-for="(row, index) in currentPageData" :key="index">
          <td v-for="(col, i) in columns" :key="col.key + i">
              <slot :name="col.key" :row="row">
                {{ row[col.key] }}
              </slot>
          </td>
        </tr>

        <div v-if="!rows.length">No data</div>
      </tbody>

      <tfoot>
        <p>Table footer</p>
        <p v-if="isLoading || localLoadingState">Loading...</p>
      </tfoot>
    </table> 

    <div v-if="pagination.enable" class="pagination-container">
      <div>
        <span>display</span>
        <select v-model="recordsPerPage">
          <option v-for="(record, key) in pager" :key="key" :value="record">{{ record }}</option>
        </select>
        <span>per page</span>
      </div>
      <div>
        <span>page</span>
        <select v-model="currentPage" class="select-current-page">
          <option v-for="num in totalPages" :key="num" :value="num">{{ num }}</option>
        </select>
        <span> of {{totalPages}}</span>

        <button :disabled="currentPage === 1" @click="goToPage('prev')">prev</button>
        <button :disabled="currentPage === totalPages" @click="goToPage('next')">next</button>
      </div>
    </div> 
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue'
import { Column, ColumnGroup, Events, Pagination, Row, SortConfig, TableConfig } from './VueNobleTablePropTypes';

const defaultPager = [10, 15, 25, 50, 100];

export default defineComponent({
  name: 'VueNobleTable',
  props: {
    id: {
      type: String,
      required: true,
    },
    columns: {
      type: Array as PropType<Column[]>,
      required: true
    },
    rows: {
      type: Array as PropType<Row[]>,
      required: true,
    },
    columnGroups: {
      type: Array as PropType<ColumnGroup[]>,
      default: [] as ColumnGroup[]
    },
    pagination: {
      type: Object as PropType<Pagination>,
      default: () => ({
        enable: true,
        pager: defaultPager,
        defaultActivePage: 1,
      } as Pagination)
    },
    isLoading: {
      type: Boolean,
      default: false,
    },
    loadMore: {
      type: Function as PropType<Events['loadMore']>,
      default: undefined,
    },
    tableConfig: {
      type: Object as PropType<TableConfig>,
      default: () => ({
        download: {
          enable: true,
          fileType: 'csv',
          fileName: 'download'
        }
      } as TableConfig)
    },
  },
  setup(props) {
    const sortConfig = ref<SortConfig[]>([])
    const pager = ref<Array<number>>(props.pagination.pager || defaultPager);
    const recordsPerPage = ref<number>(pager.value[0]);
    const currentPage = ref<number>(props.pagination.defaultActivePage || 1)
    const clonedRows = ref<Row[]>(Array.from(props.rows));
    const localLoadingState = ref<Boolean>(false);

    return { sortConfig, pager, recordsPerPage, currentPage, clonedRows, localLoadingState };
  },
  watch: {
    recordsPerPage(newCount, oldCount) {
      // Updating the currentPage except the initial change
      if (oldCount !== 1) {
        this.resetPagination();
      }
    },
  },
  computed: {
    orderedColumnGroup():Array<ColumnGroup[]>  {
      if(this.columnGroups?.length) {
        const modifiedColGroup = this.columnGroups.reduce((prev: Array<ColumnGroup[]>, curr: ColumnGroup, index: number, arr: ColumnGroup[]) => {
            const filteredList = arr.filter(each => each.order === index);
            prev.push(filteredList);

            return prev;
        }, [])

        return modifiedColGroup;
      }

      return [];
    },
    displayableRow() {
      if(this.sortConfig.length ) {
        const sortMethod = this.sortData(this.sortConfig);
        const duplicateRows = Array.from(this.clonedRows);

        return duplicateRows.sort(sortMethod);
      }

      return this.clonedRows;
    },
    currentPageData() {
      if (this.pagination && this.pagination.enable) {
        const start = this.recordsPerPage * (this.currentPage - 1);
        const end = start + this.recordsPerPage;

        this.loadFromServer();

        return this.displayableRow.slice(start, end);
      }

      return this.displayableRow;
    },
    totalPages() {
      return Math.ceil(this.displayableRow.length / this.recordsPerPage);
    },
  },
  methods: {
    setSortConfig(column: Column, type: 'multiple' | 'single') {
      if(!column.sortable) {
        return;
      }

      const currentConfig = this.sortConfig.find(each => each.key === column.key)
      let sortDirection: SortConfig['direction'] = undefined;

      if(!currentConfig) {
        sortDirection = 'asc';
      }

      if(currentConfig && currentConfig.direction === 'asc') {
        sortDirection = 'desc';
      }

      const config: SortConfig = {
        direction: sortDirection,
        key: column.key,
      };

      switch(type){
        case 'single': {
          if(sortDirection) {
            this.sortConfig.splice(0, this.sortConfig.length, config );
          } else {
            this.sortConfig.splice(0, this.sortConfig.length)
          }
          break;
        }

        case 'multiple': {
          const sortedConfigIndex = this.sortConfig.findIndex((each: SortConfig) => each.key === column.key);

          if(sortedConfigIndex === -1) {
            this.sortConfig.push(config);
          } else if(sortDirection) {
            this.sortConfig.splice(sortedConfigIndex, 1, config);
          } else {
            this.sortConfig.splice(sortedConfigIndex, 1)
          }
          break
        }
      }
    },
    sortData(sortArray: SortConfig[]) {
      const sortMethodAsc = (a: string | number, b: string | number, column?: Column) => {
        if (column && typeof column.sortable === 'function') {
          return column.sortable(a, b);
        }

        return a === b ? 0 : a > b ? 1 : -1;
      }
      
      const sortMethodWithDirection = (direction: SortConfig['direction'], column?: Column) => { 
        if (direction === undefined || direction == "asc") {
          return (a: string | number, b: string | number) => sortMethodAsc(a, b, column);
        }

        return (a: string | number, b: string | number) => -sortMethodAsc(a, b, column); 
      }

      const sortMethodWithDirectionByColumn = (columnName: string, direction: SortConfig['direction']) => {   
        const sortMethod = sortMethodWithDirection(direction, this.columns.find((each: Column) => each.key === columnName))

        return (a: Row, b: Row) => {
            return sortMethod(a[columnName], b[columnName]);
        } 
      }

      const sortMethodsForColumn = (sortArray || []).map(item => sortMethodWithDirectionByColumn(item.key, item.direction));

      return (a: Row, b: Row) => {
          let sorted = 0;
          let index = 0;

          while (sorted === 0 && index < sortMethodsForColumn.length) {
              sorted = sortMethodsForColumn[index++](a,b);
          }

          return sorted;
      }
    },
    getSortConfig(column: Column): SortConfig | undefined {
      if(!this.sortConfig.length) {
        return undefined
      }

      return this.sortConfig.find((i: SortConfig) => i.key === column.key)
    },
     resetPagination() {
      this.currentPage = 1;
    },
    goToPage(page: 'prev' | 'next') {
      if (page === 'prev' && this.currentPage > 1) {
        this.currentPage -= 1;
      } else if (page === 'next' && this.currentPage < this.totalPages) {
        this.currentPage += 1;
      }
    },
    async loadFromServer() {
      if(this.loadMore && this.currentPage === this.totalPages) {
        this.localLoadingState = true;

        try {
          const response: Row[] = await this.loadMore({
            count: this.recordsPerPage, 
            previous: this.currentPage - 1, 
            current: this.currentPage, 
            next: this.currentPage + 1,
            cursor: this.recordsPerPage * this.totalPages,
          })

          if (response.length) {
            this.clonedRows = this.clonedRows.concat(response);
          }
        } catch(e) {
          console.log(e)
        } finally {
          this.localLoadingState = false
        }
      }
    },
    toCsv() {
      const exportableColumns = this.columns.filter((each: Column) => each.exportable !== false && each)

      const preparedRows = this.clonedRows.map((row: Row) => {
        const textArray: String[] = [];
        
        exportableColumns.forEach((col: Column) => {
          if(col.valueFormatter) {
            textArray.push(col.valueFormatter(row))
          } else {
            textArray.push(row[col.key].toString().trim().replace(/,/g, ''));
          }
        })
        
        return textArray.join(',')
      }).join('\n')
      const preparedColumns = `${exportableColumns.map(each => each.title.trim().replace(/,/g, '')).join(',')}\n`
      
      return `${preparedColumns}${preparedRows}`
    },
    toJson() {
      const exportableColumns = this.columns.filter((each: Column) => each.exportable !== false && each)
      
      const exportableData = this.clonedRows.map((row: Row) => {
        const exportableObject: Row = {};
        
        exportableColumns.forEach((col: Column) => {
          if(col.valueFormatter) {
            exportableObject[col.key] = col.valueFormatter(row)
          } else {
            exportableObject[col.key] = row[col.key];
          }
        })
        
        return exportableObject;
      })

      return JSON.stringify(exportableData);
    },
    download(text: string, fileName: string, fileType: 'csv' | 'json') {
      const link = document.createElement('a');

      link.setAttribute('href', `data:text/${fileType};charset=utf-8,${encodeURIComponent(text)}`);
      link.setAttribute('download', `${fileName}.${fileType}`);

      link.style.display = 'none';
      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);
    },
    exportFile() {
      let downloadableData: string = '';

      if(this.tableConfig.download?.fileType === 'json') {
        downloadableData = this.toJson()
      } else {
        downloadableData = this.toCsv(); 
      }

      this.download(
        downloadableData, 
        `${this.tableConfig.download?.fileName || 'download'}`, 
        `${this.tableConfig.download?.fileType || 'csv'}`
      );
    }
  }
})
</script>

<style scoped>
table,
th,
td {
  border: 1px solid black;
  border-collapse: collapse;
}

.sort-up {
  transform: rotate(180deg);
}

.cursor-pointer {
  cursor: pointer;
}

.pagination-container {
  display: flex;
  justify-content: space-between;
}

</style>