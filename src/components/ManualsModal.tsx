/**
 * AapKiosk: the volunteer manuals behind the "?" button on the multi-app home screen.
 *
 * The manuals are PDFs bundled in the APK under android/app/src/main/assets/handleidingen/.
 * A file name like "01_Kassa openen.pdf" shows as "Kassa openen"; the number only sets the order.
 * Adding or changing a manual means building a new APK.
 */
import React, { useEffect, useState } from 'react';
import { FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';
import RNFS from 'react-native-fs';
import { useTranslation } from 'react-i18next';
import Icon from './Icon';
import { DEN_AAP_BLACK, DEN_AAP_FRAME_WIDTH, DEN_AAP_PINK } from '../config/branding';

export const MANUALS_ASSET_DIR = 'handleidingen';

export interface Manual {
  title: string;
  file: string;
}

/** "01_Kassa_openen.pdf" -> "Kassa openen" */
export const manualTitle = (fileName: string): string =>
  fileName
    .replace(/\.pdf$/i, '')
    .replace(/^\d+[\s._-]*/, '')
    .replace(/[_]+/g, ' ')
    .trim() || fileName;

/** The PDFs in the bundled manuals folder, sorted by file name. */
export const listManuals = async (): Promise<Manual[]> => {
  try {
    const items = await RNFS.readDirAssets(MANUALS_ASSET_DIR);
    return items
      .filter(item => item.isFile() && /\.pdf$/i.test(item.name))
      .map(item => item.name)
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
      .map(file => ({ file, title: manualTitle(file) }));
  } catch {
    return [];
  }
};

export const manualViewerUrl = (file: string): string =>
  `file:///android_asset/pdfjs/viewer.html?file=${encodeURIComponent(
    `file:///android_asset/${MANUALS_ASSET_DIR}/${file}`,
  )}`;

interface Props {
  visible: boolean;
  onClose: () => void;
}

const ManualsModal: React.FC<Props> = ({ visible, onClose }) => {
  const { t } = useTranslation();
  const [manuals, setManuals] = useState<Manual[] | null>(null);
  const [openManual, setOpenManual] = useState<Manual | null>(null);

  useEffect(() => {
    if (!visible) {
      setOpenManual(null);
      return;
    }
    listManuals().then(setManuals);
  }, [visible]);

  const close = () => {
    setOpenManual(null);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="fade" onRequestClose={() => (openManual ? setOpenManual(null) : close())}>
      <View style={styles.frame}>
        <View style={styles.content}>
          <View style={styles.header}>
            {openManual ? (
              <TouchableOpacity
                style={styles.headerButton}
                onPress={() => setOpenManual(null)}
                accessibilityLabel={t('components.manuals.back')}
                testID="manuals-back"
              >
                <Icon name="arrow-left" size={28} color={DEN_AAP_PINK} />
              </TouchableOpacity>
            ) : (
              <View style={styles.headerButton} />
            )}
            <Text style={styles.title} numberOfLines={1}>
              {openManual ? openManual.title : t('components.manuals.title')}
            </Text>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={close}
              accessibilityLabel={t('components.manuals.close')}
              testID="manuals-close"
            >
              <Icon name="close" size={28} color={DEN_AAP_PINK} />
            </TouchableOpacity>
          </View>

          {openManual ? (
            <WebView
              source={{ uri: manualViewerUrl(openManual.file) }}
              style={styles.viewer}
              originWhitelist={['file://*']}
              allowFileAccess
              allowFileAccessFromFileURLs
              onMessage={event => {
                try {
                  if (JSON.parse(event.nativeEvent.data)?.type === 'PDF_VIEWER_CLOSE') setOpenManual(null);
                } catch {
                  // the viewer also posts plain 'user-interaction' strings
                }
              }}
            />
          ) : manuals && manuals.length === 0 ? (
            <View style={styles.empty}>
              <Icon name="file-pdf-box" size={64} color={DEN_AAP_PINK} />
              <Text style={styles.emptyText}>{t('components.manuals.empty')}</Text>
            </View>
          ) : (
            <FlatList
              data={manuals ?? []}
              keyExtractor={item => item.file}
              contentContainerStyle={styles.list}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.item}
                  onPress={() => setOpenManual(item)}
                  activeOpacity={0.7}
                  testID={`manual-${item.file}`}
                >
                  <Icon name="file-pdf-box" size={32} color={DEN_AAP_PINK} />
                  <Text style={styles.itemText}>{item.title}</Text>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  // Same pink frame as App.tsx: a Modal draws outside it
  frame: {
    flex: 1,
    backgroundColor: DEN_AAP_PINK,
    padding: DEN_AAP_FRAME_WIDTH,
  },
  content: {
    flex: 1,
    backgroundColor: DEN_AAP_BLACK,
    borderRadius: 8,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  headerButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  viewer: {
    flex: 1,
    backgroundColor: DEN_AAP_BLACK,
  },
  list: {
    padding: 24,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 700,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: '#1c1c1c',
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  itemText: {
    flex: 1,
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '500',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 32,
  },
  emptyText: {
    color: '#ffffff',
    fontSize: 18,
    textAlign: 'center',
  },
});

export default ManualsModal;
