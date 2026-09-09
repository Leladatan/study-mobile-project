import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, radius, spacing } from '../theme';

export type SearchFieldProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export function SearchField({ value, onChange, placeholder }: SearchFieldProps) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.icon}>⌕</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder ?? 'Страна или столица'}
        placeholderTextColor={colors.textFaint}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
        accessibilityLabel="Поиск по каталогу"
      />
      {value.length > 0 ? (
        <Pressable
          onPress={() => onChange('')}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Очистить поиск"
          style={styles.clear}>
          <Text style={styles.clearIcon}>✕</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    height: 46,
    gap: spacing.sm,
  },
  icon: {
    fontSize: 18,
    color: colors.textFaint,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    paddingVertical: 0,
  },
  clear: {
    width: 22,
    height: 22,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearIcon: {
    fontSize: 11,
    lineHeight: 13,
    color: colors.textMuted,
  },
});
