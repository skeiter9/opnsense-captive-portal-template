# OPNsense 25.1 Deployment Guide

## Important Notes for OPNsense 25.1

This template is specifically designed and tested for **OPNsense 25.1**. The development mock server simulates OPNsense API behavior, but there are key differences in production:

### Key Differences: Dev Server vs. OPNsense 25.1

#### 1. **Success Page Redirect**
- **Dev Server**: Manual navigation to `/success.html?timeout=XXXX`
- **OPNsense 25.1**: Automatically redirects to success page after authentication with proper timeout parameter

#### 2. **API Endpoints**
- **Dev Server**: Mock API at `/api/captiveportal/access/`
- **OPNsense 25.1**: Real captive portal REST API with actual authentication

#### 3. **Session Management**
- **Dev Server**: Simulated sessions stored in memory
- **OPNsense 25.1**: Real session tracking with firewall integration

#### 4. **Timeout Values**
- **Dev Server**: Test codes (HR001=1hr, DY001=1day, WK001=1week, MO001=1month)
- **OPNsense 25.1**: Actual voucher durations configured in OPNsense admin panel

### Common OPNsense Deployment Issues

#### Issue: Blank White Screen with "Success" Text
**Cause**: OPNsense may be displaying a simple success message instead of loading the custom success.html template.

**Solution**:
1. Verify that `success.html` is uploaded to the correct template directory
2. Check OPNsense Captive Portal settings → Template dropdown is set to your custom template
3. Ensure the template folder structure is correct:
   ```
   /usr/local/etc/inc/captiveportal/template/your-template-name/
   ├── index.html
   ├── success.html
   ├── css/
   ├── js/
   ├── langs/
   └── ...
   ```

#### Issue: Widget Not Appearing After Login
**Cause**: The success page may not be receiving the timeout parameter from OPNsense.

**Solutions**:
1. Check OPNsense version (must be 25.1 or compatible)
2. Verify captive portal configuration passes session timeout to success page
3. Check browser console for JavaScript errors
4. Confirm success.html is being loaded (not default OPNsense success page)

#### Issue: Access Codes Not Working
**Cause**: OPNsense voucher system requires specific username/password format.

**Solution**:
The 5-character access code system splits as follows:
- First 2 characters = username
- Last 3 characters = password
- Example: `DY001` → username: `DY`, password: `001`

This matches OPNsense voucher system requirements.

### Uploading Template to OPNsense 25.1

#### Method 1: Web Interface
1. Navigate to: **Services → Captive Portal → Templates**
2. Click **Upload Template**
3. Select the ZIP file containing all template files
4. Activate the template in Captive Portal settings

#### Method 2: SSH/Shell
1. Connect to OPNsense via SSH
2. Navigate to template directory:
   ```bash
   cd /usr/local/etc/inc/captiveportal/template/
   ```
3. Create your template folder:
   ```bash
   mkdir burbase-guest
   cd burbase-guest
   ```
4. Upload all files (index.html, success.html, css/, js/, langs/, etc.)
5. Set proper permissions:
   ```bash
   chown -R root:wheel /usr/local/etc/inc/captiveportal/template/burbase-guest
   chmod -R 755 /usr/local/etc/inc/captiveportal/template/burbase-guest
   ```

### Required Files for OPNsense

**Mandatory files**:
- ✅ `index.html` - Main login page
- ✅ `success.html` - Post-authentication page with widget
- ✅ `css/master.css` - Main stylesheet (imports all other CSS)
- ✅ `js/api.js` - Main JavaScript logic
- ✅ `langs/en.json` - English translations
- ✅ `langs/es.json` - Spanish translations
- ✅ `config/settings.json` - Configuration settings

**Optional but recommended**:
- `css/*.css` - All styling files
- `js/*.js` - All JavaScript libraries
- `img/*` - Images and logos
- `fonts/*` - Custom fonts

### Configuring OPNsense Captive Portal

1. **Services → Captive Portal → Zones**
2. Select your zone (or create new one)
3. **Settings tab**:
   - Enable captive portal
   - Set authentication method to "Vouchers" or "Local Database"
4. **Template tab**:
   - Select your uploaded template
   - Set redirect URL (optional)
5. **Vouchers tab** (if using voucher authentication):
   - Configure voucher validity periods (1 hour, 1 day, 1 week, 1 month)
   - Generate vouchers
6. **Save** and **Apply Changes**

### Testing on OPNsense

1. **Connect device to captive portal network**
2. **Verify login page loads** - Should see custom template, not default
3. **Test authentication**:
   - Enter 5-character voucher code
   - Accept terms
   - Click LOG IN
4. **Verify success page**:
   - Should redirect to success.html (not blank "Success" screen)
   - Widget should appear in bottom-right after 1 second
   - Countdown should show remaining time
   - Ticket type should display correctly
5. **Test widget functionality**:
   - Verify countdown updates every second
   - Test close button (×)
   - Wait for expiration (or use short-duration voucher)

### Troubleshooting OPNsense Issues

#### Debug Mode
Enable OPNsense logging to see captive portal activity:
1. **System → Log Files → General**
2. Filter for "captiveportal"
3. Check for authentication errors, API calls, and template loading issues

#### Browser Developer Tools
1. Open DevTools (F12)
2. **Console tab** - Check for JavaScript errors
3. **Network tab** - Verify success.html loads correctly
4. **Elements tab** - Confirm widget HTML is present

#### Common Error Messages

**"Invalid credentials"**
- Voucher may be expired or already used
- Check OPNsense voucher database
- Verify code format (2-char username + 3-char password)

**"Session expired"**
- Normal behavior when voucher time runs out
- Widget will show 00:00:00 and reload page
- User must re-authenticate with new voucher

**"Connection failed"**
- Network connectivity issue
- Check firewall rules
- Verify captive portal interface is active

### Widget Behavior on OPNsense

The floating countdown widget:
- ✅ Automatically appears 1 second after success.html loads
- ✅ Reads session timeout from URL parameter (`?timeout=XXXX`)
- ✅ Updates countdown every second
- ✅ Shows ticket type based on timeout value:
  - 3600 seconds = "1 Hour"
  - 86400 seconds = "1 Day"
  - 604800 seconds = "1 Week"
  - 2592000 seconds = "1 Month"
- ✅ Auto-reloads page when timer reaches 00:00:00
- ✅ Can be closed by user (click × button)

### Differences from Development Environment

| Feature | Development Server | OPNsense 25.1 |
|---------|-------------------|---------------|
| Success redirect | Manual | Automatic |
| Timeout parameter | Manual in URL | Auto from session |
| Widget trigger | URL parameter | Session timeout |
| Authentication | Mock/simulated | Real vouchers |
| Session tracking | Browser storage | Firewall rules |
| Logout | Simulated | Firewall disconnect |

### Security Considerations

1. **HTTPS**: Consider enabling HTTPS for captive portal (OPNsense supports this)
2. **Session security**: OPNsense handles session management securely
3. **Voucher security**: Store voucher codes securely
4. **User privacy**: Success page makes external API call to ipify.org for IP display
   - This can be disabled by removing the fetch() call in success.html
   - Or replace with internal IP from OPNsense

### Support

If the template doesn't work as expected on OPNsense 25.1:
1. Verify OPNsense version compatibility
2. Check template file permissions
3. Review OPNsense logs for errors
4. Test with default OPNsense template first to rule out network issues
5. Compare behavior with development server

---

**Template Version**: 2.1.0  
**Tested on**: OPNsense 25.1  
**Last Updated**: November 11, 2025
