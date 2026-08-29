import { Tabs, Redirect } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/auth.store'

export default function TabsLayout() {
  const { t } = useTranslation()
  const user = useAuthStore((s) => s.user)

  if (!user) {
    return <Redirect href="/auth" />
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#111827',
        tabBarStyle: { backgroundColor: '#fff', borderTopColor: '#e5e7eb' },
      }}
    >
      <Tabs.Screen name="index" options={{ title: t('dashboard.title') }} />
      <Tabs.Screen name="settings" options={{ title: t('settings.title') }} />
    </Tabs>
  )
}
