import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Filter, MoreHorizontal, ArrowUpDown } from "lucide-react";

interface Column<T> {
  header: string;
  accessorKey: keyof T;
  cell?: (item: T) => React.ReactNode;
}

interface SmartDataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchPlaceholder?: string;
  cardTitle: (item: T) => string;
  cardSubtitle?: (item: T) => string;
  cardContent?: (item: T) => React.ReactNode;
  actions?: (item: T) => React.ReactNode;
}

export function SmartDataTable<T extends { id: string | number }>({
  data,
  columns,
  searchPlaceholder = "بحث...",
  cardTitle,
  cardSubtitle,
  cardContent,
  actions,
}: SmartDataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredData = data.filter((item) =>
    Object.values(item).some(
      (val) =>
        val &&
        val.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-9 focus-visible:ring-primary"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-9 gap-2">
            <Filter className="h-3.5 w-3.5" />
            <span>تصفية</span>
          </Button>
          <Button size="sm" className="h-9 bg-gradient-brand hover:shadow-lg hover:shadow-primary/20 transition-all">
            إضافة جديد
          </Button>
        </div>
      </div>

      {/* Desktop view */}
      <div className="hidden rounded-xl border border-border/40 bg-card/30 md:block">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.header} className="text-right">
                  {column.header}
                </TableHead>
              ))}
              {actions && <TableHead className="w-[80px]"></TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((item) => (
              <TableRow key={item.id}>
                {columns.map((column) => (
                  <TableCell key={column.header} className="text-right">
                    {column.cell
                      ? column.cell(item)
                      : (item[column.accessorKey] as React.ReactNode)}
                  </TableCell>
                ))}
                {actions && (
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="text-right">
                        <DropdownMenuLabel>الإجراءات</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {actions(item)}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile view */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {filteredData.map((item) => (
          <Card key={item.id} className="border-border/40 bg-card/30 overflow-hidden group">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">{cardTitle(item)}</CardTitle>
                {cardSubtitle && (
                  <p className="text-xs text-muted-foreground mt-1">{cardSubtitle(item)}</p>
                )}
              </div>
              {actions && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="text-right">
                    <DropdownMenuLabel>الإجراءات</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {actions(item)}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </CardHeader>
            <CardContent>
              {cardContent ? (
                cardContent(item)
              ) : (
                <div className="space-y-2">
                  {columns.slice(1).map((col) => (
                    <div key={col.header} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{col.header}:</span>
                      <span className="font-medium">
                        {col.cell ? col.cell(item) : (item[col.accessorKey] as React.ReactNode)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
