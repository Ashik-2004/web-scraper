// Service Worker for Nexus Scraper

chrome.runtime.onInstalled.addListener(() => {
  console.log("Nexus Scraper installed.");
});

// Manage scraping state
let scrapingSessions = {};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'START_SCRAPING') {
    const tabId = message.tabId || sender.tab?.id;
    if (tabId) {
      scrapingSessions[tabId] = { status: 'running', items: [], config: message.config, stats: {} };
      chrome.tabs.sendMessage(tabId, { action: 'INIT_SCRAPE', config: message.config }).catch(() => {});
      sendResponse({ status: 'started' });
    }
  } else if (message.action === 'STOP_SCRAPING') {
    const tabId = message.tabId || sender.tab?.id;
    if (tabId && scrapingSessions[tabId]) {
      scrapingSessions[tabId].status = 'stopped';
      chrome.tabs.sendMessage(tabId, { action: 'STOP_SCRAPE' }).catch(() => {});
      sendResponse({ status: 'stopped' });
    }
  } else if (message.action === 'PAUSE_SCRAPING') {
    const tabId = message.tabId || sender.tab?.id;
    if (tabId && scrapingSessions[tabId]) {
      scrapingSessions[tabId].status = 'paused';
      chrome.tabs.sendMessage(tabId, { action: 'PAUSE_SCRAPE' }).catch(() => {});
      sendResponse({ status: 'paused' });
    }
  } else if (message.action === 'RESUME_SCRAPING') {
    const tabId = message.tabId || sender.tab?.id;
    if (tabId && scrapingSessions[tabId]) {
      scrapingSessions[tabId].status = 'running';
      chrome.tabs.sendMessage(tabId, { action: 'RESUME_SCRAPE' }).catch(() => {});
      sendResponse({ status: 'running' });
    }
  } else if (message.action === 'SAVE_SCRAPED_ITEMS') {
    const tabId = sender.tab?.id;
    if (tabId && scrapingSessions[tabId]) {
      scrapingSessions[tabId].items.push(...message.items);
      if (message.stats) scrapingSessions[tabId].stats = message.stats;
      // Persist to local storage
      chrome.storage.local.set({ latestScrape: scrapingSessions[tabId].items });
      sendResponse({ saved: true, total: scrapingSessions[tabId].items.length });
    }
  } else if (message.action === 'UPDATE_STATS') {
    const tabId = sender.tab?.id;
    if (tabId && scrapingSessions[tabId]) {
      if (message.stats) scrapingSessions[tabId].stats = message.stats;
    }
  } else if (message.action === 'CLEAR_DATA') {
    const tabId = message.tabId || sender.tab?.id;
    if (tabId && scrapingSessions[tabId]) {
      scrapingSessions[tabId].items = [];
      scrapingSessions[tabId].stats = {};
    }
    chrome.storage.local.remove('latestScrape');
    sendResponse({ cleared: true });
  } else if (message.action === 'SCRAPE_FINISHED') {
    const tabId = sender.tab?.id;
    if (tabId && scrapingSessions[tabId]) {
      scrapingSessions[tabId].status = 'stopped';
      if (message.stats) scrapingSessions[tabId].stats = message.stats;
    }
  } else if (message.action === 'GET_STATUS') {
     const tabId = message.tabId;
     sendResponse({ session: scrapingSessions[tabId] || { status: 'idle', items: [], stats: {} }});
  }
  return true; // Keep message channel open for async
});
