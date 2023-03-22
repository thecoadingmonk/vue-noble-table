<script lang="ts">
import { defineComponent, ref } from 'vue';
import VueNobleTable from '../lib/VueNobleTable.vue'
import { Column, Row, ColumnGroup } from '../lib/VueNobleTablePropTypes';
import ProductList from './mock-data/ProductList.json';

export default defineComponent({
  name: 'App',
  components: {
    VueNobleTable,
  },
  setup() {
    const columns = ref<Column[]>([
    {
      key: 'id',
      title: 'ID',
      sortable: true,
    },
    {
      key: 'title',
      title: 'Title',
      sortable: true,
    },
    {
      key: 'description',
      title: 'Description',
      sortable: true,
    },
    {
      key: 'price',
      title: 'Price',
      sortable: (a:string | number, b: string | number) => a === b ? 0 : a > b ? 1 : -1,
    },
    {
      key: 'discountPercentage',
      title: 'Discount Percentage',
      sortable: true,
    },
    {
      key: 'rating',
      title: 'Rating',
      sortable: true,
    },
    {
      key: 'stock',
      title: 'Stock',
      sortable: true,
    },
    {
      key: 'brand',
      title: 'Brand',
      sortable: true,
    },
    {
      key: 'category',
      title: 'Category',
      sortable: true,
    },
    {
      key: 'thumbnail',
      title: 'Thumbnail',
      sortable: (a:string | number, b: string | number) => a === b ? 0 : a > b ? 1 : -1,
    }
  ]);
    const rows = ref<Row[]>(ProductList.products);
    const columnGroups = ref<ColumnGroup[]>([
      {
        title: 'Main header',
        order: 0,
        colspan: 5
      },
      {
        title: 'First header',
        order: 1,
        colspan: 2
      },
      {
        title: 'Second header',
        order: 1,
        colspan: 3
      },
  ])

    return { columns, rows, columnGroups }
  }
})
</script>

<template>
  <div class="table-container">
    <VueNobleTable :columns="columns" :rows="rows" :column-groups="columnGroups" />
  </div>
</template>

<style scoped>
.table-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}
</style>
