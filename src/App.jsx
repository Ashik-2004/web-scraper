import React, { useEffect, useState } from 'react';
import { Play, Square, Download, Database, Settings, Loader, Trash2, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { exportToCSV, exportToJSON, exportToExcel } from './utils/export.js';
import Papa from 'papaparse';

function App() {
  const [status, setStatus] = useState('idle');
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({ queued: 0, active: 0, completed: 0, failed: 0, duplicates: 0 });
  const [currentTab, setCurrentTab] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [config, setConfig] = useState({ maxPages: 5, concurrency: 3 });

  useEffect(() => {
    // Get active tab
    chrome.tabs?.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        setCurrentTab(tabs[0]);
        // Request status from background
        chrome.runtime.sendMessage({ action: 'GET_STATUS', tabId: tabs[0].id }, (response) => {
          if (response && response.session) {
            setStatus(response.session.status);
            setItems(response.session.items || []);
            if (response.session.stats) setStats(response.session.stats);
          }
        });
      }
    });

    // Listen for incoming items from background
    const messageListener = (message) => {
      if (message.action === 'SAVE_SCRAPED_ITEMS') {
          setItems(prev => {
            const newItems = message.items.filter(newItem => !prev.some(existing => existing.url === newItem.url));
            return [...prev, ...newItems];
          });
          if (message.stats) setStats(message.stats);
      } else if (message.action === 'STOP_SCRAPE' || message.status === 'stopped' || message.action === 'SCRAPE_FINISHED') {
          setStatus('stopped');
          if (message.stats) setStats(message.stats);
      } else if (message.action === 'UPDATE_STATS') {
          if (message.stats) setStats(message.stats);
      } else if (message.action === 'DATA_CLEARED') {
          setItems([]);
          setStats({ queued: 0, active: 0, completed: 0, failed: 0, duplicates: 0 });
      }
    };
    chrome.runtime?.onMessage.addListener(messageListener);
    
    // Check local storage for previous scrape
    chrome.storage?.local.get(['latestScrape'], (result) => {
      if (result.latestScrape && items.length === 0) {
        setItems(result.latestScrape);
      }
    });

    return () => chrome.runtime?.onMessage.removeListener(messageListener);
  }, []);

  const handleStart = () => {
    if (!currentTab) return;
    setStatus('running');
    chrome.runtime.sendMessage({
      action: 'START_SCRAPING',
      tabId: currentTab.id,
      config: config
    });
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      complete: (results) => {
        const data = results.data;
        const preloaded = { urls: [], skus: [], titles: [] };
        
        data.forEach(row => {
          const url = row['Source URL'] || row['URL'] || row['url'];
          const sku = row['SKU'] || row['sku'];
          const title = row['Name'] || row['Title'] || row['title'];
          
          if (url) preloaded.urls.push(url);
          if (sku) preloaded.skus.push(sku);
          if (title) preloaded.titles.push(title);
        });
        
        setConfig(prev => ({ ...prev, preloadedDuplicates: preloaded }));
      }
    });
  };

  const handleStop = () => {
    if (!currentTab) return;
    setStatus('stopped');
    chrome.runtime.sendMessage({
      action: 'STOP_SCRAPING',
      tabId: currentTab.id
    });
  };

  const handlePause = () => {
    if (!currentTab) return;
    setStatus('paused');
    chrome.runtime.sendMessage({ action: 'PAUSE_SCRAPING', tabId: currentTab.id });
  };

  const handleResume = () => {
    if (!currentTab) return;
    setStatus('running');
    chrome.runtime.sendMessage({ action: 'RESUME_SCRAPING', tabId: currentTab.id });
  };

  const handleReset = () => {
    chrome.runtime.sendMessage({ action: 'CLEAR_DATA', tabId: currentTab?.id });
    setItems([]);
    setStats({ queued: 0, active: 0, completed: 0, failed: 0, duplicates: 0 });
  };

  return (
    <div className="w-[400px] h-[600px] bg-background text-foreground p-6 overflow-y-auto flex flex-col gap-6 font-sans">
      
      {/* Header */}
      <header className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Database className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-bold tracking-tight">Nexus Scraper</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={handleReset} className="p-2 rounded-full hover:bg-card transition-colors text-red-400" title="Clear All Data">
            <Trash2 className="w-5 h-5" />
          </button>
          <button onClick={() => setShowSettings(!showSettings)} className="p-2 rounded-full hover:bg-card transition-colors" title="Settings">
            <Settings className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </header>

      {/* Settings Panel */}
      {showSettings && (
        <section className="glass-panel p-4 flex flex-col gap-3 relative">
          <button onClick={() => setShowSettings(false)} className="absolute top-2 right-2 text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
          <h3 className="font-semibold text-sm mb-1">Scraper Settings</h3>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400">Max Pages to Scrape</label>
            <input type="number" value={config.maxPages} onChange={e => setConfig({...config, maxPages: Number(e.target.value)})} className="bg-background border border-card-border p-2 rounded text-sm text-white" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400">Concurrent Requests</label>
            <input type="number" value={config.concurrency} onChange={e => setConfig({...config, concurrency: Number(e.target.value)})} className="bg-background border border-card-border p-2 rounded text-sm text-white" />
          </div>
          <div className="flex flex-col gap-1 mt-2 border-t border-card-border pt-3">
            <label className="text-xs text-gray-400">Skip Existing Products (CSV)</label>
            <input type="file" accept=".csv" onChange={handleFileUpload} className="text-xs text-gray-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-primary file:text-white hover:file:bg-primary-dark cursor-pointer" />
            {config.preloadedDuplicates && (
              <span className="text-xs text-green-400 mt-1">
                ✓ Loaded {Math.max(config.preloadedDuplicates.urls.length, config.preloadedDuplicates.skus.length, config.preloadedDuplicates.titles.length)} items to avoid.
              </span>
            )}
          </div>
        </section>
      )}

      {/* Main Action Panel */}
      <section className="glass-panel p-6 flex flex-col items-center gap-4 text-center">
        <div className="text-sm text-gray-400 mb-2">
          {currentTab ? new URL(currentTab.url).hostname : 'No active tab'}
        </div>
        
        {status === 'idle' || status === 'stopped' ? (
          <button 
            onClick={handleStart}
            className="flex items-center justify-center gap-2 w-full bg-primary hover:bg-primary-dark text-white py-3 rounded-lg font-semibold transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)]"
          >
            <Play className="w-5 h-5" /> Start Auto-Extraction
          </button>
        ) : (
          <div className="flex w-full gap-2">
            {status === 'paused' ? (
              <button onClick={handleResume} className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-semibold transition-all">
                <Play className="w-5 h-5 fill-current" /> Resume
              </button>
            ) : (
              <button onClick={handlePause} className="flex-1 flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white py-3 rounded-lg font-semibold transition-all">
                <Square className="w-5 h-5" /> Pause
              </button>
            )}
            <button onClick={handleStop} className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-semibold transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)]">
              <Square className="w-5 h-5 fill-current" /> Stop
            </button>
          </div>
        )}

        {(status === 'running' || status === 'paused') && (
          <div className="flex flex-col items-center gap-1 mt-2">
            <div className="flex items-center gap-2 text-primary text-sm font-medium">
              {status === 'running' && <Loader className="w-4 h-4 animate-spin" />}
              {status === 'paused' ? 'Paused' : 'Scraping in progress...'}
            </div>
            <div className="text-xs text-gray-400">
              ETA: {stats.queued > 0 ? `${Math.ceil((stats.queued * 1.5) / 60)} min` : 'Calculating...'}
            </div>
          </div>
        )}
      </section>

      {/* Stats Panel */}
      <section className="grid grid-cols-2 gap-4">
        <div className="glass-panel p-4 flex flex-col items-center justify-center">
          <div className="text-3xl font-bold text-white mb-1">{items.length}</div>
          <div className="text-xs text-gray-400 uppercase tracking-wider">Scraped</div>
        </div>
        <div className="glass-panel p-4 flex flex-col items-center justify-center">
          <div className="text-3xl font-bold text-white mb-1">
            {stats.duplicates || 0}
          </div>
          <div className="text-xs text-gray-400 uppercase tracking-wider">Duplicates</div>
        </div>
      </section>

      {/* Export Options */}
      <section className="mt-auto">
        <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">Export Data</h3>
        <div className="flex gap-2">
          <button 
            onClick={() => exportToCSV(items)}
            disabled={items.length === 0}
            className="flex-1 flex items-center justify-center gap-2 bg-card hover:bg-card-border disabled:opacity-50 border border-card-border py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Download className="w-4 h-4" /> CSV
          </button>
          <button 
            onClick={() => exportToJSON(items)}
            disabled={items.length === 0}
            className="flex-1 flex items-center justify-center gap-2 bg-card hover:bg-card-border disabled:opacity-50 border border-card-border py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Download className="w-4 h-4" /> JSON
          </button>
          <button 
            onClick={() => exportToExcel(items)}
            disabled={items.length === 0}
            className="flex-1 flex items-center justify-center gap-2 bg-card hover:bg-card-border disabled:opacity-50 border border-card-border py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Download className="w-4 h-4" /> Excel
          </button>
        </div>
      </section>
      
      {/* Live Preview Snippet */}
      {items.length > 0 && (
         <div className="text-xs text-gray-500 mt-2 text-center bg-card p-2 rounded">
           <span className="font-semibold block text-gray-300 mb-1">Latest Item</span>
           {items[items.length - 1]?.title?.substring(0, 40)}...
         </div>
      )}

    </div>
  );
}

export default App;
