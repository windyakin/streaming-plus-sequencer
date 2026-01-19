export default {
  sourceDir: './dist',
  artifactsDir: './web-ext-artifacts',
  build: {
    overwriteDest: true,
    filename: 'streaming-plus-sequencer-{version}.zip'
  },
  run: {
    startUrl: ['https://live.eplus.jp/'],
    browserConsole: true
  }
};
