/**
 * @version 2.1.0
 * @package Multilanguage Captive Portal Template for OPNsense
 * @author Mirosław Majka (mix@proask.pl)
 * @copyright (C) 2025 Mirosław Majka <mix@proask.pl>
 * @license GNU/GPL license: http://www.gnu.org/copyleft/gpl.html
 */

let settings = {},
    layout = {},
    langText = {},
    lang,
    localId,
    langsRTL = ['ar','dv','fa','ha','he','sy'],
    _root = document.querySelector(':root'),
    attempt = 0;

const loadJson = (path, file) => {
    return $.ajax({ url: `${path}/${file}.json`, dataType: 'json' });
}

const waitForObject = async (element, maxWait = 2000) => {
    const startTime = Date.now();
    while (Object.keys(element).length === 0) {
        if (Date.now() - startTime > maxWait) {
            console.error('Timeout waiting for \'element\' object to load');
            return false;
        }
        await new Promise(resolve => setTimeout(resolve, 50));
    }
    return true;
};

const formatISO = (timeStamp = Date.now()) => {
    return new Date(timeStamp - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0,-5).split('T');
}

const updateUIWithLangText = (texts) => {
    Object.entries(texts).forEach(([key, value]) => {
        if (typeof value === 'object') {
            const content = Object.entries(value)
            .map(([k, v]) => `<div class="${k}">${v}</div>`)
            .join('');
            $(`#${key}`).html(content);
        } else if (key.includes('pagetitle')) {
            $('title').text(value);
        } else if (key.includes('_placeholder')) {
            $(`#${key.replace('_placeholder', '')}`).attr('placeholder', value);
        } else {
            $(`#${key}`).text(value);
        }
    });
};

const isValidUrl = (string) => {
    try {
        new URL(string);
        return true;
    } catch (err) {
        return false;
    }
}

const showModal = ({ title, subtitle, content, iconText = '&#9888;', customStyles = {}, callback, onOpen, onClose }) => {
    const defaultStyles = {
        padding: 20,
        headerColor: settings.modal.show_rules_header_color,
        overlayColor: settings.modal.overlay_color,
        borderBottom: false,
        timeout: false,
        timeoutProgressbar: false,
        pauseOnHover: false,
        closeButton: true,
        closeOnEscape: true,
        overlayClose: true
    };

    const styles = { ...defaultStyles, ...customStyles };

    $('#MSG').cpModal({
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
        onOpening: () => {
            if (onOpen) onOpen();
        },
        onClosed: () => {
            $('#MSG').replaceWith('<div id="MSG"></div>');
            if (onClose) onClose();
        },
        afterRender: () => {
            $('#MSG .cpModal-content').append(content);
        }
    });
    $('#MSG').cpModal('open');
};

$.getMultiScripts = (batch, path) => {
    $.executeInOrder = (source, code, resolve) => {
        if (source == batch[0]) {
            batch.shift();
            Function(`"use strict";${code}`)($.this);
            resolve();
        } else {
            setTimeout(() => {$.executeInOrder(source, code, resolve);}, 10);
        }
    }

    var _arr = $.map(batch, (source) => {
        return new Promise((resolve) => {
            $.ajax({
                type: "GET",
                url: (path || '') + source,
                   dataType: "text",
                   success: (code) => {
                       $.executeInOrder(source, code, resolve);
                   },
                   cache: true
            });
        });
    });

    _arr.push($.Deferred((deferred) => {
        $(deferred.resolve);
    }));

    return $.when.apply($, _arr);
}

$.getUrlparams = () => {
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');

    for(var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = (typeof hash[1] !== 'undefined' ? hash[1].replace(/^(?:(.*:)?\/\/)?(.*)/i, (match, schemma, nonSchemmaUrl) => schemma ? match : `http://${nonSchemmaUrl}`) : '');
    }

    return vars;
}

$.loadSettings = async () => {
    try {
        const response = await loadJson('/config', 'settings');
        Object.assign(settings, response);

    } catch (error) {
        console.error("Failed to load settings:", error);
    }
};

$.loadLangs = async (language = settings.default_lang) => {
    try {
        const response = await loadJson('/langs', language);
        Object.assign(langText, response);
        updateUIWithLangText(langText);
    } catch {
        showModal({
            title: 'An error occurred',
            subtitle: 'Translation content is unavailable',
            content: `<p>Unfortunately, the language file could not be loaded. The login system will automatically switch to ${settings.langs[settings.default_lang]}.</p>`,
            iconText: '&#9888;',
            customStyles: {
                headerColor: settings.modal.auth_failed_header_color,
                overlayColor: settings.modal.overlay_color,
                timeout: settings.modal.timeout,
                timeoutProgressbar: true,
                pauseOnHover: true
            },
            onOpen: async () => {
                await $.loadLangs(settings.default_lang);
            },
            onClose: () => {
                $.setLangLayout(settings.langs, settings.default_lang, '#polyglotLanguageSwitcher');
                $.createCookie('lang', settings.default_lang, 31);
            }
        });
    }
};

$.setLang = (id) => {
    $(id).polyglotLanguageSwitcher({
        effect: 'slide',
        noRefresh: true,
        onChange: (evt) => {
            $.createCookie('lang', evt.selectedItem, 31);
            langText = {};
            $.loadLangs(evt.selectedItem);

            if (typeof $('#inputCode') !== 'undefined') {
                $('#inputCode').prop('readonly', false).focus();
            }
        }
    });
}

$.setLangLayout = (langs, selectedLang, container) => {
    const options = Object.entries(langs)
    .map(([key, value]) => `<option id="${key}" value="${key}"${key === selectedLang ? ' selected' : ''}>${value}</option>`)
    .join('');

    const dropdownHTML = `<div id="polyglotLanguageSwitcher"><form action="javascript:void(0);"><select id="polyglot-language-options">${options}</select></form></div>`;

    $(container).html(dropdownHTML);
    $.setLang(container);
};

$.clientInfo = async (data) => {
    await waitForObject(langText);

    const container = $(`#cp_portal_event_${data.authType}`);

    if (!container.length) {
        return;
    }

    const appendInfo = (wrapperClass, title, value, className = 'config-address') => container.append(`<p class="${wrapperClass}"><span class="if-title">${title}</span> <span class="${className}">${value}</span></p>`);

    data.ipAddress && appendInfo('flex-50', langText.cp_portal_ifconfig_ip_address, data.ipAddress);
    data.macAddress && appendInfo('flex-50', langText.cp_portal_ifconfig_mac_address, data.macAddress);

    if (typeof data.startTime === 'number') {
        appendInfo('flex-100', langText.cp_session_start_time, formatISO(data.startTime * 1000).join(' '), 'config-info');
    }

    if (data.acc_session_timeout != null && $('.wrapperTimeLeft').length === 0) {
        let timeLeft = parseInt(data.acc_session_timeout, 10);
        const sinceLogon = (Date.now() / 1000) - parseInt(data.startTime, 10);
        timeLeft = Math.max(timeLeft - sinceLogon, 0);

        appendInfo('wrapperTimeLeft flex-100', langText.cp_session_time_left, updateTimeLeft(timeLeft), 'time-left-value');

        const timer = setInterval(() => {
            timeLeft -= 60;

            if (timeLeft <= 0) {
                clearInterval(timer);
                showModal({
                    title: langText.cp_session_timeout_title,
                    subtitle: langText.cp_session_timeout_info_title,
                    content: langText.cp_session_timeout_content,
                    iconText: '&#x27f3;',
                    customStyles: {
                        timeout: settings.modal.timeout,
                        timeoutProgressbar: true,
                        pauseOnHover: true
                    },
                    onClose: () => window.location.reload()
                });
            }

            $('.wrapperTimeLeft .time-left-value').text(updateTimeLeft(timeLeft));
        }, 60000);
    }
};

const updateTimeLeft = (timeLeft) => {
    const days = Math.floor(timeLeft / 43200);
    const hours = Math.floor((timeLeft % 43200) / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);

    const formatTime = (value, texts) => {
        if (value === 0) {
            return '';
        }

        const lastTwoDigits = value % 100;
        const lastDigit = value % 10;

        if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
            return `${value} ${texts.other}`;
        }

        if (value === 1) {
            return `${value} ${texts.one}`;
        }

        if (lastDigit >= 2 && lastDigit <= 4) {
            return `${value} ${texts.few}`;
        }

        return `${value} ${texts.other}`;
    };

    const daysText = formatTime(days, {
        one: langText.cp_session_time_left_one_day,
        few: langText.cp_session_time_left_two_four_days,
        other: langText.cp_session_time_left_other_days
    });

    const hoursText = formatTime(hours, {
        one: langText.cp_session_time_left_one_hour,
        few: langText.cp_session_time_left_two_four_hours,
        other: langText.cp_session_time_left_other_hours
    });

    const minutesText = (days === 0 && hours === 0 && minutes < 1)
    ? langText.cp_session_time_left_less_than_minute
    : formatTime(minutes, {
        one: langText.cp_session_time_left_one_minute,
        few: langText.cp_session_time_left_two_four_minutes,
        other: langText.cp_session_time_left_other_minutes
    });

    return [daysText, hoursText, minutesText].filter(Boolean).join(', ');
};

$.createCookie = (name, value, days) => {
    var d = new Date();
    d.setTime(d.getTime() + (days*24*60*60000));
    var expires = "expires=" + d.toGMTString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

$.getCookie = (cname) => {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');

    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }

    return "";
}

$.authorisationFailed = (onClose = null) => {
    var modal = {
        title: langText.cp_error_login_err,
        subtitle: langText.cp_error_info_title,
        content: langText.cp_error_info + langText.cp_error_solution_title + langText.cp_error_solution,
        iconText: '&#9888;',
        customStyles: {
            headerColor: settings.modal.auth_failed_header_color,
            overlayColor: settings.modal.overlay_color,
            timeout: settings.modal.timeout,
            timeoutProgressbar: true,
            pauseOnHover: true
        }
    };

    if (onClose instanceof Object) {
        Object.assign(modal, onClose);
    }

    showModal(modal);
}

$.showRules = () => {
    showModal({
        title: langText.cp_rules_title,
        subtitle: langText.cp_rules_info_title,
        content: langText.cp_rules_content,
        iconText: '&#167;',
        customStyles: {
            width: 800,
            top: 70,
            bottom: 70
        }
    });
};

$.connectionFailed = () => {
    showModal({
        title: langText.cp_error_title,
        subtitle: langText.cp_error_server_connection,
        iconText: '&#9888;',
        customStyles: {
            headerColor: settings.modal.conn_failed_header_color,
            overlayColor: settings.modal.overlay_color,
            borderBottom: false,
        }
    });
}

$.connectionBlocked = (loginDelay) => {
    showModal({
        title: langText.cp_login_attempt_title,
        subtitle: langText.cp_login_attempt_info_title,
        iconText: '&#9888;',
        content: sprintf(langText.cp_login_attempt_content, settings.login.attempts, settings.login.delay, (settings.login.delay == 1 ? langText.cp_login_attempt_minute : langText.cp_login_attempt_minutes)),
        customStyles: {
            headerColor: settings.modal.conn_failed_header_color,
            overlayColor: settings.modal.overlay_color,
            borderBottom: false,
            timeout: new Date(loginDelay - Date.now()).getTime(),
            timeoutProgressbar: true,
            overlayClose: false,
            closeButton: false,
            closeOnEscape: false
        }
    });
};

$.connectionLogon = (data) => {
    if ($.isAttempt(data)) {
        $.connectionBlocked(data.local);
    }

    if (data.clientState == 'AUTHORIZED') {
        if (settings.login.control && typeof data.loginTime !== 'undefined') {
            delete data.loginTime;
        }

        if (settings.layout.redirect_url.length > 0 && isValidUrl(settings.layout.redirect_url)) {
            window.location.replace(settings.layout.redirect_url);
        } else if ($.getUrlparams()['redirurl'] != undefined) {
            window.location = $.getUrlparams()['redirurl'] + '?refresh';
        } else {
            window.location.reload();
        }
    } else {
        $('#inputUsername, #inputPassword').val('');

        if (settings.login.control && settings.login.attempts > 0) {
            attempt++;
            var ts = Date.now();
            data.loginTime = new Date(Date.now());

            if (settings.login.attempts - attempt === 0) {
                data.loginTime.setTime(data.loginTime.getTime() + settings.login.delay*60000);
                document.cookie = "loginTime=" + data.loginTime + ";expires=" + data.loginTime + ";path=/";
                $.authorisationFailed(
                    {onClose: () => $.connectionBlocked(data.loginTime)}
                );
                $.setAttempt(data);
            }
        }

        $.authorisationFailed();
    }
}

$.connectionStatus = (data) => {
    if (data.clientState != 'AUTHORIZED' && data.authType != undefined && null == localId) {
        localId = [...data.ipAddress].map((x, i) => (x.codePointAt() ^ data.authType.charCodeAt(i % data.authType.length) % 255).toString(16).padStart(2,'0')).join('');
    }

    if (data.clientState == 'AUTHORIZED') {
        $('#login_normal').addClass('d-none');
        $('#logout_undefined').removeClass('d-none');
    } else if (data.authType == 'none') {
        $('#login_normal').addClass('d-none');
        $('#login_none').removeClass('d-none');
    } else {
        if (settings.login.control && settings.login.attempts > 0 && $.isAttempt(data)) {
            $.connectionBlocked(data.local);
        }
        $('#login_normal').removeClass('d-none');
    }

    $('.row, .footer-isp-info').addClass('ready');
}

$.isAttempt = (data) => {
    $.getAttempt(data);

    if (null == data.local) {
        return false;
    }

    var now     = new Date(Date.now());
    var control = new Date($.getCookie('loginTime'));
    data.local  = new Date(
        JSON.parse(
            String.fromCharCode(...(data.local).match(/.{1,2}/g).map((e,i) => parseInt(e, 16) ^ localId.charCodeAt(i % localId.length) % 255))
        ).loginTime
    );

    if (now >= data.local) {
        window.localStorage.removeItem('loginAttempt');
        return false;
    }

    if (now < data.local || control != data.local) {
        return true;
    }

    return false;
}

$.setAttempt = (batch) => {
    batch = JSON.stringify(batch);
    batch = [...batch].map((x, i) => (x.codePointAt() ^ localId.charCodeAt(i % localId.length) % 255).toString(16).padStart(2,'0')).join('');
    window.localStorage.setItem('loginAttempt', batch);
}

$.getAttempt = (data) => {
    data.local = window.localStorage.getItem('loginAttempt');
    return data;
}