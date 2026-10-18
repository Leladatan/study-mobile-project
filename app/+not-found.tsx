import { usePathname, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../src/theme';

export default function NotFoundRoute() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View style={styles.screen}>
      <Text style={styles.icon}>?</Text>
      <Text style={styles.title}>Такой страницы нет</Text>
      <Text style={styles.text}>
        Адрес «{pathname}» не совпал ни с одним экраном приложения. Запрос к серверу при этом
        не отправлялся.
      </Text>
      <Pressable
        onPress={() => router.replace('/')}
        accessibilityRole="button"
        style={styles.button}>
        <Text style={styles.buttonText}>В каталог</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.xl,
    backgroundColor: colors.bg,
  },
  icon: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.textFaint,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
    textAlign: 'center',
  },
  button: {
    marginTop: spacing.md,
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  buttonText: {
    color: colors.surface,
    fontWeight: '600',
    fontSize: 15,
  },
});
