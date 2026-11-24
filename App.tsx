import React, { useEffect } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
// Initialises i18next before any screen renders: the PIN screen, the WebView and the
// external app screen translate too, not only the settings screens.
import { loadStoredLanguage } from './src/i18n';
import AppNavigator from './src/navigation/AppNavigator';
import {
  DEN_AAP_BLACK,
  DEN_AAP_FRAME_RADIUS,
  DEN_AAP_FRAME_WIDTH,
  DEN_AAP_PINK,
} from './src/config/branding';

const App: React.FC = () => {
  // i18next starts in the device language; switch to the one chosen in Settings, if any
  useEffect(() => {
    loadStoredLanguage().catch(() => {});
  }, []);

  return (
    // AapKiosk: a pink Den Aap frame around every screen. The inner view rounds and clips
    // the screens, so the inside edge of the frame has rounded corners.
    <View style={styles.frame}>
      <StatusBar hidden={true} />
      <View style={styles.content}>
        <AppNavigator />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  frame: {
    flex: 1,
    backgroundColor: DEN_AAP_PINK,
    padding: DEN_AAP_FRAME_WIDTH,
  },
  content: {
    flex: 1,
    backgroundColor: DEN_AAP_BLACK,
    borderRadius: DEN_AAP_FRAME_RADIUS,
    overflow: 'hidden',
  },
});

export default App;
