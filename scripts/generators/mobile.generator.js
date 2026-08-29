const path = require("path");
const { writeFileIfMissing } = require("./utils");

function generateMobile({ feature, Feature, featurePlural, FeaturePlural }) {
  const rootPath = path.resolve(__dirname, "../..");

  const screenContent = `import { View, Text, TextInput, Pressable, FlatList, Alert, RefreshControl } from 'react-native'
import { useState } from 'react'
import { Redirect } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getApiClient } from '@/lib/api'
import { useAuthStore } from '@/stores/auth.store'

export default function ${FeaturePlural}Screen() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const user = useAuthStore((s) => s.user)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  if (!user) return <Redirect href="/auth" />

  const listQuery = useQuery({
    queryKey: ['${featurePlural}', { page: 1, limit: 20 }],
    queryFn: async () => {
      const client = getApiClient()
      const res = await (client as unknown as { ${featurePlural}: { list: (q: unknown) => Promise<{ status: number; body: unknown }> } }).${featurePlural}.list({ query: { page: 1, limit: 20 } } as never)
      if ((res as { status: number }).status !== 200) throw new Error('fetch failed')
      return (res as { body: unknown }).body as { items: Array<{ id: string; title: string; content?: string; createdAt: string }>; total: number }
    },
  })

  const createMutation = useMutation({
    mutationFn: async () => {
      const client = getApiClient()
      const res = await (client as unknown as { ${featurePlural}: { create: (q: unknown) => Promise<{ status: number; body: unknown }> } }).${featurePlural}.create({ body: { title, content } } as never)
      if (![200, 201].includes((res as { status: number }).status)) throw new Error('create failed')
      return (res as { body: unknown }).body
    },
    onSuccess: () => {
      setTitle('')
      setContent('')
      qc.invalidateQueries({ queryKey: ['${featurePlural}'] })
    },
    onError: (e) => Alert.alert('Create failed', String(e)),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const client = getApiClient()
      const res = await (client as unknown as { ${featurePlural}: { delete: (q: unknown) => Promise<{ status: number }> } }).${featurePlural}.delete({ params: { id } } as never)
      if ((res as { status: number }).status !== 204) throw new Error('delete failed')
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['${featurePlural}'] }),
  })

  return (
    <View className="flex-1 bg-background">
      <View className="p-4 gap-3 border-b border-border bg-card">
        <Text className="text-lg font-semibold text-foreground">${FeaturePlural}</Text>
        <TextInput value={title} onChangeText={setTitle} placeholder="Title" placeholderTextColor="#9ca3af" className="border border-input rounded-lg px-3 py-3 bg-background text-foreground" />
        <TextInput value={content} onChangeText={setContent} placeholder="Content" placeholderTextColor="#9ca3af" multiline className="border border-input rounded-lg px-3 py-3 bg-background text-foreground min-h-[80px]" />
        <Pressable onPress={() => createMutation.mutate()} disabled={createMutation.isPending || !title} className="bg-primary rounded-lg py-3 items-center disabled:opacity-50">
          <Text className="text-primary-foreground font-semibold">{createMutation.isPending ? 'Creating...' : 'Create ${Feature}'}</Text>
        </Pressable>
      </View>

      <FlatList
        data={(listQuery.data as { items: unknown[] } | undefined)?.items as Array<{ id: string; title: string; content?: string; createdAt: string }> ?? []}
        keyExtractor={(item) => (item as { id: string }).id}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        refreshControl={<RefreshControl refreshing={listQuery.isRefetching} onRefresh={() => listQuery.refetch()} />}
        ListEmptyComponent={<Text className="text-center text-muted-foreground mt-10">{listQuery.isLoading ? 'Loading...' : 'No ${featurePlural} yet'}</Text>}
        renderItem={({ item }) => (
          <View className="border border-border rounded-xl p-3 bg-card flex-row justify-between">
            <View className="flex-1 pr-3 gap-1">
              <Text className="font-medium text-foreground">{(item as { title: string }).title}</Text>
              <Text className="text-sm text-muted-foreground" numberOfLines={2}>{(item as { content?: string }).content ?? ''}</Text>
            </View>
            <Pressable onPress={() => deleteMutation.mutate((item as { id: string }).id)} className="px-2 py-1">
              <Text className="text-destructive text-sm">×</Text>
            </Pressable>
          </View>
        )}
      />
    </View>
  )
}
`;

  writeFileIfMissing(path.join(rootPath, "apps", "mobile", "app", `${featurePlural}.tsx`), screenContent);
}

module.exports = { generateMobile };
