# MyScience Demo Guide

This guide will help you demonstrate the MyScience platform to others using the development environment.

## Quick Start

Your MyScience platform is now configured to work with your Replit development URL:
**`https://workspace.ashaw7.replit.dev`**

This means:
- ✅ The browser extension works with real research sites
- ✅ You can share the web app URL with anyone for testing
- ✅ Continue developing while others test
- ✅ Not publicly indexed or discoverable
- ✅ Completely free

## Demonstrating the Extension

### Step 1: Install the Extension

Follow the instructions in `browser-extension/README.md`:

**For Chrome/Edge:**
1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `browser-extension` folder
5. Extension is now installed!

**For Firefox:**
1. Open `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Select `browser-extension/manifest.json`
4. Extension is now loaded!

### Step 2: Visit a Research Site

Navigate to any of these supported sites:
- https://elifesciences.org/
- https://sciety.org/
- https://biorxiv.org/

You should see a beautiful purple floating button in the bottom-right corner labeled "MyScience".

### Step 3: Open MyScience

1. Click the floating "MyScience" button
2. A new tab opens to your personalized feed
3. Notice the "Return to [site name]" button in the header

### Step 4: Save Articles

1. Browse the article recommendations
2. Click "Save" on any article you like
3. See the toast notification confirming the save
4. The article moves to the top of your feed

### Step 5: Demonstrate Persistence

1. Reload the page
2. Your saved articles persist!
3. Try searching for articles
4. Click "Return to [site]" to go back to the original article

## Demonstrating the Web App (Without Extension)

You can also share the web app directly:

**Share this URL**: `https://workspace.ashaw7.replit.dev`

Anyone can:
- Browse article recommendations
- Save articles (creates their own user profile)
- Search and filter articles
- Experience the full MyScience interface

## Testing from Mobile Devices

1. Open your Webview panel in Replit
2. Click the URL dropdown
3. Select "Generate QR Code"
4. Scan with your mobile device
5. Test the responsive design!

## Important Notes

### While You're Developing

- **The app stays running** even while you edit code
- **Changes reflect immediately** - just refresh the browser
- **Each visitor gets their own user ID** stored in their browser's localStorage
- **Data persists** across page reloads (within the current server session)
- **Server restart clears data** (in-memory storage limitation)

### Privacy & Access

- ✅ Only people with the URL can access it
- ✅ Not indexed by search engines
- ✅ Not discoverable in Replit's public gallery
- ✅ Perfect for private demos and testing
- ⚠️ Anyone with the URL can access it (so don't share with untrusted parties)

## Demo Script

Here's a suggested script for walking someone through the demo:

> "MyScience is a personalized research discovery platform for early career researchers. Let me show you how it works.
> 
> First, I have a browser extension installed that adds a MyScience button to research sites like eLife, Sciety, and bioRxiv. [Navigate to a research site]
> 
> See this floating purple button? That's our extension. When I click it... [Click button] ...it opens my personalized MyScience feed in a new tab.
> 
> Here I can browse article recommendations tailored to my interests. If I find something interesting, I just click 'Save' [Click save] ...and it's added to my saved articles.
> 
> Notice the toast notification confirming the save. And if I want to go back to the original article, I just click this 'Return' button in the header.
> 
> The platform remembers my saved articles, so when I reload the page [Reload] ...they're still here. And I can search across all articles... [Type in search] ...to find exactly what I'm looking for.
> 
> This is still in early prototype, but we're building toward a 'Netflix for Science' experience with ORCID integration and intelligent recommendations based on reading patterns."

## Troubleshooting

### Extension button not appearing?
- Make sure you're on a supported site (eLife, Sciety, or bioRxiv)
- Check that the extension is enabled in your browser
- Try refreshing the page

### Web app not loading?
- Make sure your Replit workspace is running (check the Webview panel)
- Verify the URL is correct: `https://workspace.ashaw7.replit.dev`
- Check the console for any errors

### Saved articles not persisting?
- This is expected if the server restarted (in-memory storage)
- Within a session, saved articles should persist across page reloads
- Check the browser console for any API errors

## Next Steps

When you're ready to publish for real users:

1. Click "Publish" in your Replit workspace
2. Choose "Autoscale Deployment"
3. Get your production URL (e.g., `https://myscience.replit.app`)
4. Update the extension URL in `browser-extension/content.js`
5. Submit the extension to Chrome Web Store and Firefox Add-ons

For now, enjoy demonstrating your working prototype! 🎉
