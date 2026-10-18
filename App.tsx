import { useCallback, useState } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { CatalogScreen } from './src/screens/CatalogScreen';
import { TopicScreen } from './src/screens/TopicScreen';
import { colors } from './src/theme';

export default function App() {
  const [openedId, setOpenedId] = useState<string | null>(null);

  const open = useCallback((id: string) => setOpenedId(id), []);
  const back = useCallback(() => setOpenedId(null), []);

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="dark" />

      <CatalogScreen onOpen={open} />

      {openedId !== null ? (
        <View style={styles.overlay}>
          <TopicScreen id={openedId} onBack={back} />
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: colors.bg,
  },
});
