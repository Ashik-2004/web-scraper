export default {
    extractProducts: (doc) => {
        const products = [];
        // WooCommerce standard product cards
        const cards = doc.querySelectorAll('.product, .type-product, li.product');
        
        cards.forEach(card => {
            const titleEl = card.querySelector('.woocommerce-loop-product__title, h2, h3, .product-title');
            const priceEl = card.querySelector('.price del, .price .amount:not(ins .amount)');
            const salePriceEl = card.querySelector('.price ins .amount');
            const imgEl = card.querySelector('img');
            const linkEl = card.querySelector('a.woocommerce-LoopProduct-link, a');
            const skuEl = card.querySelector('.sku');

            if (titleEl && imgEl) {
                products.push({
                    title: (titleEl.innerText || titleEl.textContent).trim(),
                    price: priceEl ? (priceEl.innerText || priceEl.textContent).replace(/\n/g, ' ').trim() : 'Unknown Price',
                    salePrice: salePriceEl ? (salePriceEl.innerText || salePriceEl.textContent).replace(/\n/g, ' ').trim() : null,
                    sku: skuEl ? skuEl.innerText.trim() : null,
                    image: imgEl.src || imgEl.srcset || imgEl.getAttribute('data-src') || null,
                    url: linkEl ? linkEl.href : null,
                    source: 'woocommerce'
                });
            }
        });
        return products;
    },
    getNextButton: (doc) => {
        return doc.querySelector('a.next, .woocommerce-pagination a.next');
    }
};
