# Testing Guide - Burbase Invitados Captive Portal

## Development Server Test Credentials

The development server includes mock authentication with different ticket durations for testing.

### Test Access Codes

Enter these 5-character codes in the "Access Code" field. The portal automatically splits them into username (first 2 characters) and password (last 3 characters) for OPNsense authentication.

| Access Code | Split As | Ticket Type | Duration |
|-------------|----------|-------------|----------|
| `HR001`     | User: HR, Pass: 001 | 1 Hour  | 3,600 seconds |
| `DY001`     | User: DY, Pass: 001 | 1 Day   | 86,400 seconds |
| `WK001`     | User: WK, Pass: 001 | 1 Week  | 604,800 seconds |
| `MO001`     | User: MO, Pass: 001 | 1 Month | 2,592,000 seconds |

**How it works:** When you enter "DY001", the portal sends username="DY" and password="001" to OPNsense. This matches OPNsense's expected format.

### Testing Workflow

1. **Start the development server**
   ```bash
   npm start
   ```
   Server will run on `http://localhost:5000`

2. **Access the captive portal**
   - Open `http://localhost:5000` in your browser
   - You'll see the login page

3. **Test different ticket types**
   - Login with any of the test credentials above
   - After successful authentication, you'll be redirected to the success page
   - The success page will display:
     - Connection status
     - **Ticket type** (1 Hour / 1 Day / 1 Week / 1 Month)
     - **Session duration**
     - Network name
     - Your IP address

4. **Features to verify**
   - ✅ Ticket type detection and display
   - ✅ Session timeout countdown (visible on main portal after login)
   - ✅ Bilingual support (English/Spanish)
   - ✅ Auto-redirect after 5 seconds
   - ✅ Responsive design on mobile/tablet
   - ✅ Dark forest green theme (#145214)

### Manual Testing URLs

Test the success page directly with different parameters:

- **1 Hour ticket (Spanish)**
  ```
  http://localhost:5000/success.html?timeout=3600&lang=es
  ```

- **1 Day ticket (English)**
  ```
  http://localhost:5000/success.html?timeout=86400&lang=en
  ```

- **1 Week ticket (Spanish)**
  ```
  http://localhost:5000/success.html?timeout=604800&lang=es
  ```

- **1 Month ticket (English)**
  ```
  http://localhost:5000/success.html?timeout=2592000&lang=en
  ```

## OPNsense Integration

When deployed to OPNsense:

1. The captive portal will automatically detect the session timeout from the voucher/user account
2. The success page will display the appropriate ticket type based on the timeout value
3. Session countdown will show remaining time in HH:MM:SS format
4. All features work with real OPNsense authentication

### OPNsense Configuration

1. Upload this template to OPNsense
2. Configure vouchers with different time limits:
   - 1 hour = 3600 seconds
   - 1 day = 86400 seconds
   - 1 week = 604800 seconds
   - 1 month = 2592000 seconds
3. The template will automatically detect and display the correct ticket type

## Troubleshooting

- **Success page not showing ticket info**: Check that the `redirect_url` is set to `/success.html` in `config/settings.json`
- **Session timeout not appearing**: Verify that OPNsense is sending `acc_session_timeout` in the authentication response
- **Wrong language**: Language is detected from the portal and passed via URL parameter. Check browser language settings.
