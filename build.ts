import { build } from 'esbuild';
import { promises as fs } from 'fs';
import path from 'path';

const devFlag = process.argv.includes('--dev');

const distDir = 'dist';

const distPath = (relPath: string) => path.join(distDir, relPath);

const buildExtension = async () => {
  await fs.mkdir(distPath('icons'), { recursive: true });
  await fs.mkdir(distPath('content_scripts'), { recursive: true });

  await build({
    entryPoints: ['src/content_scripts/index.ts'],
    bundle: true,
    outdir: distPath('content_scripts'),
    sourcemap: devFlag ? 'inline' : false,
  });

  await fs.copyFile('manifest.json', distPath('manifest.json'));
  await fs.copyFile('src/content_scripts/style.css', distPath('content_scripts/style.css'));
  await fs.cp('src/icons', distPath('icons'), { recursive: true });
};

buildExtension();
