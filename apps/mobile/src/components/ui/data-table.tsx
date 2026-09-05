import * as React from "react";
import { FlatList, Text, View, Pressable, ActivityIndicator } from "react-native";
import { useTheme } from "@/theme/theme-provider";
import { mobileTokens } from "@/theme/tokens.generated";
import { Input } from "./input";

interface Column<T> {
  key: string;
  header: string;
  cell: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  emptyText?: string;
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
  getRowKey: (item: T) => string;
}

export function DataTable<T>({
  data,
  columns,
  isLoading,
  emptyText = "No results",
  searchPlaceholder,
  onSearch,
  getRowKey,
}: DataTableProps<T>) {
  const { resolvedTheme } = useTheme();
  const colors = mobileTokens[resolvedTheme];

  if (isLoading) {
    return (
      <View className="gap-3 p-4">
        <View className="h-10 rounded-lg" style={{ backgroundColor: colors.muted }} />
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View className="gap-3">
      {onSearch && searchPlaceholder ? (
        <Input
          placeholder={searchPlaceholder}
          onChangeText={onSearch}
          placeholderTextColor={colors["muted-foreground"]}
        />
      ) : null}
      <View
        className="rounded-xl overflow-hidden border"
        style={{ borderColor: colors.border, backgroundColor: colors.card }}
      >
        <View className="flex-row px-4 py-3 gap-4" style={{ backgroundColor: colors.muted }}>
          {columns.map((col) => (
            <Text
              key={col.key}
              className="flex-1 text-xs font-medium uppercase"
              style={{ color: colors["muted-foreground"] }}
            >
              {col.header}
            </Text>
          ))}
        </View>
        {data.length === 0 ? (
          <View className="p-8 items-center">
            <Text style={{ color: colors["muted-foreground"] }}>{emptyText}</Text>
          </View>
        ) : (
          <FlatList
            data={data}
            keyExtractor={getRowKey}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View
                className="flex-row px-4 py-3 gap-4 border-t"
                style={{ borderColor: colors.border }}
              >
                {columns.map((col) => (
                  <View key={col.key} className="flex-1">
                    {col.cell(item) as React.ReactNode}
                  </View>
                ))}
              </View>
            )}
          />
        )}
      </View>
    </View>
  );
}

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageLabel?: string;
  previousLabel?: string;
  nextLabel?: string;
}

export function DataTablePagination({
  page,
  totalPages,
  onPageChange,
  pageLabel,
  previousLabel = "Previous",
  nextLabel = "Next",
}: PaginationProps) {
  const { resolvedTheme } = useTheme();
  const colors = mobileTokens[resolvedTheme];
  return (
    <View className="flex-row items-center justify-between py-3">
      <Pressable
        disabled={page <= 1}
        onPress={() => onPageChange(page - 1)}
        className="rounded-lg border px-4 py-2 disabled:opacity-40"
        style={{ borderColor: colors.border, backgroundColor: colors.card }}
      >
        <Text style={{ color: colors.foreground }}>{previousLabel}</Text>
      </Pressable>
      <Text className="text-xs" style={{ color: colors["muted-foreground"] }}>
        {pageLabel ?? `Page ${page} of ${totalPages}`}
      </Text>
      <Pressable
        disabled={page >= totalPages}
        onPress={() => onPageChange(page + 1)}
        className="rounded-lg border px-4 py-2 disabled:opacity-40"
        style={{ borderColor: colors.border, backgroundColor: colors.card }}
      >
        <Text style={{ color: colors.foreground }}>{nextLabel}</Text>
      </Pressable>
    </View>
  );
}
