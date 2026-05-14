export default {
    extractProducts: (doc) => {
        const products = [];
        // Heuristic: Find elements that look like product cards
        // Usually contain an image, a heading, and something that looks like a price
        const allDivs = doc.querySelectorAll('div, li, article');
        
        const cards = Array.from(allDivs).filter(div => {
            const hasImg = div.querySelector('img');
            const hasHeading = div.querySelector('h1, h2, h3, h4, h5, h6, [class*="title" i], [class*="name" i]');
            const text = div.innerText || div.textContent;
            const hasPrice = text && text.match(/(\$|\€|\£|₹|Rs\.?)\s?\d+/i);
            
            // It should not be too big (e.g., the whole page)
            const isReasonableSize = text && text.trim().length > 10 && text.length < 2000;
            
            return hasImg && hasHeading && hasPrice && isReasonableSize;
        });

        // Filter out nested matches to only keep the most specific containers
        const specificCards = cards.filter(card => {
            return !cards.some(otherCard => otherCard !== card && otherCard.contains(card));
        });

        specificCards.forEach(card => {
            const titleEl = card.querySelector('h1, h2, h3, h4, h5, h6, [class*="title" i], [class*="name" i]') || card;
            const imgEl = card.querySelector('img');
            const linkEl = card.querySelector('a');
            
            // Extract price using regex
            const cardText = card.innerText || card.textContent;
            const priceMatch = cardText.match(/(\$|\€|\£|₹|Rs\.?)\s?\d+(?:,\d{3})*(?:\.\d{2})?/i);

            products.push({
                title: titleEl ? (titleEl.innerText || titleEl.textContent).trim() : 'Unknown Title',
                price: priceMatch ? priceMatch[0] : 'Unknown Price',
                image: imgEl ? (imgEl.src || imgEl.dataset?.src) : null,
                url: linkEl ? linkEl.href : null,
                source: 'generic'
            });
        });
        return products;
    },
    getNextButton: (doc) => null // Let the engine use generic heuristics
};
