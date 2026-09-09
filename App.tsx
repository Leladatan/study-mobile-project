import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="dark" />

      <View style={styles.card}>
        <Text style={styles.badge}>SPRINT 0</Text>
        <Text style={styles.title}>WorldDex</Text>
        <Text style={styles.subtitle}>Справочник стран мира</Text>

        <View style={styles.divider} />

        <Text style={styles.body}>
          Концепция, backlog и кандидат открытого API зафиксированы в документации проекта.
          Интерфейс справочника разрабатывается в Sprint 1.
        </Text>

        <View style={styles.metaBlock}>
          <Meta label="Источник данных" value="World Bank Indicators API v2" />
          <Meta label="Резерв" value="assets/data/countries.fallback.json" />
          <Meta label="Следующий шаг" value="US-1 — список стран" />
        </View>
      </View>

      <Text style={styles.footer}>Институт бизнеса и дизайна · 2026</Text>
    </SafeAreaView>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metaRow}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F2F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 28,
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  badge: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: '#2563EB',
    marginBottom: 12,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 20,
  },
  body: {
    fontSize: 14,
    lineHeight: 21,
    color: '#334155',
  },
  metaBlock: {
    marginTop: 20,
    gap: 10,
  },
  metaRow: {
    gap: 2,
  },
  metaLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.6,
    color: '#94A3B8',
    textTransform: 'uppercase',
  },
  metaValue: {
    fontSize: 14,
    color: '#0F172A',
  },
  footer: {
    marginTop: 24,
    fontSize: 12,
    color: '#94A3B8',
  },
});
