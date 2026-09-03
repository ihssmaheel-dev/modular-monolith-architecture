import { Badge } from "@repo/ui/components/ui/badge";
import type { DataTableColumn } from "@repo/ui/components/composed/data-table";
import type { UserResponse } from "@repo/contracts";
import { formatDate } from "@/lib/format";

export function getUsersColumns(
  t: (key: string) => string,
): DataTableColumn<UserResponse>[] {
  return [
    {
      key: "name",
      header: t("users.name"),
      cell: (row) => <span className="font-semibold text-foreground">{row.name}</span>,
    },
    {
      key: "email",
      header: t("users.email"),
      cell: (row) => <span className="text-muted-foreground font-mono text-xs">{row.email}</span>,
    },
    {
      key: "role",
      header: t("users.role"),
      cell: (row) => (
        <Badge
          variant={row.role === "admin" ? "default" : "secondary"}
          className="text-[10px] font-mono"
        >
          {row.role}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      header: t("users.created"),
      cell: (row) => (
        <span className="text-xs text-muted-foreground">{formatDate(row.createdAt)}</span>
      ),
      className: "hidden sm:table-cell",
    },
  ];
}
