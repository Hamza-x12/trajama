// Create context menu on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'tarjama-translate',
    title: 'Translate with TARJAMA',
    contexts: ['selection'],
  });
});

// Handle context menu click
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'tarjama-translate' && info.selectionText) {
    // Send selected text to content script for inline translation
    chrome.tabs.sendMessage(tab.id, {
      type: 'translateInline',
      text: info.selectionText.trim(),
    });
  }
});
