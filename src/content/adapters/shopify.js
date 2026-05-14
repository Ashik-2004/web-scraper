export default {
    extractProducts: (doc) => {
        const products = [];
        // Shopify often uses standard class names for products
        const cards = doc.querySelectorAll('.grid-item, .product-card, .grid-view-item');
        
        cards.forEach(card => {
            const titleEl = card.querySelector('.grid-view-item__title, .product-card__title, h3');
            const priceEl = card.querySelector('.price-item--regular, .price, .product-card__price');
            const salePriceEl = card.querySelector('.price-item--sale, .sale-price');
            const imgEl = card.querySelector('img.grid-view-item__image, img.product-card__image, img');
            const linkEl = card.querySelector('a');
            const skuEl = card.querySelector('.product-sku, [data-sku]');

            products.push({
                title: titleEl ? titleEl.innerText.trim() : 'Unknown Title',
                price: priceEl ? priceEl.innerText.trim() : 'Unknown Price',
                salePrice: salePriceEl ? salePriceEl.innerText.trim() : null,
                sku: skuEl ? (skuEl.dataset.sku || skuEl.innerText.trim()) : null,
                image: imgEl ? (imgEl.src || imgEl.srcset) : null,
                url: linkEl ? linkEl.href : null,
                source: 'shopify'
            });
        });
        return products;
    },
    getNextButton: (doc) => {
        return doc.querySelector('.pagination__next, a.next');
    }
};
