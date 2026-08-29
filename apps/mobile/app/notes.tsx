import { View, Text, TextInput, Pressable, FlatList, Alert, RefreshControl } from 'react-native'
import { useState } from 'react'
import { Redirect } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getApiClient } from '@/lib/api'
import { useAuthStore } from '@/stores/auth.store'

export default function NotesScreen() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const user = useAuthStore((s) => s.user)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  if (!user) return <Redirect href="/auth" />

  const notesQuery = useQuery({
    queryKey: ['notes', { page: 1, limit: 20 }],
    queryFn: async () => {
      const client = getApiClient()
      const res = await client.notes.list({ page: 1, limit: 20 } as never)
      if (res.status !== 200) throw new Error('fetch failed')
      return res.body
    },
  })

  const createMutation = useMutation({
    mutationFn: async () => {
      const client = getApiClient()
      const res = await client.notes.create({ body: { title, content } } as never)
      if (res.status !== 201) throw new Error('create failed')
      return res.body
    },
    onSuccess: () => {
      setTitle('')
      setContent('')
      qc.invalidateQueries({ queryKey: ['notes'] })
    },
    onError: (e) => Alert.alert(t('api.note.createFailed'), String(e)),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const client = getApiClient()
      const res = await client.notes.remove(id)
      if (res.status !== 204) throw new Error('delete failed')
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notes'] }),
  })

  return (
    <View className="flex-1 bg-background">
      <View className="p-4 gap-3 border-b border-border bg-card">
        <Text className="text-lg font-semibold text-foreground">{t('notes.createNote')}</Text>
        <TextInput value={title} onChangeText={setTitle} placeholder={t('notes.noteTitlePlaceholder')} placeholderTextColor="#9ca3af" className="border border-input rounded-lg px-3 py-3 bg-background text-foreground" />
        <TextInput value={content} onChangeText={setContent} placeholder={t('notes.contentPlaceholder')} placeholderTextColor="#9ca3af" multiline className="border border-input rounded-lg px-3 py-3 bg-background text-foreground min-h-[80px]" />
        <Pressable onPress={() => createMutation.mutate()} disabled={createMutation.isPending || !title || !content} className="bg-primary rounded-lg py-3 items-center disabled:opacity-50">
          <Text className="text-primary-foreground font-semibold">{createMutation.isPending ? t('notes.creating') : t('notes.createButton')}</Text>
        </Pressable>
      </View>

      <FlatList
        data={notesQuery.data?.items ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        refreshControl={<RefreshControl refreshing={notesQuery.isRefetching} onRefresh={() => notesQuery.refetch()} />}
        ListEmptyComponent={<Text className="text-center text-muted-foreground mt-10">{notesQuery.isLoading ? t('notes.loading') : t('notes.noNotes')}</Text>}
        renderItem={({ item }) => (
          <View className="border border-border rounded-xl p-3 bg-card flex-row justify-between">
            <View className="flex-1 pr-3 gap-1">
              <Text className="font-medium text-foreground">{item.title}</Text>
              <Text className="text-sm text-muted-foreground" numberOfLines={2}>{item.content}</Text>
              <Text className="text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleString()}</Text>
            </View>
            <Pressable onPress={() => deleteMutation.mutate(item.id)} className="px-2 py-1">
              <Text className="text-destructive text-sm">×</Text>
            </Pressable>
          </View>
        )}
      />
    </View>
  )
}
