import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { FileText } from "lucide-react"

interface DataTableProps {
  columns: string[]
  isLoading?: boolean
  emptyMessage?: string
  children: React.ReactNode
  dataLength: number
  className?: string
}

export function DataTable({
  columns,
  isLoading,
  emptyMessage = "Tidak ada data ditemukan",
  children,
  dataLength,
  className,
}: DataTableProps) {
  return (
    <div className={cn("rounded-xl border shadow-sm bg-card", className)}>
      <div className="w-full overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow className="hover:bg-transparent">
              {columns.map((column) => (
                <TableHead
                  key={column}
                  className="h-11 px-4 text-[11px] font-extrabold text-muted-foreground/90 uppercase tracking-widest whitespace-nowrap"
                >
                  {column}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, rowIndex) => (
                <TableRow key={rowIndex}>
                  {columns.map((_, colIndex) => (
                    <TableCell key={colIndex} className="px-4 py-3">
                      <Skeleton className="h-4 w-2/3 my-1" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : dataLength === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-48 text-center p-0">
                  <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
                    <FileText className="mb-3 h-10 w-10 opacity-30" />
                    <p className="text-sm font-medium">{emptyMessage}</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              children
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
