import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { transportService } from '../shared/api/transportService';
import { colors, radius, spacing, tabBarSpace } from '../theme';

const VERSION = '0.5.0';

export function AboutScreen() {
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View>
        <Text style={styles.brand}>WorldDex</Text>
        <Text style={styles.tagline}>Справочник стран мира, версия {VERSION}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Откуда данные</Text>
        <Text style={styles.text}>
          Список стран, столицы, регионы, уровни дохода и население приходят из World Bank
          Indicators API. Ключ не нужен, лицензия данных — CC BY-4.0.
        </Text>
        <Row label="Источник" value={transportService.baseUrl} />
        <Row label="Таймаут запроса" value={`${transportService.timeoutMs / 1000} с`} />
        <Row label="Флаги" value="flagcdn.com" />
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Как искать</Text>
        <Text style={styles.text}>
          Страницы и фильтр по региону обрабатывает сервер. Поиска по названию у API нет, поэтому
          он идёт по загруженным записям. Когда загружены не все страницы, каталог пишет об этом
          и предлагает догрузить справочник целиком.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Как пользоваться</Text>
        <Text style={styles.text}>
          Нажатие на карточку открывает страну. Долгое нажатие отмечает её в списке. Возврат
          сохраняет поиск, фильтр и позицию прокрутки.
        </Text>
      </View>

      <Text style={styles.footer}>
        Учебный проект по дисциплине «Разработка мобильных приложений». Институт бизнеса
        и дизайна, 5 семестр.
      </Text>
    </ScrollView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    paddingBottom: tabBarSpace,
    gap: spacing.lg,
  },
  brand: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.6,
  },
  tagline: {
    fontSize: 15,
    color: colors.textMuted,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  rowLabel: {
    fontSize: 13,
    color: colors.textMuted,
  },
  rowValue: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'right',
  },
  footer: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.textFaint,
    textAlign: 'center',
  },
});
