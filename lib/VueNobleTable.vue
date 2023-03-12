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
        <th v-for="column in columns" :key="column.key" :scope="column.scope || 'col'" :colspan="column.colspan || 1">
          {{ column.title }}
        </th>
      </tr>
    </thead>
    
    <tbody>
      <tr v-for="(row, index) in rows" :key="index">
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
import { defineComponent, PropType } from 'vue'
import { Column, ColumnGroup, Row } from './VueNobleTablePropTypes';

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
</style>