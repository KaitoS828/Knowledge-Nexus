import { Readability } from '@mozilla/readability';

console.log('Nexus Clipper Content Script Loaded');

chrome.runtime.onMessage.addListener((request, _, sendResponse) => {
  if (request.action === "extract") {
    try {
        // Clone document to avoid modifying the actual page
        const documentClone = document.cloneNode(true) as Document;
        const reader = new Readability(documentClone);
        const article = reader.parse();

        const title = article?.title || document.title;
        const url = window.location.href;
        
        // Use textContent for cleaner AI analysis
        const content = article?.textContent || document.body.innerText;

        sendResponse({ title, url, content });
    } catch (e) {
        console.error("Readability failed", e);
        // Fallback
        sendResponse({ 
            title: document.title, 
            url: window.location.href, 
            content: document.body.innerText.substring(0, 10000) 
        });
    }
  }
});
