import browser from 'webextension-polyfill';

browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) =>{
  if (changeInfo.status === 'complete') {
    console.log(tabId, changeInfo, tab);
    browser.scripting.executeScript({
      target: { tabId },
      func: () => {
        console.log('Hello');
      }
    })
  }
});
