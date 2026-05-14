import { startScraping, stopScraping } from './scraper_engine.js';
import { detectPlatform } from './adapters/index.js';

let isScraping = false;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Nexus Scraper Content Script received message:', message);
  if (message.action === 'INIT_SCRAPE') {
    if (isScraping) return sendResponse({ error: 'Already scraping' });
    isScraping = true;
    
    console.log("Nexus Scraper: Initializing extraction...");
    const platform = detectPlatform();
    console.log(`Nexus Scraper: Detected platform - ${platform}`);
    
    startScraping(platform, message.config).then(items => {
        isScraping = false;
        console.log("Nexus Scraper: Finished extraction", items);
    }).catch(err => {
        isScraping = false;
        console.error("Nexus Scraper Error:", err);
    });
    
    sendResponse({ status: 'initialized' });
  } else if (message.action === 'STOP_SCRAPE') {
    isScraping = false;
    stopScraping();
    sendResponse({ status: 'stopped' });
  } else if (message.action === 'PAUSE_SCRAPE') {
    pauseScraping();
    sendResponse({ status: 'paused' });
  } else if (message.action === 'RESUME_SCRAPE') {
    resumeScraping();
    sendResponse({ status: 'running' });
  }
});
