import Papa from 'papaparse';
import { isDuplicate, preloadDuplicates, clearDuplicates, getDuplicatesCount } from '../src/content/duplicate_cleaner.js';

// Simulate CSV data
const csvData = `ID,Type,SKU,Name,Published
1,simple,SKU001,Test Product 1,1
2,simple,,Test Product 2,1`;

Papa.parse(csvData, {
    header: true,
    complete: (results) => {
        const preloaded = { urls: [], skus: [], titles: [] };
        results.data.forEach(row => {
            if (row['SKU']) preloaded.skus.push(row['SKU']);
            if (row['Name']) preloaded.titles.push(row['Name']);
        });
        
        console.log("Preloaded:", preloaded);
        clearDuplicates();
        preloadDuplicates(preloaded);
        
        const testItem = { sku: 'SKU001', title: 'Test Product 1', url: 'http://test.com/1' };
        console.log("Is duplicate?", isDuplicate(testItem));
        console.log("Duplicates count:", getDuplicatesCount());
    }
});
