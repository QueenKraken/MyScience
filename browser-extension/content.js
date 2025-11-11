// MyScience Browser Extension - Content Script
// Injects the MyScience button into scientific research websites

(function() {
  'use strict';

  // Configuration
  const MYSCIENCE_URL = 'https://workspace.ashaw7.replit.dev';
  
  // Get current site name for return tracking
  function getSiteName() {
    const hostname = window.location.hostname;
    if (hostname.includes('elifesciences')) return 'eLifeSciences.org';
    if (hostname.includes('sciety')) return 'Sciety.org';
    if (hostname.includes('biorxiv')) return 'bioRxiv.org';
    return 'original site';
  }

  // Generate or retrieve user ID from localStorage
  function getUserId() {
    let userId = localStorage.getItem('myscience_user_id');
    if (!userId) {
      userId = 'user_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('myscience_user_id', userId);
    }
    return userId;
  }

  // Create the floating MyScience button
  function createMyScienceButton() {
    // Check if button already exists
    if (document.getElementById('myscience-button')) {
      return;
    }

    const button = document.createElement('button');
    button.id = 'myscience-button';
    button.className = 'myscience-floating-button';
    button.setAttribute('aria-label', 'Open MyScience personalized research feed');
    button.setAttribute('role', 'button');
    button.setAttribute('tabindex', '0');
    
    // Button content with icon
    button.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <polyline points="9 22 9 12 15 12 15 22"></polyline>
      </svg>
      <span class="myscience-button-text">MyScience</span>
    `;

    // Click handler
    button.addEventListener('click', handleButtonClick);
    
    // Keyboard accessibility
    button.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleButtonClick();
      }
    });

    document.body.appendChild(button);
    console.log('MyScience button injected successfully');
  }

  // Handle button click - open MyScience in new tab
  function handleButtonClick() {
    const userId = getUserId();
    const currentUrl = window.location.href;
    const siteName = getSiteName();
    
    // Build MyScience URL with return tracking
    const myscienceUrl = `${MYSCIENCE_URL}?return=${encodeURIComponent(currentUrl)}&site=${encodeURIComponent(siteName)}&user=${encodeURIComponent(userId)}`;
    
    // Open in new tab
    window.open(myscienceUrl, '_blank');
    
    console.log('Opening MyScience:', myscienceUrl);
  }

  // Initialize the extension
  function init() {
    // Wait for DOM to be fully loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', createMyScienceButton);
    } else {
      createMyScienceButton();
    }
  }

  // Start the extension
  init();
})();
