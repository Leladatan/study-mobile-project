import { memo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { colors, radius, spacing } from '../theme';
import type { RegionOption } from '../hooks/useCatalog';
import type { RegionCode } from '../types/topic';

export type RegionFilterProps = {
  regions: RegionOption[];
  selected: RegionCode | null;
  onSelect: (code: RegionCode | null) => void;
};

function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={({ pressed }) => [styles.chip, active && styles.chipActive, pressed && styles.pressed]}>
      <Text style={[styles.chipText, active && styles.chipTextActive]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

function RegionFilterView({ regions, selected, onSelect }: RegionFilterProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      keyboardShouldPersistTaps="handled">
      <Chip label="Все регионы" active={selected === null} onPress={() => onSelect(null)} />
      {regions.map((region) => (
        <Chip
          key={region.code}
          label={region.label}
          active={selected === region.code}
          onPress={() => onSelect(selected === region.code ? null : region.code)}
        />
      ))}
    </ScrollView>
  );
}

export const RegionFilter = memo(RegionFilterView);

const styles = StyleSheet.create({
  row: {
    gap: spacing.sm,
    paddingRight: spacing.lg,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  pressed: {
    opacity: 0.7,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
  },
  chipTextActive: {
    color: colors.surface,
  },
});
