<template>
  <table>
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
        <th v-for="column in columns" :key="column.key" :scope="column.scope || 'col'" @click.exact="setSortConfig(column, 'single')" @click.shift="setSortConfig(column, 'multiple')">
          {{ column.title }}

          <svg v-if="!!sortConfig.find(i => i.key === column.key)" width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" :class="{'sort-up': !!sortConfig.find(i => i.key === column.key && i.direction === 'desc') }">
            <path d="M7 10L1.80385 4L12.1962 4L7 10Z" fill="#5D6B7C"/>
          </svg>            
        </th>
      </tr>
    </thead>
    
    <tbody>
      <tr v-for="(row, index) in displayableRow" :key="index">
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
    </tfoot>
  </table>  
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue'
import { Column, ColumnGroup, Row, SortConfig } from './VueNobleTablePropTypes';

export default defineComponent({
  name: 'VueNobleTable',
  props: {
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
  },
  setup() {
    const sortConfig = ref<SortConfig[]>([])

    return { sortConfig };
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
        const sortMethod = this.sortMethodWithDirectionMultiColumn(this.sortConfig);
        const clonedRows = [...this.rows];
        
        return clonedRows.sort(sortMethod);
      }

      return this.rows;
    }
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
    sortMethodWithDirectionMultiColumn(sortArray: SortConfig[]) {
      const sortMethodAsc = (a: string | number, b: string | number) => {
        return a === b ? 0 : a > b ? 1 : -1;
      }
      
      const sortMethodWithDirection = (direction: SortConfig['direction']) => { 
        if (direction === undefined || direction == "asc") {
            return sortMethodAsc;
        } else {
            return (a: string | number, b: string | number) => {
                return -sortMethodAsc(a, b);
            } 
        }
      }

      const sortMethodWithDirectionByColumn = (columnName: string, direction: SortConfig['direction']) => {   
        const sortMethod = sortMethodWithDirection(direction)

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
</style>