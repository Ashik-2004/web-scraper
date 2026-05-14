import { extractDeepProductData } from './selector_engine.js';

export async function parseProductPage(url) {
    try {
        const response = await fetch(url, {
            headers: {
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'User-Agent': navigator.userAgent
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        return extractDeepProductData(doc, url);
    } catch (error) {
        console.error("Error fetching/parsing product page:", error);
        throw error;
    }
}
