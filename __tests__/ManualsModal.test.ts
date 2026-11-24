/**
 * AapKiosk: the "?" manuals list is built from the PDFs bundled under assets/handleidingen.
 */
const mockReadDirAssets = jest.fn();
jest.mock('react-native-fs', () => ({ readDirAssets: (dir: string) => mockReadDirAssets(dir) }));
jest.mock('react-native-webview', () => ({ WebView: 'WebView' }));
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
jest.mock('../src/components/Icon', () => 'Icon');

import { listManuals, manualTitle, manualViewerUrl } from '../src/components/ManualsModal';

const entry = (name: string, file = true) => ({ name, isFile: () => file });

describe('manualTitle', () => {
  it('drops the order number, the extension and underscores', () => {
    expect(manualTitle('01_Kassa_openen.pdf')).toBe('Kassa openen');
    expect(manualTitle('2 - Muziekinstallatie.PDF')).toBe('Muziekinstallatie');
    expect(manualTitle('Afsluiten.pdf')).toBe('Afsluiten');
  });
});

describe('listManuals', () => {
  it('lists only PDFs, in file-name order with numbers sorted as numbers', async () => {
    mockReadDirAssets.mockResolvedValue([
      entry('10_Sluiten.pdf'),
      entry('LEESMIJ.txt'),
      entry('2_Kassa.pdf'),
      entry('map', false),
    ]);
    expect(await listManuals()).toEqual([
      { file: '2_Kassa.pdf', title: 'Kassa' },
      { file: '10_Sluiten.pdf', title: 'Sluiten' },
    ]);
    expect(mockReadDirAssets).toHaveBeenCalledWith('handleidingen');
  });

  it('is empty when the folder cannot be read', async () => {
    mockReadDirAssets.mockRejectedValue(new Error('no folder'));
    expect(await listManuals()).toEqual([]);
  });
});

it('opens a manual in the bundled pdf.js viewer', () => {
  expect(manualViewerUrl('01_Kassa openen.pdf')).toBe(
    'file:///android_asset/pdfjs/viewer.html?file=' +
      encodeURIComponent('file:///android_asset/handleidingen/01_Kassa openen.pdf'),
  );
});
