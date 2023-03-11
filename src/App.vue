<script lang="ts">
import { defineComponent, ref } from 'vue';
import VueNobleTable from '../lib/VueNobleTable.vue'
import { Column, Row, ColumnGroup } from '../lib/TablePropTypes';

export default defineComponent({
  name: 'App',
  components: {
    VueNobleTable,
  },
  setup() {
    const columns = ref<Column[]>([
    {
      key: 'name',
      title: 'Name',
    },
    {
      key: 'hex',
      title: 'HEX',
    },
    {
      key: 'hsla',
      title: 'HSLa'
    },
    {
      key: 'rgba',
      title: 'RGBa',
      colspan: 2
    }
  ]);
    const rows = ref<Row[]>([
      {
        name: 'Teal',
        hex: '#51F6F6',
        hsla: 'hsl(180 90% 64% / 1)',
        rgba: 'rgb(81 246 246 / 1)',
      },
      {
        name: 'Goldenrod',
        hex: '#51F6F6',
        hsla: 'hsl(180 90% 64% / 1)',
        rgba: 'rgb(81 246 246 / 1)',
      },
      {
        hex: '#51F6F6',
        hsla: 'hsl(180 90% 64% / 1)',
        rgba: 'rgb(81 246 246 / 1)',
      }
    ])
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
  height: 100vh;
}
</style>
