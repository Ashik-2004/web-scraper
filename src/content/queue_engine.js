import { parseProductPage } from './parser_engine.js';
import { isDuplicate } from './duplicate_cleaner.js';

class ScrapeQueue {
    constructor(concurrency = 3, delayMs = 1500) {
        this.queue = [];
        this.active = 0;
        this.concurrency = concurrency;
        this.delayMs = delayMs;
        this.isPaused = false;
        this.isStopped = false;
        this.completedItems = [];
        this.failedUrls = [];
        this.onItemCompleted = null; // Callback for when a single item is done
        this.onQueueEmpty = null;    // Callback for when queue is fully empty
    }

    enqueue(productData) {
        if (!productData.url || isDuplicate(productData)) return false;
        this.queue.push(productData);
        this.processNext();
        return true;
    }

    pause() { this.isPaused = true; }
    resume() { this.isPaused = false; this.processNext(); }
    stop() { this.isStopped = true; this.queue = []; }
    clear() {
        this.queue = [];
        this.active = 0;
        this.isPaused = false;
        this.isStopped = false;
        this.completedItems = [];
        this.failedUrls = [];
    }
    
    getStats() {
        return {
            queued: this.queue.length,
            active: this.active,
            completed: this.completedItems.length,
            failed: this.failedUrls.length
        };
    }

    async processNext() {
        if (this.isPaused || this.isStopped || this.active >= this.concurrency || this.queue.length === 0) {
            if (this.queue.length === 0 && this.active === 0 && this.onQueueEmpty) {
                this.onQueueEmpty();
            }
            return;
        }

        this.active++;
        const product = this.queue.shift();

        try {
            await new Promise(r => setTimeout(r, this.delayMs)); // Delay to prevent freezing
            const deepData = await parseProductPage(product.url);
            
            const finalProduct = { ...product, ...deepData };
            this.completedItems.push(finalProduct);
            
            if (this.onItemCompleted) {
                this.onItemCompleted(finalProduct, this.getStats());
            }
        } catch (error) {
            console.error(`Failed to scrape ${product.url}`, error);
            this.failedUrls.push({ url: product.url, error: error.message });
        } finally {
            this.active--;
            this.processNext();
        }
    }
}

export const scrapeQueue = new ScrapeQueue();
