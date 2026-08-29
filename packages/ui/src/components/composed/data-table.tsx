"use client"

import * as React from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/components/ui/table"
import { Button } from "@repo/ui/components/ui/button"
import { Input } from "@repo/ui/components/ui/input"
import { Skeleton } from "@repo/ui/components/ui/skeleton"
import { cn } from "@repo/ui/lib/utils"

export type DataTableColumn<T> = {
  key: string
  header: string
  cell: (row: T) => React.ReactNode
  className?: string
}

export type DataTableProps<T> = {
  data: T[]
  columns: DataTableColumn<T>[]
  isLoading?: boolean
  searchPlaceholder?: string
  onSearch?: (value: string) => void
  searchValue?: string
  emptyText?: string
  className?: string
  getRowKey: (row: T) => string
}

export function DataTable<T>({
  data,
  columns,
  isLoading,
  searchPlaceholder,
  onSearch,
  searchValue,
  emptyText = "No results found",
  className,
  getRowKey,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className={cn("space-y-3", className)}>
        {onSearch && <Skeleton className="h-9 w-full max-w-sm" />}
        <div className="rounded-xl border">
          <div className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("space-y-3", className)}>
      {onSearch && (
        <div className="flex items-center gap-2">
          <Input
            placeholder={searchPlaceholder ?? "Search..."}
            value={searchValue}
            onChange={(e) => onSearch(e.target.value)}
            className="max-w-sm"
          />
        </div>
      )}

      <div className="rounded-xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col.key} className={col.className}>
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  {emptyText}
                </TableCell>
              </TableRow>
            ) : (
              data.map((row) => (
                <TableRow key={getRowKey(row)}>
                  {columns.map((col) => (
                    <TableCell key={col.key} className={col.className}>
                      {col.cell(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export function DataTablePagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}) {
  return (
    <div className="flex items-center justify-between gap-2 pt-2">
      <p className="text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </p>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          Previous
        </Button>
        <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          Next
        </Button>
      </div>
    </div>
  )
}
