// Based on https://github.com/hiterm/web-ext-react-template
// Copyright (c) 2021 htlsne

import { build } from 'esbuild';
import { promises as fs } from 'fs';
import path from 'path';

const devFlag = process.argv.includes('--dev');
const chromeFlag = process.argv.includes('--chrome');
const firefoxFlag = process.argv.includes('--firefox');

type Browser = 'firefox' | 'chrome';

const distDir = (targetBrowser: Browser) => {
  switch (targetBrowser) {
    case 'firefox':
      return 'dist-firefox';
    case 'chrome':
      return 'dist-chrome';
  }
};

const distPath = (relPath: string, targetBrowser: Browser) =>
  path.join(distDir(targetBrowser), relPath);

const makeManifestFile = async (targetBrowser: Browser) => {
  const baseManifestJson = JSON.parse(
    await fs.readFile('manifest.json', 'utf8')
  );
  if (targetBrowser === 'firefox') {
    const firefoxJson = JSON.parse(await fs.readFile('firefox.json', 'utf8'));
    const manifestJson = { ...baseManifestJson, ...firefoxJson };
    fs.writeFile(
      distPath('manifest.json', targetBrowser),
      JSON.stringify(manifestJson, null, 1)
    );
  } else if (targetBrowser === 'chrome') {
    const chromeJson = JSON.parse(await fs.readFile('chrome.json', 'utf8'));
    const manifestJson = { ...baseManifestJson, ...chromeJson };
    fs.writeFile(
      distPath('manifest.json', targetBrowser),
      JSON.stringify(manifestJson, null, 1)
    );
  } else {
    fs.copyFile('manifest.json', distPath('manifest.json', targetBrowser));
  }
};

const buildExtension = async (targetBrowser: Browser) => {
  await fs.mkdir(distPath('icons', targetBrowser), { recursive: true });

  await fs.mkdir(distPath('service_worker', targetBrowser), { recursive: true });
  build({
    entryPoints: ['src/service_worker/index.ts'],
    bundle: true,
    outdir: distPath('service_worker', targetBrowser),
    loader: {'.css': 'text'},
    sourcemap: devFlag ? 'inline' : false,
  });

  makeManifestFile(targetBrowser);
  fs.cp('src/icons', distPath('icons', targetBrowser), { recursive: true });
};

if (firefoxFlag) {
  buildExtension('firefox');
}
if (chromeFlag) {
  buildExtension('chrome');
}
