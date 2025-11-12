# Testing Error Messages for Access Codes

## Overview
The system now displays **different error messages** for access code authentication vs. username/password authentication.

## What Changed

### Before
- All login failures showed the same generic error:
  - "Invalid username or password"
  - Solutions mentioned: Check Caps Lock, account suspended, payment issues
  - Same error whether using access code or username/password

### After
- **Access code errors** show specific troubleshooting:
  - Reasons: Invalid code, already used, expired, or typo
  - Solutions: Verify code, check if used before, request new code
- **Username/password errors** show account-related troubleshooting:
  - Reasons: Wrong credentials, Caps Lock, another device connected, account issues
  - Solutions: Check credentials, verify payment, contact support

## How to Test

### Test 1: Invalid Access Code (Too Short)
1. Go to the login page
2. Enter only 3 characters: `ABC`
3. Accept terms
4. Click **LOG IN**
5. **Expected Result**: Error modal with access code-specific message

**English Error Message:**
- Title: "Invalid username or password"
- Reasons:
  1. You entered an invalid access code
  2. The access code has already been used
  3. The access code has expired
  4. The code was entered incorrectly (check for typos)
- Solutions:
  - Double-check the access code and try again
  - Make sure you haven't used this code before
  - Request a new access code if yours has expired

**Spanish Error Message:**
- Title: "Usuario o contraseña inválidos"
- Reasons:
  1. Ingresó un código de acceso inválido
  2. El código de acceso ya ha sido utilizado
  3. El código de acceso ha expirado
  4. El código fue ingresado incorrectamente (verifique errores de escritura)
- Solutions:
  - Verifique el código de acceso e intente nuevamente
  - Asegúrese de no haber usado este código antes
  - Solicite un nuevo código de acceso si el suyo ha expirado

### Test 2: Invalid/Expired Access Code (5 Characters)
1. Enter an invalid 5-character code: `XXXXX`
2. Accept terms
3. Click **LOG IN**
4. **Expected Result**: Same access code-specific error as above

### Test 3: Valid Code (Should Work)
1. Enter a valid test code: `HR001` (1-hour ticket)
2. Accept terms
3. Click **LOG IN**
4. **Expected Result**: Redirect to success page with countdown widget

### Test 4: Language Switching
1. Switch language to **Español** (Spanish)
2. Enter invalid code: `ZZZZZ`
3. Click **INICIAR SESIÓN**
4. **Expected Result**: Error message in Spanish with access code-specific content

## Comparison: Access Code vs Username/Password Errors

| Error Type | Access Code | Username/Password |
|------------|-------------|-------------------|
| **Reasons Shown** | Invalid, already used, expired, typo | Wrong credentials, Caps Lock, device limit, suspended account, payment |
| **Solutions** | Verify code, check if used, request new | Check credentials, verify payment, contact support |
| **Technical Detail** | Focused on voucher/code issues | Focused on account issues |

## Implementation Details

### Code Changes in `js/api.js`

1. **Added `currentAuthType` tracking** (Line 26):
   - Tracks whether user is using access code or other auth method
   - Reset after each authentication attempt

2. **Modified `handleSignIn()`** (Line 850):
   - Sets `currentAuthType = 'code'` when processing access code
   - Passes `authType: 'code'` to error handler if validation fails

3. **Modified `connectionLogon()`** (Line 509):
   - Passes `currentAuthType` to error handler when authentication fails
   - Ensures correct error message shown based on auth method

4. **Error handler `authorisationFailed()`** already had support (Line 379):
   - Checks `authType` parameter
   - Uses `cp_error_code_info` for access codes
   - Uses `cp_error_info` for username/password

### Translation Keys Used

**English** (`langs/en.json`):
- `cp_error_code_info` - Access code error reasons
- `cp_error_code_solution` - Access code troubleshooting steps

**Spanish** (`langs/es.json`):
- `cp_error_code_info` - Razones de error de código de acceso
- `cp_error_code_solution` - Pasos de solución para códigos de acceso

## On OPNsense 25.1

When deployed to OPNsense, the same differentiation will apply:
- Expired voucher codes → Access code error message
- Invalid username/password → Account error message
- Both fully translated in English and Spanish

---

**Version**: 2.1.0  
**Updated**: November 12, 2025
