import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distPath = path.resolve(__dirname, 'dist');
const manifestPath = path.join(distPath, 'manifest.json');

if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    
    // Find the actual service worker file
    if (manifest.background && manifest.background.service_worker === 'service-worker-loader.js') {
        const loaderPath = path.join(distPath, 'service-worker-loader.js');
        if (fs.existsSync(loaderPath)) {
            const loaderContent = fs.readFileSync(loaderPath, 'utf8');
            // Extract the actual path from import './assets/service_worker.js-hash.js';
            const match = loaderContent.match(/import\s+['"]\.\/([^'"]+)['"]/);
            if (match && match[1]) {
                manifest.background.service_worker = match[1];
                delete manifest.background.type; // Remove type="module" which causes errors in some Chrome versions
                fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
                console.log('Patched manifest.json to use actual service worker without type module:', match[1]);
            }
        }
    }
} else {
    console.log('manifest.json not found in dist/');
}
