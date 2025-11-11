# Floating Time Widget - Testing Guide

## Overview
The floating countdown widget displays remaining internet time after successful login. It appears in the bottom-right corner (full-width on mobile) and updates every second.

## Features
✅ Live countdown timer (HH:MM:SS format)
✅ Ticket type display (1 Hour, 1 Day, 1 Week, 1 Month)
✅ Smooth slide-in animation
✅ Close button (user can dismiss)
✅ Auto-reload when time expires
✅ Fully responsive (desktop & mobile)
✅ Bilingual support (English & Spanish)

## Where It Appears

### 1. **success.html** (OPNsense Production)
After authentication on your OPNsense router, users are redirected to `success.html?timeout=XXXX` where the widget automatically appears.

### 2. **index.html** (Development Environment)
When testing locally with the development server, the widget appears after successful authentication.

## Testing on OPNsense Router

### Setup Instructions:
1. Upload the entire template folder to your OPNsense router
2. Configure captive portal to use this template
3. Set up vouchers with different time limits:
   - 1 Hour voucher (3600 seconds)
   - 1 Day voucher (86400 seconds)
   - 1 Week voucher (604800 seconds)
   - 1 Month voucher (2592000 seconds)

### Testing Steps:

#### Test 1: Desktop Browser
1. Connect to your captive portal WiFi
2. Open captive portal login page (should auto-appear)
3. Enter a 5-character access code (e.g., DY001 for 1 day)
4. Accept terms and click LOG IN
5. **Expected Result:**
   - Page redirects to success.html
   - After 1 second, widget slides in from the right
   - Shows countdown timer (e.g., "23:59:59")
   - Shows ticket type (e.g., "Ticket: 1 Day")
   - Timer counts down every second

#### Test 2: Mobile Phone (iOS/Android)
1. Connect to captive portal WiFi
2. Portal should auto-detect and open
3. Enter access code
4. Accept terms and login
5. **Expected Result:**
   - Widget appears at bottom (full-width on mobile)
   - Larger, touch-friendly close button
   - Countdown visible and updating
   - Widget doesn't interfere with browsing

#### Test 3: Widget Features
1. After login, verify:
   - Widget appears automatically
   - Countdown is accurate (check against session timeout)
   - Click **×** button to close widget
   - Widget disappears smoothly
   - Widget doesn't reappear after closing

#### Test 4: Session Expiration
1. Login with a short-duration voucher (e.g., 1 hour)
2. Wait for countdown to reach 00:00:00
3. **Expected Result:**
   - Widget shows 00:00:00
   - After 2 seconds, page auto-reloads
   - User is returned to login page

## URL Parameters for success.html

The success page expects these URL parameters:
- `timeout` - Session timeout in seconds (required)
- `lang` - Language code: 'en' or 'es' (optional, defaults to 'es')

**Example URLs:**
```
success.html?timeout=3600&lang=en          # 1 hour, English
success.html?timeout=86400&lang=es         # 1 day, Spanish
success.html?timeout=604800&lang=en        # 1 week, English
```

## Development Testing

### Using the Dev Server:
```bash
npm start
```

### Test with Different Timeouts:
```
http://127.0.0.1:5000/success.html?timeout=3600&lang=en     # 1 hour
http://127.0.0.1:5000/success.html?timeout=86400&lang=es    # 1 day
http://127.0.0.1:5000/success.html?timeout=60&lang=en       # 1 minute (quick test)
```

### Quick Test (1 Minute Timer):
1. Open: `http://127.0.0.1:5000/success.html?timeout=60&lang=en`
2. Widget should show "00:01:00"
3. Watch it count down to "00:00:00"
4. Page should reload after timer expires

## Troubleshooting

### Widget Not Appearing:
- **Check:** Is `timeout` parameter in URL?
- **Check:** Browser console for JavaScript errors
- **Check:** Widget might be hidden below viewport on mobile
- **Solution:** Try `?timeout=3600&lang=en` in URL

### Widget Shows Wrong Time:
- **Check:** URL parameter value matches voucher duration
- **Check:** Browser timezone settings
- **Solution:** Refresh page and verify URL parameters

### Widget Doesn't Update:
- **Check:** JavaScript enabled in browser
- **Check:** Browser console for errors
- **Solution:** Clear cache and reload page

### Widget Not Visible on Mobile:
- **Check:** Screen is scrolled to top
- **Check:** Widget might be behind keyboard
- **Solution:** Close keyboard, scroll up

## Widget Behavior

### Auto-Show Delay:
- Widget appears 1 second after page load
- Gives user time to see success message first

### Update Frequency:
- Countdown updates every 1 second
- Accurate to the second

### Session Expiry:
- When timer reaches 00:00:00
- Waits 2 seconds
- Auto-reloads page to force re-authentication

### Close Button:
- User can manually close widget anytime
- Widget won't reappear after manual close
- Countdown timer stops when closed

## CSS Customization

Widget styles are inline in success.html:
- **Position:** `bottom: 20px; right: 20px;`
- **Colors:** Dark forest green gradient (#145214, #0d3d0d)
- **Font:** Large countdown (48px desktop, 36px mobile)
- **Animation:** Slide-in from right (0.5s duration)

## Language Support

### English:
- Title: "Time Remaining"
- Tickets: "1 Hour", "1 Day", "1 Week", "1 Month"

### Spanish:
- Title: "Tiempo Restante"
- Tickets: "1 Hora", "1 Día", "1 Semana", "1 Mes"

## Production Deployment

When deploying to OPNsense:
1. Upload all files including updated success.html
2. Verify success.html is in captive portal template directory
3. Test with real voucher codes
4. Monitor user feedback

## Support

If widget isn't working:
1. Check browser console for errors
2. Verify URL has `timeout` parameter
3. Test with short timeout (60 seconds) first
4. Ensure JavaScript is enabled
5. Try different browser (Chrome, Safari, Firefox)

---

**Last Updated:** November 11, 2025
**Version:** 2.1.0
