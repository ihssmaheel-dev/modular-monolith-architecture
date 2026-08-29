import { View, Text, Pressable } from 'react-native'
import { Link } from 'expo-router'
import { useTranslation } from 'react-i18next'

export default function HomeScreen() {
  const { t } = useTranslation()

  return (
    <View className="flex-1 items-center justify-center bg-background p-6 gap-4">
      <Text className="text-2xl font-bold text-foreground">{t('common.appName')}</Text>
      <Text className="text-sm text-muted-foreground text-center">{t('auth.heroDescription')}</Text>

      <View className="w-full gap-3 mt-6 max-w-sm">
        <Link href="/auth" asChild>
          <Pressable className="bg-primary rounded-lg p-4 items-center">
            <Text className="text-primary-foreground font-medium">{t('auth.login')} / {t('auth.register')}</Text>
          </Pressable>
        </Link>
        <Link href="/notes" asChild>
          <Pressable className="border border-border rounded-lg p-4 items-center bg-card">
            <Text className="text-foreground font-medium">{t('notes.title')}</Text>
          </Pressable>
        </Link>
        <Link href="/(tabs)" asChild>
          <Pressable className="border border-border rounded-lg p-4 items-center">
            <Text className="text-foreground font-medium">{t('dashboard.title')}</Text>
          </Pressable>
        </Link>
      </View>

      <Text className="text-xs text-muted-foreground mt-4">Expo + NativeWind + @repo/*</Text>
    </View>
  )
}
