# Nexus Scraper - AI Web Extraction

Nexus Scraper is a universal, AI-powered Chrome Extension designed for seamless and efficient eCommerce web scraping. It automatically extracts product information, manages pagination, and handles deep product scraping from various platforms.

## Features

- **Universal Scraping**: Extract product details (titles, prices, images, descriptions) from any eCommerce site.
- **Platform Specific Adapters**: Built-in support and optimized extraction for major platforms like Shopify and WooCommerce.
- **Deep Scraping**: Navigate into individual product pages to extract comprehensive descriptions and metadata.
- **Pagination Crawling**: Automatically traverse through category pages to queue and scrape multiple products.
- **Duplicate Prevention**: Intelligently identifies and skips previously scraped products.
- **Export Capabilities**: Easily export extracted data to CSV or Excel formats.

## Tech Stack

- **Framework**: React 19
- **Build Tool**: Vite
- **Styling**: Tailwind CSS & Framer Motion
- **Data Processing**: PapaParse, XLSX
- **Extension Tooling**: @crxjs/vite-plugin

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Ashik-2004/web-scraper.git
   cd web-scraper
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the extension:
   ```bash
   npm run build
   ```

4. Load into Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" in the top right corner
   - Click "Load unpacked" and select the `dist` folder generated after the build.

## Development

Run the development server with HMR:
```bash
npm run dev
```
*(Note: You will need to load the extension as unpacked from the output directory for live updates in Chrome)*
