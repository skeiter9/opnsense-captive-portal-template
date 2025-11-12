# Testing Error Messages for Access Codes

## Overview
The system now displays **different error messages and modal styling** for:
1. **Expired access codes** - Orange header with clock icon
2. **Invalid access codes** - Red header with warning icon
3. **Username/password errors** - Red header with account-specific troubleshooting

## Visual Differences

### 🔶 Expired Code Modal
- **Header Color**: Orange/Amber (#f59e0b)
- **Icon**: 🕐 Clock icon (⏰)
- **Title**: "Access Code Expired" / "Código de Acceso Expirado"
- **Message**: Focused on expired vouchers and validity period
- **Solutions**: Request new code, contact support

### 🔴 Invalid Code Modal
- **Header Color**: Red (#dc3545)
- **Icon**: ⚠️ Warning icon
- **Title**: "Invalid username or password" / "Usuario o contraseña inválidos"
- **Message**: Invalid, already used, expired, or typo
- **Solutions**: Double-check code, verify if used before

### 🔴 Username/Password Modal
- **Header Color**: Red (#dc3545)
- **Icon**: ⚠️ Warning icon
- **Title**: "Invalid username or password" / "Usuario o contraseña inválidos"
- **Message**: Account-specific issues (Caps Lock, payment, suspension)
- **Solutions**: Check credentials, verify payment

## How to Test

### Test 1: Expired Access Code ⏰
**Use code: `EXP01`**

1. Enter `EXP01` in the access code field
2. Accept terms
3. Click **LOG IN**

**Expected Result:**
- ✅ **Orange header** (#f59e0b) instead of red
- ✅ **Clock icon** (⏰) instead of warning triangle
- ✅ Title: "Access Code Expired"
- ✅ Message focuses on expired voucher
- ✅ Solutions: "Request a new access code"

**English Message:**
```
Access Code Expired
Your access code is no longer valid

The access code you entered has expired and can no longer be used to access the network.
1. This code exceeded its validity period
2. The time limit for this voucher has passed

What can you do?
• Request a new access code from network support or reception
• If you recently received this code, verify you entered it correctly
• Contact network support for a replacement code
```

**Spanish Message:**
```
Código de Acceso Expirado
Su código de acceso ya no es válido

El código de acceso que ingresó ha expirado y ya no puede ser utilizado para acceder a la red.
1. Este código excedió su período de validez
2. El límite de tiempo para este voucher ha pasado

¿Qué puede hacer?
• Solicite un nuevo código de acceso al soporte de red o en recepción
• Si recibió este código recientemente, verifique que lo ingresó correctamente
• Contacte al soporte de red para obtener un código de reemplazo
```

### Test 2: Invalid Access Code ⚠️
**Use any other invalid code: `XXXXX`, `12345`, `ZZZZZ`**

1. Enter an invalid code like `XXXXX`
2. Accept terms
3. Click **LOG IN**

**Expected Result:**
- ✅ **Red header** (#dc3545)
- ✅ **Warning icon** (⚠️)
- ✅ Title: "Invalid username or password"
- ✅ Message lists: invalid, already used, expired, typo
- ✅ Solutions: "Double-check the access code and try again"

### Test 3: Valid Code ✅
**Use: `HR001`, `DY001`, `WK001`, or `MO001`**

1. Enter a valid code
2. Accept terms
3. Click **LOG IN**

**Expected Result:**
- ✅ Redirect to success page
- ✅ Countdown widget appears
- ✅ Shows ticket type (1 Hour, 1 Day, etc.)

## Test Codes Reference

| Code | Type | Result |
|------|------|--------|
| `EXP01` | **Expired** | 🔶 Orange modal with clock icon |
| `XXXXX` | Invalid | 🔴 Red modal with warning icon |
| `12345` | Invalid | 🔴 Red modal with warning icon |
| `ZZZZZ` | Invalid | 🔴 Red modal with warning icon |
| `HR001` | Valid | ✅ Success - 1 hour ticket |
| `DY001` | Valid | ✅ Success - 1 day ticket |
| `WK001` | Valid | ✅ Success - 1 week ticket |
| `MO001` | Valid | ✅ Success - 1 month ticket |

## Language Testing

Switch between English and Spanish to verify both languages work:

1. **English** → Enter `EXP01` → See "Access Code Expired" with orange header
2. **Español** → Enter `EXP01` → See "Código de Acceso Expirado" with orange header
3. Verify all messages are properly translated

## Implementation Details

### Configuration (`config/settings.json`)
```json
"modal": {
    "auth_failed_header_color": "#dc3545",      // Red for invalid
    "code_expired_header_color": "#f59e0b",     // Orange for expired
    "conn_failed_header_color": "#dc3545",
    "show_rules_header_color": "#4ca1af",
    "overlay_color": "rgba(0,0,0,0.5)"
}
```

### Server Mock (`server.js`)
- Code `EXP01` returns `errorType: 'expired'`
- All other invalid codes return generic error
- Valid codes return session with timeout

### Error Handler (`js/api.js`)
```javascript
authorisationFailed(options = {}) {
    const authType = options.authType;
    const errorType = options.errorType; // 'expired' or 'invalid'
    
    if (authType === 'code' && errorType === 'expired') {
        // Orange header, clock icon, expired-specific message
    } else if (authType === 'code') {
        // Red header, warning icon, invalid code message
    }
}
```

### Translation Keys

**English (`langs/en.json`):**
- `cp_error_code_expired_title` - "Access Code Expired"
- `cp_error_code_expired_subtitle` - "Your access code is no longer valid"
- `cp_error_code_expired_info` - Expired-specific reasons
- `cp_error_code_expired_solution` - Expired-specific solutions

**Spanish (`langs/es.json`):**
- `cp_error_code_expired_title` - "Código de Acceso Expirado"
- `cp_error_code_expired_subtitle` - "Su código de acceso ya no es válido"
- `cp_error_code_expired_info` - Razones específicas de expiración
- `cp_error_code_expired_solution` - Soluciones específicas de expiración

## On OPNsense 25.1

When deployed to OPNsense, the system will automatically detect expired vouchers based on the API response and show the orange expired modal instead of the red invalid modal.

The OPNsense API should return an `errorType` field to distinguish between expired and invalid codes.

---

**Version**: 2.2.0  
**Updated**: November 12, 2025
