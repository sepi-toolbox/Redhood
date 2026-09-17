// Stable initial GUIDs for assets created without the Unity Editor.
// Existing .meta files are never rewritten; Unity remains their owner after import.
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const checking = process.argv.includes('--check');
let count = 0;
function visit(relative) {
  if (relative === 'Assets/Resources/Redhood' || relative.endsWith('.meta')) return false;
  const absolute = path.join(project, relative);
  const directory = fs.statSync(absolute).isDirectory();
  if (directory) {
    let populated = false;
    for (const name of fs.readdirSync(absolute)) populated = visit(relative + '/' + name) || populated;
    if (!populated) return false;
  }
  if (relative === 'Assets') return true;
  const meta = absolute + '.meta';
  if (!fs.existsSync(meta)) {
    if (checking) throw new Error('Missing .meta: ' + relative);
    const guid = createHash('md5').update('redhood-unity:' + relative).digest('hex');
    let importer = 'DefaultImporter:\n  externalObjects: {}\n';
    if (relative.endsWith('.cs')) importer = 'MonoImporter:\n  externalObjects: {}\n  serializedVersion: 2\n  defaultReferences: []\n  executionOrder: 0\n  icon: {instanceID: 0}\n';
    if (relative.endsWith('.asmdef')) importer = 'AssemblyDefinitionImporter:\n  externalObjects: {}\n';
    if (relative.endsWith('.txt')) importer = 'TextScriptImporter:\n  externalObjects: {}\n';
    if (relative.endsWith('.ttf')) importer = 'TrueTypeFontImporter:\n  externalObjects: {}\n  serializedVersion: 4\n  fontSize: 16\n  forceTextureCase: -2\n  characterSpacing: 0\n  characterPadding: 1\n  includeFontData: 1\n  fontName: Redhood UI\n  fontNames:\n  - Redhood UI\n  fallbackFontReferences: []\n  customCharacters:\n  fontRenderingMode: 0\n  ascentCalculationMode: 1\n  useLegacyBoundsCalculation: 0\n';
    fs.writeFileSync(meta, 'fileFormatVersion: 2\nguid: ' + guid + '\n' +
      (directory ? 'folderAsset: yes\n' : '') + importer +
      '  userData:\n  assetBundleName:\n  assetBundleVariant:\n');
    count++;
  }
  return true;
}
visit('Assets');
const scene = fs.readFileSync(path.join(project, 'Assets/Scenes/BattlePrototype.unity.meta'), 'utf8').match(/guid: (\w+)/)[1];
console.log('Asset metadata OK (' + count + ' created). Scene GUID: ' + scene);
