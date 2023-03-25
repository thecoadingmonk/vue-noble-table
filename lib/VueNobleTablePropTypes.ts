export interface Column {
  key: string
  title: string
  scope?: 'col' | 'row'
  width?: number
  searchable?: boolean
  exportable?: boolean
  sortable?: boolean | ((a: string | number, b: string | number) => 1 | -1 | 0)
  align?: 'left' | 'right' | 'center'
  valueFormatter?(row: Row): string
}

export interface Row {
  [key: string]: string | number
}

export interface ColumnGroup {
  title: string
  order: number
  colspan?: number
  scope?: 'col' | 'row'
}

export interface SortConfig {
    direction?: 'asc' | 'desc'
    key: string
}

export interface Pagination {
  enable: boolean
  defaultActivePage?: number
  pager?: Array<number>
}

export interface Events {
  loadMore?: (
    { 
      count, 
      previous, 
      current, 
      next, 
      cursor 
    }: {
      count: number, 
      previous: number, 
      current: number, 
      next: number, 
      cursor: number}) => Promise<Row[]>
}

export interface TableConfig {
  download?: {
    enable: boolean
    fileType?: 'csv' | 'json'
    fileName?: string
  }
}