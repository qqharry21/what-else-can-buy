const GOOGLE_ORIGIN = 'https://www.google.com';

chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setOptions({ path: 'index.html' });
});

chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(console.error);

chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => {
  if (!tab.url) return;
  const url = new URL(tab.url);
  if (url.origin === GOOGLE_ORIGIN) {
    await chrome.sidePanel.setOptions({ tabId, enabled: true, path: 'index.html' });
  } else {
    await chrome.sidePanel.setOptions({ tabId, enabled: false });
  }
});
