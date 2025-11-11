# Overview

This is a multilingual Captive Portal template designed for OPNsense firewall/router systems. A captive portal is a web page that users must interact with before gaining network access, commonly used in hotels, airports, cafes, and corporate networks. This template provides a customizable, modern interface with built-in support for multiple languages, authentication mechanisms, and configurable styling.

The project is primarily a frontend application that integrates with OPNsense's captive portal API endpoints. It includes a lightweight Node.js development server for testing and preview purposes.

**Important:** This template is tested and designed for OPNsense 25.1. The development mock server simulates OPNsense API behavior but may differ from the actual captive portal implementation in production.

# Recent Changes

**November 11, 2025 - OPNsense API Enhancements & Session Management**
- Added Modern Portal API (RFC 8908) endpoint for iOS/Android captive portal detection
  - Implements standardized `/api/captiveportal/access/modernapi/` endpoint
  - Provides capport.json with proper venue info and user portal URLs
  - Improves automatic portal detection on modern mobile devices
- Implemented real-time session timeout countdown display
  - Shows remaining session time in HH:MM:SS format
  - Updates every second with accurate countdown
  - Automatically reloads portal when session expires
  - Fully internationalized in English and Spanish
- Enhanced zone-aware API integration
  - Added zone ID tracking and support
  - Properly handles multi-zone OPNsense configurations
  - Zone-specific session management
- Improved error messages for different authentication methods
  - Differentiated error messages for username/password authentication
  - Specific error handling for access code/voucher authentication
  - More helpful troubleshooting steps for each auth type
  - Fully localized error messages

**November 11, 2025 - Minimalistic Green Design Update**
- Redesigned with a clean, minimalistic approach using dark forest green as primary color
- Updated color scheme to use dark forest green gradients (#145214, #0d3d0d) with pure white backgrounds
- Simplified visual effects:
  - Reduced shadow intensity for cleaner look
  - Minimized hover animations (subtle 1px lift instead of 2px)
  - Removed unnecessary shadows from buttons and logos
  - Cleaner border radius (8px for buttons, 12px for containers)
- Enhanced responsive design with comprehensive breakpoints for all devices:
  - Desktop and laptops (>1200px)
  - Tablets (768px - 1200px)
  - Standard mobile phones (480px - 768px)
  - Small phones (360px - 480px)
  - Very small screens (<360px)
- Optimized for old Android devices with:
  - Minimum 16px font size on inputs to prevent zoom on iOS
  - Touch-friendly buttons (44px minimum tap target)
  - Lightweight shadows for better performance
  - Hardware-accelerated transitions using CSS transforms
  - Reduced motion support for accessibility
- Created comprehensive custom.css with:
  - Minimalistic shadow system with green tint
  - Smooth cubic-bezier transitions (0.25s)
  - Touch device optimizations
  - Webkit/iOS specific optimizations
- Updated settings.json with fresh green color palette
- Maintained all existing functionality while improving visual presentation

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

**Technology Stack**: The application uses vanilla JavaScript with jQuery for DOM manipulation and AJAX requests. No modern framework (React, Vue, Angular) is used - this is an intentional design decision for compatibility with OPNsense's template system.

**Component Structure**: 
- The main application logic is centralized in a `CaptivePortalAPI` class (js/api.js) that handles initialization, language management, authentication, and UI updates
- Modular CSS architecture using @import statements in master.css to separate concerns (bootstrap, custom styles, RTL support, language switcher, modals)
- HTML templates use a single-page structure with dynamic content replacement based on user state

**State Management**: Application state is managed through class properties in the CaptivePortalAPI instance, including settings, current language, translation texts, and authentication attempts.

**Styling Approach**: 
- CSS custom properties (CSS variables) are used extensively for theming, allowing dynamic color and layout customization without CSS recompilation
- Bootstrap 5.3.3 provides the grid system and basic components
- Custom CSS provides captive portal-specific styling with smooth transitions and modern shadow effects
- RTL (Right-to-Left) language support is built-in with dedicated CSS rules

## Authentication System

**Multiple Authentication Methods**: The system supports three authentication modes:
1. Username/password authentication
2. Anonymous access (click-through)
3. Access code-based authentication

**Rate Limiting**: A client-side login attempt limiter prevents brute force attacks by blocking login attempts after a configurable number of failures for a specified time period. This is stored in browser localStorage.

**Session Management**: Integration with OPNsense's captive portal API endpoints:
- `/api/captiveportal/access/logon/{zoneid}/` for authentication
- `/api/captiveportal/access/status/{zoneid}/` for session status checking
- `/api/captiveportal/access/logoff/{zoneid}/` for logout

## Internationalization (i18n)

**Language Detection**: The system automatically detects the user's browser language and loads the appropriate translation file. Falls back to a configurable default language if the detected language is not available.

**Translation System**: 
- JSON-based translation files stored in the langs/ directory
- Each language file contains all UI strings, error messages, and configurable content
- Dynamic language switching without page reload using the Polyglot Language Switcher plugin

**RTL Support**: Automatic detection and application of RTL layout for languages like Arabic, Hebrew, Farsi based on language code.

**Supported Languages**: Currently includes English, Spanish (Español), Polish (Polski), and Slovak (Slovenčina), with easy extensibility for additional languages.

## Visual Effects System

**Vanta.js Integration**: Optional animated background effects using Three.js and Vanta.js library. Multiple effect types are available (birds, cells, fog, globe, halo, net, rings, waves) and can be configured via settings.

**Configuration-Driven Theming**: The settings.json file contains a comprehensive css_params object that controls:
- Background colors, images, gradients for different sections
- Shadow effects for containers
- Color schemes for text, links, inputs, and buttons
- All visual parameters are applied dynamically via CSS custom properties

## Development Server

**Purpose**: A simple Node.js HTTP server (server.js) for local development and testing without deploying to OPNsense.

**Mock API Endpoints**: The dev server provides mock implementations of OPNsense API endpoints to simulate authentication flows during development.

**Static File Serving**: Handles serving HTML, CSS, JavaScript, images, and font files with appropriate MIME types.

**Security**: Includes basic directory traversal protection to prevent access to files outside the project directory.

# External Dependencies

## Third-Party Libraries

**jQuery 3.7.1**: DOM manipulation, AJAX requests, and event handling. Core dependency for the application.

**Bootstrap 5.3.3**: CSS framework providing responsive grid system and base component styles.

**Three.js (r134)**: 3D graphics library required by Vanta.js for animated background effects.

**Vanta.js (v1.6.1)**: Animated background effects library providing multiple WebGL-based visual effects.

**cpModal (v1.6.1)**: Lightweight modal/popup library for displaying terms and conditions, help text, and error messages.

**Polyglot Language Switcher (v2.2)**: jQuery plugin for implementing the language selection dropdown with automatic language detection.

**sprintf.js (v1.1.3)**: String formatting library for creating formatted messages with variable substitution.

**CSS Browser Selector (v0.81)**: Adds browser-specific CSS classes to enable browser-specific styling when needed.

## OPNsense Integration

**API Endpoints**: The application communicates with OPNsense's built-in captive portal REST API for:
- User authentication (username/password, voucher codes, anonymous access)
- Session status queries
- Logout operations

**Template System**: Designed to be deployed as a custom template within OPNsense's captive portal template directory, replacing the default portal interface.

**Zone Configuration**: Supports OPNsense's zone-based captive portal configuration, where different network zones can have different portal instances.

## Configuration Files

**settings.json**: Central configuration file containing:
- Default and available languages
- Login control parameters (rate limiting)
- Layout options (rules display, redirect URLs)
- Comprehensive CSS theming parameters
- All configurable without code changes

**Language Files** (langs/*.json): Separate JSON files for each supported language containing all translatable strings and localized content.