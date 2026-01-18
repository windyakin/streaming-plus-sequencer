export default {
  sourceDir: './dist',
  artifactsDir: './web-ext-artifacts',
  build: {
    overwriteDest: true
  },
  run: {
    startUrl: ['https://live.eplus.jp/'],
    browserConsole: true
  }
};
