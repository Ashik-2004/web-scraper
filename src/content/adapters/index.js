import shopify from './shopify.js';
import generic from './generic.js';
import woocommerce from './woocommerce.js';

export function detectPlatform() {
    if (window.Shopify) return 'shopify';
    if (document.querySelector('meta[name="generator"][content*="WooCommerce"]') || document.body.className.includes('woocommerce')) return 'woocommerce';
    if (window.location.hostname.includes('amazon.')) return 'amazon';
    return 'generic';
}

export default {
    shopify,
    generic,
    amazon: generic, // Placeholder for specific amazon logic
    woocommerce: woocommerce
};
