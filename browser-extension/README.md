# MyScience Browser Extension

A browser extension that injects the MyScience button into scientific research websites, providing easy access to your personalized research feed.

## Supported Sites

- eLifeSciences.org
- Sciety.org
- bioRxiv.org

## Installation Instructions

### Chrome/Edge (Developer Mode)

1. Open Chrome/Edge and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked"
4. Select the `browser-extension` folder from this project
5. The MyScience extension should now appear in your extensions list

### Firefox (Temporary Installation)

1. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Navigate to the `browser-extension` folder and select `manifest.json`
4. The extension will be loaded temporarily (until Firefox is restarted)

## Features

- **Floating Button**: A beautiful, accessible floating button appears on supported research sites
- **Return Navigation**: Seamlessly return to the original article after browsing MyScience
- **User Persistence**: Automatic user ID generation for personalized experiences
- **Accessibility**: Full keyboard navigation and screen reader support
- **Responsive Design**: Adapts to different screen sizes

## Development

The extension consists of:

- `manifest.json` - Extension configuration and permissions
- `content.js` - Main script injected into research websites
- `styles.css` - Styling for the floating button
- `background.js` - Service worker for extension lifecycle events

## Configuration

The MyScience web app URL is set in `content.js`:

```javascript
const MYSCIENCE_URL = 'http://localhost:5000';
```

For production, update this to your deployed MyScience URL.

## Browser Compatibility

- Chrome: ✅ Manifest V3
- Edge: ✅ Manifest V3
- Firefox: ✅ Manifest V3 (requires Firefox 109+)
- Safari: ⚠️ Requires conversion to Safari Web Extension format

## License

Open Source - Designed for the scientific research community
