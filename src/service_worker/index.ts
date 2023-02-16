import browser from 'webextension-polyfill';
import executeScript from '../execute_script/script'
import insertCSS from '../execute_script/style.css'

browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) =>{
  if (changeInfo.status === 'complete') {
    console.log(tabId, changeInfo, tab);
    browser.scripting.executeScript({
      target: { tabId },
      func: executeScript
    });
    browser.scripting.insertCSS({
      target: { tabId },
      css: insertCSS
    })
  }
});
