
/**
 * @version 2.1.0
 * @package Multilanguage Captive Portal Template for OPNsense
 * @author Mirosław Majka (mix@proask.pl)
 * @copyright (C) 2025 Mirosław Majka <mix@proask.pl>
 * @license GNU/GPL license: http://www.gnu.org/copyleft/gpl.html
 */

class CaptivePortalAPI {
    constructor() {
        this.settings = {};
        this.langText = {};
        this.layout = {};
        this.lang = null;
        this.localId = null;
        this.attempt = 0;
        this.langsRTL = ['ar', 'dv', 'fa', 'ha', 'he', 'sy'];
        this.root = document.documentElement;
        this.sessionData = null;
        this.sessionTimeoutInterval = null;
        this.zoneId = '0';
        
        this.init();
    }

    async init() {
        await this.loadSettings();
        this.applyCssSettings();
        this.initializeVantaEffect();
        this.updateLogo();
        await this.setupLanguage();
        this.setupRulesSection();
        this.configureInputFocusBehavior();
        this.setupAuthHandlers();
        this.setupRulesLink();
        await this.checkConnectionStatus();
    }

    async loadJson(path, file) {
        try {
            const response = await fetch(`${path}/${file}.json`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error(`Failed to load ${file}.json:`, error);
            throw error;
        }
    }

    async waitForObject(element, maxWait = 2000) {
        const startTime = Date.now();
        while (Object.keys(element).length === 0) {
            if (Date.now() - startTime > maxWait) {
                console.error('Timeout waiting for element object to load');
                return false;
            }
            await new Promise(resolve => setTimeout(resolve, 50));
        }
        return true;
    }

    formatISO(timeStamp = Date.now()) {
        return new Date(timeStamp - (new Date().getTimezoneOffset() * 60000))
            .toISOString()
            .slice(0, -5)
            .split('T');
    }

    updateUIWithLangText(texts) {
        Object.entries(texts).forEach(([key, value]) => {
            const element = document.getElementById(key);
            if (!element) return;

            if (typeof value === 'object') {
                const content = Object.entries(value)
                    .map(([k, v]) => `<div class="${k}">${v}</div>`)
                    .join('');
                element.innerHTML = content;
            } else if (key.includes('pagetitle')) {
                document.title = value;
            } else if (key.includes('_placeholder')) {
                const targetElement = document.getElementById(key.replace('_placeholder', ''));
                if (targetElement) targetElement.setAttribute('placeholder', value);
            } else {
                element.textContent = value;
            }
        });
    }

    isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch {
            return false;
        }
    }

    showModal({ title, subtitle, content, iconText = '&#9888;', customStyles = {}, callback, onOpen, onClose }) {
        const defaultStyles = {
            padding: 20,
            headerColor: this.settings.modal?.show_rules_header_color,
            overlayColor: this.settings.modal?.overlay_color,
            borderBottom: false,
            timeout: false,
            timeoutProgressbar: false,
            pauseOnHover: false,
            closeButton: true,
            closeOnEscape: true,
            overlayClose: true
        };

        const styles = { ...defaultStyles, ...customStyles };
        const msgElement = document.getElementById('MSG');

        // Using the existing cpModal library but with modern callback handling
        $(msgElement).cpModal({
            title,
            subtitle,
            headerColor: styles.headerColor,
            iconText: iconText,
            padding: styles.padding,
            width: styles.width,
            top: styles.top,
            borderBottom: styles.borderBottom,
            timeout: styles.timeout,
            timeoutProgressbar: styles.timeoutProgressbar,
            pauseOnHover: styles.pauseOnHover,
            overlayColor: styles.overlayColor,
            closeButton: styles.closeButton,
            closeOnEscape: styles.closeOnEscape,
            overlayClose: styles.overlayClose,
            onOpening: onOpen,
            onClosed: () => {
                msgElement.outerHTML = '<div id="MSG"></div>';
                onClose?.();
            },
            afterRender: () => {
                document.querySelector('#MSG .cpModal-content').insertAdjacentHTML('beforeend', content);
            }
        });
        $(msgElement).cpModal('open');
    }

    getUrlParams() {
        const params = new URLSearchParams(window.location.search);
        const result = [];
        
        for (const [key, value] of params) {
            result.push(key);
            result[key] = value ? value.replace(/^(?:(.*:)?\/\/)?(.*)/i, 
                (match, schema, nonSchemaUrl) => schema ? match : `http://${nonSchemaUrl}`) : '';
        }
        
        return result;
    }

    async loadSettings() {
        try {
            const response = await this.loadJson('/config', 'settings');
            Object.assign(this.settings, response);
        } catch (error) {
            console.error("Failed to load settings:", error);
            // Provide fallback settings for development
            this.settings = {
                default_lang: 'en',
                langs: { 'en': 'English', 'es': 'Español' },
                layout: { enable_rules: true },
                login: { control: false, attempts: 3, delay: 5 },
                modal: {
                    timeout: 5000,
                    auth_failed_header_color: '#dc3545',
                    conn_failed_header_color: '#dc3545',
                    overlay_color: 'rgba(0,0,0,0.5)'
                }
            };
        }
    }

    async loadLangs(language = this.settings.default_lang) {
        try {
            const response = await this.loadJson('/langs', language);
            Object.assign(this.langText, response);
            this.updateUIWithLangText(this.langText);
        } catch (error) {
            console.error("Failed to load language file:", error);
            // Provide fallback language content for development
            this.langText = {
                cp_portal_head_title: 'Welcome to Internet Access',
                code: 'Access Code',
                inputCode_placeholder: 'Enter your access code',
                termcondition1: 'I accept the',
                rules: 'terms and conditions',
                termcondition2: 'in their entirety.',
                signin: 'Sign In',
                cp_error_login_err: 'Invalid login or password',
                cp_error_info_title: 'You cannot login because:',
                cp_error_info: '<ul><li>You used an incorrect username or password</li><li>Your account may be suspended</li></ul>',
                cp_error_solution_title: '<div class="solution-title">Try to solve the problem:</div>',
                cp_error_solution: '<ul><li>Check your access code</li><li>Contact support if needed</li></ul>',
                cp_error_title: 'Connection Error',
                cp_error_server_connection: 'Unable to connect to the authentication server',
                cp_portal_ifconfig_ip_address: 'IP Address:',
                cp_portal_ifconfig_mac_address: 'MAC Address:'
            };
            this.updateUIWithLangText(this.langText);
        }
    }

    setLang(id) {
        $(id).polyglotLanguageSwitcher({
            effect: 'slide',
            noRefresh: true,
            onChange: async (evt) => {
                this.createCookie('lang', evt.selectedItem, 31);
                this.langText = {};
                await this.loadLangs(evt.selectedItem);

                const inputCode = document.getElementById('inputCode');
                if (inputCode) {
                    inputCode.removeAttribute('readonly');
                    inputCode.focus();
                }
            }
        });
    }

    setLangLayout(langs, selectedLang, container) {
        const options = Object.entries(langs)
            .map(([key, value]) => 
                `<option id="${key}" value="${key}"${key === selectedLang ? ' selected' : ''}>${value}</option>`)
            .join('');

        const dropdownHTML = `
            <div id="polyglotLanguageSwitcher">
                <form action="javascript:void(0);">
                    <select id="polyglot-language-options">${options}</select>
                </form>
            </div>`;

        document.querySelector(container).innerHTML = dropdownHTML;
        this.setLang(container);
    }

    async clientInfo(data) {
        await this.waitForObject(this.langText);

        const container = document.getElementById(`cp_portal_event_${data.authType}`);
        if (!container) return;

        const appendInfo = (wrapperClass, title, value, className = 'config-address') => {
            const p = document.createElement('p');
            p.className = wrapperClass;
            p.innerHTML = `<span class="if-title">${title}</span> <span class="${className}">${value}</span>`;
            container.appendChild(p);
        };

        if (data.ipAddress) {
            appendInfo('flex-50', this.langText.cp_portal_ifconfig_ip_address, data.ipAddress);
        }
        
        if (data.macAddress) {
            appendInfo('flex-50', this.langText.cp_portal_ifconfig_mac_address, data.macAddress);
        }

        if (typeof data.startTime === 'number') {
            appendInfo('flex-100', this.langText.cp_session_start_time, 
                this.formatISO(data.startTime * 1000).join(' '), 'config-info');
        }

        if (data.acc_session_timeout != null && !document.querySelector('.wrapperTimeLeft')) {
            let timeLeft = parseInt(data.acc_session_timeout, 10);
            const sinceLogon = (Date.now() / 1000) - parseInt(data.startTime, 10);
            timeLeft = Math.max(timeLeft - sinceLogon, 0);

            appendInfo('wrapperTimeLeft flex-100', this.langText.cp_session_time_left, 
                this.updateTimeLeft(timeLeft), 'time-left-value');

            const timer = setInterval(() => {
                timeLeft -= 60;

                if (timeLeft <= 0) {
                    clearInterval(timer);
                    this.showModal({
                        title: this.langText.cp_session_timeout_title,
                        subtitle: this.langText.cp_session_timeout_info_title,
                        content: this.langText.cp_session_timeout_content,
                        iconText: '&#x27f3;',
                        customStyles: {
                            timeout: this.settings.modal?.timeout,
                            timeoutProgressbar: true,
                            pauseOnHover: true
                        },
                        onClose: () => window.location.reload()
                    });
                }

                const timeLeftElement = document.querySelector('.wrapperTimeLeft .time-left-value');
                if (timeLeftElement) {
                    timeLeftElement.textContent = this.updateTimeLeft(timeLeft);
                }
            }, 60000);
        }
    }

    updateTimeLeft(timeLeft) {
        const days = Math.floor(timeLeft / 43200);
        const hours = Math.floor((timeLeft % 43200) / 3600);
        const minutes = Math.floor((timeLeft % 3600) / 60);

        const formatTime = (value, texts) => {
            if (value === 0) return '';

            const lastTwoDigits = value % 100;
            const lastDigit = value % 10;

            if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
                return `${value} ${texts.other}`;
            }

            if (value === 1) return `${value} ${texts.one}`;
            if (lastDigit >= 2 && lastDigit <= 4) return `${value} ${texts.few}`;
            return `${value} ${texts.other}`;
        };

        const daysText = formatTime(days, {
            one: this.langText.cp_session_time_left_one_day,
            few: this.langText.cp_session_time_left_two_four_days,
            other: this.langText.cp_session_time_left_other_days
        });

        const hoursText = formatTime(hours, {
            one: this.langText.cp_session_time_left_one_hour,
            few: this.langText.cp_session_time_left_two_four_hours,
            other: this.langText.cp_session_time_left_other_hours
        });

        const minutesText = (days === 0 && hours === 0 && minutes < 1)
            ? this.langText.cp_session_time_left_less_than_minute
            : formatTime(minutes, {
                one: this.langText.cp_session_time_left_one_minute,
                few: this.langText.cp_session_time_left_two_four_minutes,
                other: this.langText.cp_session_time_left_other_minutes
            });

        return [daysText, hoursText, minutesText].filter(Boolean).join(', ');
    }

    createCookie(name, value, days) {
        const d = new Date();
        d.setTime(d.getTime() + (days * 24 * 60 * 60000));
        const expires = "expires=" + d.toUTCString();
        document.cookie = `${name}=${value};${expires};path=/`;
    }

    getCookie(cname) {
        const name = cname + "=";
        const decodedCookie = decodeURIComponent(document.cookie);
        const ca = decodedCookie.split(';');

        for (let c of ca) {
            while (c.charAt(0) === ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) === 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }

    authorisationFailed(options = {}) {
        const authType = options.authType || this.sessionData?.authType || 'normal';
        
        let errorInfo = this.langText.cp_error_info;
        let errorSolution = this.langText.cp_error_solution;
        
        if (authType === 'voucher' || authType === 'code') {
            errorInfo = this.langText.cp_error_code_info || this.langText.cp_error_info;
            errorSolution = this.langText.cp_error_code_solution || this.langText.cp_error_solution;
        }
        
        const modal = {
            title: this.langText.cp_error_login_err,
            subtitle: this.langText.cp_error_info_title,
            content: errorInfo + this.langText.cp_error_solution_title + errorSolution,
            iconText: '&#9888;',
            customStyles: {
                headerColor: this.settings.modal?.auth_failed_header_color,
                overlayColor: this.settings.modal?.overlay_color,
                timeout: this.settings.modal?.timeout,
                timeoutProgressbar: true,
                pauseOnHover: true
            }
        };

        if (options.onClose) {
            modal.onClose = options.onClose;
        }
        
        if (options && typeof options === 'object') {
            Object.assign(modal, options);
        }

        this.showModal(modal);
    }

    showRules() {
        this.showModal({
            title: this.langText.cp_rules_title,
            subtitle: this.langText.cp_rules_info_title,
            content: this.langText.cp_rules_content,
            iconText: '&#167;',
            customStyles: {
                width: 800,
                top: 70,
                bottom: 70
            }
        });
    }

    connectionFailed() {
        this.showModal({
            title: this.langText.cp_error_title,
            subtitle: this.langText.cp_error_server_connection,
            iconText: '&#9888;',
            customStyles: {
                headerColor: this.settings.modal?.conn_failed_header_color,
                overlayColor: this.settings.modal?.overlay_color,
                borderBottom: false,
            }
        });
    }

    connectionBlocked(loginDelay) {
        this.showModal({
            title: this.langText.cp_login_attempt_title,
            subtitle: this.langText.cp_login_attempt_info_title,
            iconText: '&#9888;',
            content: sprintf(this.langText.cp_login_attempt_content, 
                this.settings.login.attempts, 
                this.settings.login.delay, 
                (this.settings.login.delay === 1 ? 
                    this.langText.cp_login_attempt_minute : 
                    this.langText.cp_login_attempt_minutes)),
            customStyles: {
                headerColor: this.settings.modal?.conn_failed_header_color,
                overlayColor: this.settings.modal?.overlay_color,
                borderBottom: false,
                timeout: new Date(loginDelay - Date.now()).getTime(),
                timeoutProgressbar: true,
                overlayClose: false,
                closeButton: false,
                closeOnEscape: false
            }
        });
    }

    connectionLogon(data) {
        if (this.isAttempt(data)) {
            this.connectionBlocked(data.local);
        }

        if (data.clientState === 'AUTHORIZED') {
            if (this.settings.login?.control && typeof data.loginTime !== 'undefined') {
                delete data.loginTime;
            }

            if (this.settings.layout?.redirect_url?.length > 0 && this.isValidUrl(this.settings.layout.redirect_url)) {
                let redirectUrl = this.settings.layout.redirect_url;
                if (data.acc_session_timeout || data.sessionTimeoutRemaining) {
                    const timeout = data.acc_session_timeout || data.sessionTimeoutRemaining;
                    const lang = this.lang || 'en';
                    redirectUrl += `?timeout=${timeout}&lang=${lang}`;
                }
                window.location.replace(redirectUrl);
            } else if (this.getUrlParams()['redirurl'] !== undefined) {
                window.location = this.getUrlParams()['redirurl'] + '?refresh';
            } else {
                window.location.reload();
            }
        } else {
            const usernameInput = document.getElementById('inputUsername');
            const passwordInput = document.getElementById('inputPassword');
            if (usernameInput) usernameInput.value = '';
            if (passwordInput) passwordInput.value = '';

            if (this.settings.login?.control && this.settings.login.attempts > 0) {
                this.attempt++;
                const ts = Date.now();
                data.loginTime = new Date(Date.now());

                if (this.settings.login.attempts - this.attempt === 0) {
                    data.loginTime.setTime(data.loginTime.getTime() + this.settings.login.delay * 60000);
                    document.cookie = "loginTime=" + data.loginTime + ";expires=" + data.loginTime + ";path=/";
                    this.authorisationFailed({
                        onClose: () => this.connectionBlocked(data.loginTime)
                    });
                    this.setAttempt(data);
                }
            }

            this.authorisationFailed();
        }
    }

    connectionStatus(data) {
        if (data.clientState !== 'AUTHORIZED' && data.authType !== undefined && this.localId === null) {
            this.localId = [...data.ipAddress].map((x, i) => 
                (x.codePointAt() ^ data.authType.charCodeAt(i % data.authType.length) % 255)
                    .toString(16)
                    .padStart(2, '0')).join('');
        }

        if (data.clientState === 'AUTHORIZED') {
            this.sessionData = data;
            if (data.zoneId) this.zoneId = data.zoneId;
            document.getElementById('login_normal')?.classList.add('d-none');
            document.getElementById('logout_undefined')?.classList.remove('d-none');
            
            if (data.acc_session_timeout || data.sessionTimeoutRemaining) {
                this.startSessionTimeout(data);
            }
        } else {
            this.stopSessionTimeout();
            if (data.authType === 'none') {
                document.getElementById('login_normal')?.classList.add('d-none');
                document.getElementById('login_none')?.classList.remove('d-none');
            } else {
                if (this.settings.login?.control && this.settings.login.attempts > 0 && this.isAttempt(data)) {
                    this.connectionBlocked(data.local);
                }
                document.getElementById('login_normal')?.classList.remove('d-none');
            }
        }

        document.querySelectorAll('.row, .footer-isp-info').forEach(el => el.classList.add('ready'));
    }

    isAttempt(data) {
        this.getAttempt(data);

        if (data.local === null) return false;

        const now = new Date(Date.now());
        const control = new Date(this.getCookie('loginTime'));
        data.local = new Date(
            JSON.parse(
                String.fromCharCode(...(data.local).match(/.{1,2}/g)
                    .map((e, i) => parseInt(e, 16) ^ this.localId.charCodeAt(i % this.localId.length) % 255))
            ).loginTime
        );

        if (now >= data.local) {
            window.localStorage.removeItem('loginAttempt');
            return false;
        }

        if (now < data.local || control.getTime() !== data.local.getTime()) {
            return true;
        }

        return false;
    }

    setAttempt(batch) {
        batch = JSON.stringify(batch);
        batch = [...batch].map((x, i) => 
            (x.codePointAt() ^ this.localId.charCodeAt(i % this.localId.length) % 255)
                .toString(16)
                .padStart(2, '0')).join('');
        window.localStorage.setItem('loginAttempt', batch);
    }

    getAttempt(data) {
        data.local = window.localStorage.getItem('loginAttempt');
        return data;
    }

    formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    startSessionTimeout(data) {
        this.stopSessionTimeout();
        
        const timeoutElement = document.getElementById('session_timeout');
        if (!timeoutElement) return;
        
        let remainingSeconds = data.sessionTimeoutRemaining || data.acc_session_timeout;
        if (!remainingSeconds) return;
        
        const startTime = data.startTime || Math.floor(Date.now() / 1000);
        
        const updateDisplay = () => {
            const elapsed = Math.floor(Date.now() / 1000) - startTime;
            const remaining = Math.max(0, remainingSeconds - elapsed);
            
            if (remaining > 0) {
                const timeText = this.langText.session_timeout_text || 'Session expires in:';
                timeoutElement.textContent = `${timeText} ${this.formatTime(remaining)}`;
                timeoutElement.style.display = 'block';
            } else {
                timeoutElement.textContent = this.langText.session_expired_text || 'Session expired. Please log in again.';
                timeoutElement.style.display = 'block';
                this.stopSessionTimeout();
                setTimeout(() => window.location.reload(), 2000);
            }
        };
        
        updateDisplay();
        this.sessionTimeoutInterval = setInterval(updateDisplay, 1000);
    }

    stopSessionTimeout() {
        if (this.sessionTimeoutInterval) {
            clearInterval(this.sessionTimeoutInterval);
            this.sessionTimeoutInterval = null;
        }
        const timeoutElement = document.getElementById('session_timeout');
        if (timeoutElement) {
            timeoutElement.style.display = 'none';
        }
    }

    // Modern API methods
    applyCssSettings() {
        if (this.settings.css_params) {
            Object.entries(this.settings.css_params).forEach(([key, value]) => {
                this.root.style.setProperty(`--${key}`, value);
            });
        }
    }

    initializeVantaEffect() {
        if (this.settings.animate?.effect && typeof $ !== 'undefined' && $.getMultiScripts) {
            const effect = this.settings.animate.effect.toLowerCase();
            const preset = this.settings.animate.preset[effect];
            const scripts = [`three.r134.min.js`, `vanta.${effect}.min.js`];

            // Keep existing script loading for Vanta
            $.when($.getMultiScripts(scripts, 'js/vanta/')).done(() => {
                if (window.VANTA && window.VANTA[effect.toUpperCase()]) {
                    try {
                        window['VANTA'][effect.toUpperCase()]({
                            ...this.settings.animate.params,
                            ...preset
                        });
                    } catch (error) {
                        console.warn('VANTA effect failed to initialize:', error);
                    }
                }
            }).fail(() => {
                console.warn('VANTA scripts failed to load, continuing without animation');
            });
        }
    }

    updateLogo() {
        if (this.settings.logo) {
            const logoElement = document.getElementById('logo');
            if (logoElement) {
                logoElement.innerHTML = `<img class="brand-logo" src="${this.settings.logo}" height="150" width="150">`;
            }
        }
    }

    async setupLanguage() {
        const browserLang = (navigator.language || navigator.userLanguage).substring(0, 2).toLowerCase();
        let lang = this.getCookie('lang') || browserLang || 'es';

        if (!(lang in this.settings.langs)) {
            lang = this.settings.default_lang;
        }

        document.documentElement.setAttribute('lang', lang);
        document.documentElement.setAttribute('dir', this.langsRTL.includes(lang) ? 'rtl' : 'ltr');

        if (!this.getCookie('lang')) {
            this.createCookie('lang', lang, 31);
        }

        await this.loadLangs(lang);

        const captivePortal = document.querySelector('.captiveportal');
        if (Object.keys(this.settings.langs).length > 1) {
            captivePortal?.classList.remove('single-lang');
            captivePortal?.classList.add('multiple-langs');
            this.setLangLayout(this.settings.langs, lang, '#polyglotLanguageSwitcher');
        } else {
            captivePortal?.classList.remove('multiple-langs');
            captivePortal?.classList.add('single-lang');
        }
    }

    setupRulesSection() {
        if (this.settings.layout?.enable_rules) {
            this.toggleSignInButtons('#login-rules', '#signin');
            this.toggleSignInButtons('#login-rules-anon', '#signin_anon');
        } else {
            document.querySelectorAll('.rules-checkbox').forEach(el => el.innerHTML = '<br />');
        }
    }

    toggleSignInButtons(checkboxSelector, buttonSelector) {
        const checkbox = document.querySelector(checkboxSelector);
        const button = document.querySelector(buttonSelector);
        
        if (checkbox && button) {
            checkbox.checked = false;
            button.disabled = true;

            checkbox.addEventListener('click', () => {
                button.disabled = !checkbox.checked;
            });
        }
    }

    configureInputFocusBehavior() {
        document.querySelectorAll('input[readonly]').forEach(input => {
            input.addEventListener('focus', () => {
                input.removeAttribute('readonly');
            });
        });

        document.querySelectorAll('input:not([readonly])').forEach(input => {
            input.addEventListener('blur', () => {
                input.setAttribute('readonly', true);
            });
        });

        const codeInput = document.getElementById('inputCode');
        if (codeInput) {
            codeInput.addEventListener('focus', () => {
                codeInput.removeAttribute('readonly');
                codeInput.focus();
            });
        }
    }

    setupAuthHandlers() {
        const signinBtn = document.getElementById('signin');
        const signinAnonBtn = document.getElementById('signin_anon');
        const logoffBtn = document.getElementById('logoff');

        if (signinBtn) {
            signinBtn.addEventListener('click', this.handleSignIn.bind(this));
        }
        
        if (signinAnonBtn) {
            signinAnonBtn.addEventListener('click', this.handleAnonymousSignIn.bind(this));
        }
        
        if (logoffBtn) {
            logoffBtn.addEventListener('click', this.handleLogoff.bind(this));
        }
    }

    handleSignIn(event) {
        event.preventDefault();
        
        const code = document.getElementById('inputCode').value;
        if (!code || code.length !== 5) {
            this.authorisationFailed();
            return;
        }
        
        const username = code.substring(0, 2);
        const password = code.substring(2, 5);
        
        this.authenticateUser({
            user: username,
            password: password,
        });
    }

    handleAnonymousSignIn(event) {
        event.preventDefault();
        this.authenticateUser({ user: '', password: '' });
    }

    async handleLogoff(event) {
        event.preventDefault();
        
        try {
            await fetch('/api/captiveportal/access/logoff/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    user: '',
                    password: ''
                })
            });
            window.location.reload();
        } catch (error) {
            this.connectionFailed();
        }
    }

    async authenticateUser(credentials) {
        try {
            const response = await fetch('/api/captiveportal/access/logon/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams(credentials)
            });
            
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const data = await response.json();
            await this.clientInfo(data);
            this.connectionLogon(data);
        } catch (error) {
            this.connectionFailed();
        }
    }

    setupRulesLink() {
        document.querySelectorAll('[id^="rules"].link').forEach(link => {
            link.addEventListener('click', this.showRules.bind(this));
        });
    }

    async checkConnectionStatus() {
        try {
            const response = await fetch('/api/captiveportal/access/status/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    user: '',
                    password: '',
                })
            });
            
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const data = await response.json();
            await this.clientInfo(data);
            this.connectionStatus(data);
        } catch (error) {
            setTimeout(() => this.connectionFailed(), 1000);
        }
    }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    try {
        new CaptivePortalAPI();
    } catch (error) {
        console.error('Failed to initialize CaptivePortalAPI:', error);
        // Fallback: at least show the basic form
        document.getElementById('login_normal')?.classList.remove('d-none');
        document.querySelectorAll('.row, .footer-isp-info').forEach(el => el.classList.add('ready'));
    }
});

// Additional fallback for jQuery dependency issues
if (typeof $ === 'undefined') {
    console.warn('jQuery not loaded, some features may not work');
}
