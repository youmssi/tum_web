"use client"

import {
  type Column,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDownIcon } from "lucide-react"
import * as React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface DataTableProps<TData> {
  columns: ColumnDef<TData, unknown>[]
  data: TData[]
  /** Column id the search box filters on. Omit to hide the search box entirely. */
  filterColumnId?: string
  filterPlaceholder?: string
  /**
   * Rendered instead of the table when `data` is empty — pass an `<Empty />` composition so
   * every table's zero-state matches the rest of the app's list pages.
   */
  emptyState: React.ReactNode
}

/**
 * Generic sortable / filterable / paginated table built on TanStack Table v8 and the shadcn
 * `<Table />` primitives — the same "build your own on top of headless UI" pattern shadcn
 * documents for data tables, extracted here since this app now has four call sites (the
 * app-admin Users / Organisations / Subscriptions / Audit pages) that all need the identical
 * shape. Column-specific rendering (badges, dates, links, …) stays in each caller's column defs.
 */
export function DataTable<TData>({
  columns,
  data,
  filterColumnId,
  filterPlaceholder,
  emptyState,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table returns functions that can't be memoized; known library limitation
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: { sorting, columnFilters },
  })

  if (data.length === 0) {
    return <>{emptyState}</>
  }

  const filterColumn = filterColumnId ? table.getColumn(filterColumnId) : undefined
  const filteredCount = table.getFilteredRowModel().rows.length

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        {filterColumn ? (
          <Input
            placeholder={filterPlaceholder ?? "Filter…"}
            value={(filterColumn.getFilterValue() as string) ?? ""}
            onChange={(e) => filterColumn.setFilterValue(e.target.value)}
            className="max-w-sm"
          />
        ) : (
          <span />
        )}
        <p className="text-sm text-muted-foreground whitespace-nowrap">
          {filteredCount.toLocaleString()} of {data.length.toLocaleString()}
        </p>
      </div>

      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-sm text-muted-foreground"
                >
                  No results match your filter.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {table.getPageCount() > 1 && (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}

/** Sortable column header — click to toggle asc/desc, matching the task list's convention. */
export function sortableHeader<TData>(label: string) {
  return function Header({ column }: { column: Column<TData, unknown> }) {
    return (
      <button
        type="button"
        className="flex items-center gap-1 text-left"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        {label}
        <ArrowUpDownIcon className="size-3 text-muted-foreground" />
      </button>
    )
  }
}
