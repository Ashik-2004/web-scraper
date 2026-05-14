import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export function exportToCSV(data, filename = 'scraped_data.csv') {
    // Transform data to WooCommerce format
    const transformedData = data.map(item => ({
        'Type': 'simple',
        'SKU': item.sku || '',
        'Name': item.title || '',
        'Published': 1,
        'Is featured?': 0,
        'Visibility in catalog': 'visible',
        'Short description': item.shortDescription || '',
        'Description': item.description || '',
        'In stock?': 1,
        'Stock': item.stock || '',
        'Regular price': item.price ? item.price.replace(/[^0-9.]/g, '') : '',
        'Sale price': item.salePrice ? item.salePrice.replace(/[^0-9.]/g, '') : '',
        'Categories': item.categories || '',
        'Tags': item.tags || '',
        'Images': [item.image, ...(item.galleryImages || [])].filter(Boolean).join(', '),
        'Brand': item.brand || '',
        'Source URL': item.url || ''
    }));

    const csv = Papa.unparse(transformedData);
    downloadFile(csv, filename, 'text/csv;charset=utf-8;');
}

export function exportToJSON(data, filename = 'scraped_data.json') {
    const json = JSON.stringify(data, null, 2);
    downloadFile(json, filename, 'application/json');
}

export function exportToExcel(data, filename = 'scraped_data.xlsx') {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Scraped Data");
    XLSX.writeFile(wb, filename);
}

function downloadFile(content, fileName, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }, 0);
}
