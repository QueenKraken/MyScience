# MyScience Testing Guide

## Manual Testing Checklist

### Browser Extension Testing

#### Installation Verification
- [ ] Extension loads successfully in Chrome/Edge (Developer Mode)
- [ ] Extension loads successfully in Firefox (Temporary Add-on)
- [ ] Extension icons display correctly in extensions list
- [ ] No console errors on extension load

#### Button Injection
- [ ] Visit elifesciences.org - button appears in bottom-right
- [ ] Visit sciety.org - button appears in bottom-right
- [ ] Visit biorxiv.org - button appears in bottom-right
- [ ] Button has purple gradient background
- [ ] Button text "MyScience" is visible on desktop
- [ ] Button shows only icon on mobile/small screens

#### Accessibility
- [ ] Button is keyboard focusable (Tab key)
- [ ] Button activates on Enter key
- [ ] Button activates on Space key
- [ ] Button has visible focus ring
- [ ] Screen reader announces "Open MyScience personalized research feed"
- [ ] Reduced motion preference is respected

#### User ID Generation
- [ ] Open browser DevTools → Application → Local Storage
- [ ] Visit a supported research site
- [ ] Verify `myscience_user_id` is created in localStorage
- [ ] User ID format matches `user_[alphanumeric]`
- [ ] Same user ID persists across page reloads
- [ ] Same user ID used across different research sites

### Web Application Testing

#### Initial Load
- [ ] Navigate to http://localhost:5000
- [ ] Page loads without errors
- [ ] "MyScience" brand name displays with gradient
- [ ] Dark/light theme toggle works
- [ ] Empty state shows "Welcome to MyScience!"

#### Extension Integration
- [ ] Click MyScience button from a research site
- [ ] New tab opens to MyScience app
- [ ] URL includes `?return=[original URL]&site=[site name]&user=[user ID]`
- [ ] "Return to [site name]" button appears in header
- [ ] Click return button → original article opens in new tab
- [ ] MyScience tab remains open (not replaced)

#### User Profile API
- [ ] Open browser DevTools → Network tab
- [ ] Load MyScience page
- [ ] Verify `GET /api/user/[userId]` returns 200
- [ ] User profile is created on first visit
- [ ] Same profile retrieved on subsequent visits within session

#### Save Articles Feature
- [ ] Click "Save" button on any article card
- [ ] Verify network request `POST /api/saved-articles` returns 201
- [ ] Saved article appears in feed
- [ ] Saved count in hero section increments
- [ ] Reload page → saved articles persist (within server session)

#### Search Functionality
- [ ] Type in search box
- [ ] Articles filter in real-time
- [ ] Search matches title, abstract, and authors
- [ ] Empty state shows when no matches found
- [ ] Clear search → all articles return

### Data Persistence Testing

#### Within Server Session (In-Memory Storage)
- [ ] Save an article
- [ ] Reload MyScience page → article still appears
- [ ] User ID remains consistent
- [ ] Profile data persists

#### Across Server Restarts
⚠️ **Expected Behavior**: Data is lost when server restarts
- [ ] Save an article
- [ ] Stop server (Ctrl+C)
- [ ] Restart server (`npm run dev`)
- [ ] Reload page → saved articles are gone ✓ (expected)
- [ ] User ID in localStorage still exists ✓ (expected)
- [ ] New profile is created with same user ID ✓ (expected)

### Error Handling

#### Network Errors
- [ ] Stop server
- [ ] Try to load MyScience page
- [ ] Verify graceful handling (no infinite loading)
- [ ] Restart server
- [ ] Page recovers without manual reload

#### Invalid Data
- [ ] Open DevTools → Console
- [ ] Try to save article with missing fields
- [ ] Verify error is logged
- [ ] App continues to function

### Cross-Browser Testing

#### Chrome/Edge
- [ ] All features work
- [ ] Extension installs correctly
- [ ] No console errors

#### Firefox
- [ ] All features work
- [ ] Extension installs correctly
- [ ] No console errors

### Accessibility Testing

#### Keyboard Navigation
- [ ] Tab through all interactive elements
- [ ] All buttons and inputs are focusable
- [ ] Focus order is logical
- [ ] Focus indicators are visible
- [ ] No keyboard traps

#### Screen Reader
- [ ] All buttons have descriptive labels
- [ ] Article cards announce title and metadata
- [ ] Loading states are announced
- [ ] Error messages are announced

## Known Limitations (MVP)

### Data Persistence
- **In-memory storage only**: All saved articles and profile data are lost when the server restarts
- **No database**: This is intentional for the prototype phase
- **localStorage only**: User ID persists in browser but not synced across devices

### Mock Data
- Article recommendations are hardcoded mock data
- Topics and activity widgets show placeholder content
- Real recommendation engine not yet implemented

### Features Not Yet Implemented
- ORCID authentication
- Sciety API integration
- User profile editing
- Article annotations
- Email notifications
- Cross-device sync
- Production database

## Testing After Future Changes

### When Adding Database
- [ ] Saved articles persist across server restarts
- [ ] User profiles persist across server restarts
- [ ] Database migrations run successfully
- [ ] Data integrity is maintained

### When Adding ORCID
- [ ] OAuth flow completes successfully
- [ ] ORCID is saved to user profile
- [ ] ORCID is displayed in UI
- [ ] User can disconnect ORCID

### When Adding Real Recommendations
- [ ] Mock data is removed
- [ ] Real API calls return recommendations
- [ ] Recommendations update based on user activity
- [ ] Performance is acceptable with large datasets
