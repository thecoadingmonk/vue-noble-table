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
    },
    {
      key: 'title',
      title: 'Title',
    },
    {
      key: 'description',
      title: 'Description'
    },
    {
      key: 'price',
      title: 'Price',
    },
    {
      key: 'discountPercentage',
      title: 'Discount Percentage',
    },
    {
      key: 'rating',
      title: 'Rating',
    },
    {
      key: 'stock',
      title: 'Stock',
    },
    {
      key: 'brand',
      title: 'Brand',
    },
    {
      key: 'category',
      title: 'Category',
    },
    {
      key: 'thumbnail',
      title: 'Thumbnail'
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
