const seenUrls = new Set();
const seenSkus = new Set();
const seenTitles = new Set();
let duplicatesCount = 0;

export function clearDuplicates() {
    seenUrls.clear();
    seenSkus.clear();
    seenTitles.clear();
    duplicatesCount = 0;
}

export function preloadDuplicates(data) {
    if (data.urls) data.urls.forEach(url => seenUrls.add(url));
    if (data.skus) data.skus.forEach(sku => seenSkus.add(sku));
    if (data.titles) {
        data.titles.forEach(title => {
            const normalized = title.toLowerCase().replace(/[^a-z0-9]/g, '');
            if (normalized) seenTitles.add(normalized);
        });
    }
}

export function isDuplicate(product) {
    if (product.url && seenUrls.has(product.url)) {
        duplicatesCount++;
        return true;
    }
    if (product.sku && seenSkus.has(product.sku)) {
        duplicatesCount++;
        return true;
    }
    
    // Normalize title: remove spaces, lowercase
    const normalizedTitle = product.title ? product.title.toLowerCase().replace(/[^a-z0-9]/g, '') : null;
    if (normalizedTitle && seenTitles.has(normalizedTitle)) {
        duplicatesCount++;
        return true;
    }

    if (product.url) seenUrls.add(product.url);
    if (product.sku) seenSkus.add(product.sku);
    if (normalizedTitle) seenTitles.add(normalizedTitle);

    return false;
}

export function getDuplicatesCount() {
    return duplicatesCount;
}
