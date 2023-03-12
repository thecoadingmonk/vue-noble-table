export interface Column {
  key: string
  title: string
  scope?: 'col' | 'row'
  width?: number
  searchable?: boolean
  exportable?: boolean
  sortable?: boolean
  align?: 'left' | 'right' | 'center'
  valueFormatter?(row: Row): string
}

export interface Row {
  [key: string]: string | number | string[]
}

export interface ColumnGroup {
  title: string
  order: number
  colspan?: number
  scope?: 'col' | 'row'
}