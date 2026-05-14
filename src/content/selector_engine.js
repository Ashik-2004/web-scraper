export function generateSelectors(element) {
    if (element.id) return `#${element.id}`;
    if (element.className && typeof element.className === 'string') {
        const classes = element.className.split(' ').filter(c => c.length > 0 && !c.includes('hover') && !c.includes('active'));
        if (classes.length > 0) return `.${classes.join('.')}`;
    }
    return element.tagName.toLowerCase();
}

export function extractText(doc, selectors) {
    for (const selector of selectors) {
        const el = doc.querySelector(selector);
        if (el) {
            const text = (el.innerText || el.textContent || '').trim();
            // To prevent picking up just a tab heading like "Description"
            // if we have multiple selectors, we might want to ensure it has some length, 
            // but for now, we just return the first valid text.
            if (text && text.length > 0 && text.toLowerCase() !== 'description') {
                return text;
            }
        }
    }
    return null;
}

export function extractImage(doc, selectors) {
    for (const selector of selectors) {
        const el = doc.querySelector(selector);
        if (el) {
            const src = el.src || el.getAttribute('data-src') || el.getAttribute('srcset') || el.href;
            if (src) return src;
        }
    }
    return null;
}

export function extractImages(doc, selectors) {
    const images = [];
    for (const selector of selectors) {
        const els = doc.querySelectorAll(selector);
        els.forEach(el => {
            const src = el.src || el.getAttribute('data-src') || el.getAttribute('srcset') || el.href;
            if (src && !images.includes(src)) images.push(src);
        });
        if (images.length > 0) break; // found some images using this selector
    }
    return images;
}

export function extractDeepProductData(doc, url) {
    const data = {};

    // 1. Descriptions (Full & Short)
    data.description = extractText(doc, [
        '#tab-description', '.woocommerce-Tabs-panel--description', '.product-description', 
        '[itemprop="description"]', '.rte', '.product-single__description', 
        '.desc', '.description'
    ]);
    data.shortDescription = extractText(doc, [
        '.woocommerce-product-details__short-description', '.product-short-description',
        '.short-description'
    ]);

    // 2. Specifications & Technical Details
    data.specifications = extractText(doc, [
        '#tab-additional_information', '.shop_attributes', '.product-specs', 
        '.technical-details', '.specifications'
    ]);

    // 3. Images (Gallery)
    data.galleryImages = extractImages(doc, [
        '.woocommerce-product-gallery__image a', '.product-single__thumbnails img',
        '.product-gallery img', '.gallery img'
    ]);

    // 4. Meta Data (Categories, Tags, Breadcrumbs)
    data.categories = extractText(doc, ['.posted_in', '.product-category', '.breadcrumb']);
    data.tags = extractText(doc, ['.tagged_as', '.product-tags']);
    
    // Fallback: Meta description
    const metaDesc = doc.querySelector('meta[name="description"]');
    if (metaDesc && !data.description) {
        data.description = metaDesc.content;
    }

    return data;
}
