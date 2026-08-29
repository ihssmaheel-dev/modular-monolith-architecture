import { View, Text, Pressable, ScrollView } from 'react-native'
import { Link } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/auth.store'
import { useQuery } from '@tanstack/react-query'
import { getApiClient } from '@/lib/api'

export default function DashboardTab() {
  const { t } = useTranslation()
  const user = useAuthStore((s) => s.user)

  const notesQuery = useQuery({
    queryKey: ['notes', 'list', { page: 1, limit: 5 }],
    queryFn: async () => {
      const client = getApiClient()
      const res = await client.notes.list({ page: 1, limit: 5 } as never)
      if (res.status !== 200) throw new Error('notes fetch failed')
      return res.body
    },
    enabled: !!user,
  })

  if (!user) {
    return (
      <View className="flex-1 items-center justify-center p-6 bg-background">
        <Text className="text-lg font-semibold text-foreground">{t('errors.unauthorized')}</Text>
        <Link href="/auth" asChild>
          <Pressable className="mt-4 bg-primary rounded-lg px-6 py-3">
            <Text className="text-primary-foreground font-medium">{t('auth.login')}</Text>
          </Pressable>
        </Link>
      </View>
    )
  }

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 16, gap: 16 }}>
      <View>
        <Text className="text-2xl font-bold text-foreground">{t('dashboard.welcome', { name: user.name })}</Text>
        <Text className="text-sm text-muted-foreground">{t('dashboard.subtitle')}</Text>
      </View>

      <View className="rounded-xl border border-border p-4 bg-card gap-2">
        <Text className="text-sm text-muted-foreground">{t('settings.loggedInAs')}</Text>
        <Text className="font-medium text-foreground">{user.email} — {user.role}</Text>
        <Text className="text-xs text-muted-foreground">{t('settings.activeTenant')}: {useAuthStore.getState().user?.id.slice(0, 8) ?? '—'}</Text>
      </View>

      <View className="rounded-xl border border-border p-4 bg-card">
        <Text className="font-semibold text-foreground">{t('notes.title')} ({notesQuery.data?.total ?? '—'})</Text>
        <Text className="text-xs text-muted-foreground">{t('notes.description')}</Text>
        <Link href="/notes" asChild>
          <Pressable className="mt-3 border border-border rounded-lg py-2 items-center">
            <Text className="font-medium text-foreground">{t('notes.title')}</Text>
          </Pressable>
        </Link>
      </View>
    </ScrollView>
  )
}
