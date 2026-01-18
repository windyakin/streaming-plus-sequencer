import { build, context } from 'esbuild';
import { promises as fs } from 'fs';
import { watch } from 'fs';
import path from 'path';

const watchFlag = process.argv.includes('--watch');
const devFlag = process.argv.includes('--dev') || watchFlag;

const distDir = 'dist';

const distPath = (relPath: string) => path.join(distDir, relPath);

const copyStaticFiles = async () => {
  await fs.copyFile('manifest.json', distPath('manifest.json'));
  await fs.copyFile('src/content_scripts/style.css', distPath('content_scripts/style.css'));
  await fs.cp('src/icons', distPath('icons'), { recursive: true });
};

const buildExtension = async () => {
  await fs.mkdir(distPath('icons'), { recursive: true });
  await fs.mkdir(distPath('content_scripts'), { recursive: true });

  if (watchFlag) {
    const ctx = await context({
      entryPoints: ['src/content_scripts/index.ts'],
      bundle: true,
      outdir: distPath('content_scripts'),
      sourcemap: 'inline',
    });

    await ctx.watch();
    console.log('Watching for TypeScript changes...');

    await copyStaticFiles();

    watch('src/content_scripts/style.css', async () => {
      await fs.copyFile('src/content_scripts/style.css', distPath('content_scripts/style.css'));
      console.log('Copied style.css');
    });

    watch('manifest.json', async () => {
      await fs.copyFile('manifest.json', distPath('manifest.json'));
      console.log('Copied manifest.json');
    });
  } else {
    await build({
      entryPoints: ['src/content_scripts/index.ts'],
      bundle: true,
      outdir: distPath('content_scripts'),
      sourcemap: devFlag ? 'inline' : false,
    });

    await copyStaticFiles();
  }
};

buildExtension();
