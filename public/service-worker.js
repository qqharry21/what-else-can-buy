const AMAZON_ORIGIN = 'https://www.amazon.com';

chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    chrome.storage.local.set({ enabled: true });

    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    console.log('🚨 - tab', tab);
    if (tab)
      chrome.sidePanel.setOptions({
        enabled: true,
        path: 'index.html',
        tabId: tab.windowId,
      });
  }
});

chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(console.error);

chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => {
  if (!tab.url) return;
  const url = new URL(tab.url);
  if (url.origin === AMAZON_ORIGIN) {
    await chrome.sidePanel.setOptions({ tabId, enabled: true, path: 'index.html' });
  } else {
    await chrome.sidePanel.setOptions({ tabId, enabled: false });
  }
});
