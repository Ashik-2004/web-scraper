import { JSDOM } from 'jsdom';
import woocommerce from './src/content/adapters/woocommerce.js';
import generic from './src/content/adapters/generic.js';

async function test() {
    console.log('Fetching drobonation...');
    const res = await fetch('https://drobonation.com/');
    const html = await res.text();
    const dom = new JSDOM(html);
    const document = dom.window.document;
    
    console.log('Testing WooCommerce Adapter:');
    const wooItems = woocommerce.extractProducts(document);
    console.log(`WooCommerce adapter found ${wooItems.length} items`);
    if (wooItems.length > 0) {
        console.log('Sample:', wooItems[0]);
    }
    
    console.log('Testing Generic Adapter:');
    const genItems = generic.extractProducts(document);
    console.log(`Generic adapter found ${genItems.length} items`);
    if (genItems.length > 0) {
        console.log('Sample:', genItems[0]);
    }
}

test();
