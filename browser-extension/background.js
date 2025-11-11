// MyScience Browser Extension - Background Service Worker

// Listen for extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('MyScience extension installed successfully');
    
    // Open welcome page on first install
    chrome.tabs.create({
      url: 'http://localhost:5000'
    });
  } else if (details.reason === 'update') {
    console.log('MyScience extension updated to version', chrome.runtime.getManifest().version);
  }
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'openMyScience') {
    chrome.tabs.create({
      url: request.url
    });
  }
  
  return true;
});
