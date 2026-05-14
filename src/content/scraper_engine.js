import { paginate } from './pagination_crawler.js';
import adapters from './adapters/index.js';
import { scrapeQueue } from './queue_engine.js';
import { clearDuplicates, getDuplicatesCount, preloadDuplicates } from './duplicate_cleaner.js';

let shouldStop = false;

export async function startScraping(platform, config = {}) {
    shouldStop = false;
    clearDuplicates();
    if (config.preloadedDuplicates) {
        preloadDuplicates(config.preloadedDuplicates);
    }
    scrapeQueue.clear();
    
    let pageCount = 0;
    const maxPages = config.maxPages || 10;

    const adapter = adapters[platform] || adapters['generic'];
    
    // Set up queue callbacks
    scrapeQueue.onItemCompleted = (finalProduct, stats) => {
        chrome.runtime.sendMessage({ 
            action: 'SAVE_SCRAPED_ITEMS', 
            items: [finalProduct],
            stats: { ...stats, duplicates: getDuplicatesCount() }
        });
    };
    
    scrapeQueue.onQueueEmpty = () => {
        // Called when all queued items are processed
        if (shouldStop || pageCount >= maxPages) {
            console.log(`Nexus Scraper: Finished deep scraping.`);
            chrome.runtime.sendMessage({ 
                action: 'SCRAPE_FINISHED', 
                stats: { ...scrapeQueue.getStats(), duplicates: getDuplicatesCount() }
            });
        }
    };

    scrapeQueue.resume();

    while (!shouldStop && pageCount < maxPages) {
        console.log(`Nexus Scraper: Scraping page ${pageCount + 1}... using ${platform} adapter`);
        
        await new Promise(r => setTimeout(r, 2000));
        
        try {
            const items = adapter.extractProducts(document);
            console.log(`Nexus Scraper: Found ${items.length} items on this page.`);
            
            if (items.length > 0) {
                items.forEach(item => {
                    scrapeQueue.enqueue(item);
                });
                // Update UI with duplicates count immediately
                chrome.runtime.sendMessage({ 
                    action: 'UPDATE_STATS', 
                    stats: { ...scrapeQueue.getStats(), duplicates: getDuplicatesCount() }
                });
            } else {
                console.log("Nexus Scraper: No items found on this page.");
                break;
            }

            const hasNext = await paginate(document, adapter);
            if (!hasNext) {
                console.log("Nexus Scraper: No more pages detected.");
                break;
            }
            pageCount++;
        } catch (err) {
            console.error('Nexus Scraper Adapter/Pagination Error:', err);
            break;
        }
    }

    console.log(`Nexus Scraper: Finished category crawling. Waiting for deep scraping queue to finish...`);
    // If queue is empty right now, trigger finish
    if (scrapeQueue.queue.length === 0 && scrapeQueue.active === 0) {
         chrome.runtime.sendMessage({ 
             action: 'SCRAPE_FINISHED', 
             stats: { ...scrapeQueue.getStats(), duplicates: getDuplicatesCount() }
         });
         
         if (getDuplicatesCount() > 0 && scrapeQueue.completedItems.length === 0) {
             alert("Nexus Scraper: No new products found! All items matched your existing CSV.");
         } else if (getDuplicatesCount() === 0 && scrapeQueue.completedItems.length === 0) {
             alert("Nexus Scraper: No products found on this page.");
         }
    }
}

export function stopScraping() {
    shouldStop = true;
    scrapeQueue.stop();
}

export function pauseScraping() {
    shouldStop = true; // Stop crawling further pages
    scrapeQueue.pause();
}

export function resumeScraping() {
    shouldStop = false;
    scrapeQueue.resume();
}
