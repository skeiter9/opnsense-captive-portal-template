import { useState, useEffect } from 'react';
import { LanguageSwitcher } from '../components/layout/LanguageSwitcher';
import { Logo } from '../components/layout/Logo';
import { AccessCodeForm } from '../components/auth/AccessCodeForm';
import { ErrorModal } from '../components/modals/ErrorModal';
import { TermsModal } from '../components/modals/TermsModal';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../contexts/LanguageContext';
import { captivePortalApi } from '../services/captivePortalApi';

export function LoginPage() {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showError, setShowError] = useState(false);
  const [clientInfo, setClientInfo] = useState({ ipAddress: '...', macAddress: '...' });
  const { authenticate, loading, errorType, authType } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    fetchClientInfo();
  }, []);

  const fetchClientInfo = async () => {
    try {
      const data = await captivePortalApi.status();
      setClientInfo({
        ipAddress: data.ipAddress || '127.0.0.1',
        macAddress: data.macAddress || '00:11:22:33:44:55'
      });
    } catch (error) {
      console.log('Could not fetch client info, using defaults');
      setClientInfo({
        ipAddress: '127.0.0.1',
        macAddress: '00:11:22:33:44:55'
      });
    }
  };

  const handleCodeSubmit = async (code) => {
    const username = code.substring(0, 2);
    const password = code.substring(2, 5);

    const result = await authenticate({
      user: username,
      password: password,
    }, 'code');

    if (result.success) {
      window.location.href = '/success.html';
    } else {
      setShowError(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <LanguageSwitcher />
        </div>

        <div className="card">
          <Logo />
          
          <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
            {t('cp_portal_head_title', 'User login system')}
          </h1>
          
          <p className="text-center text-gray-600 mb-6">
            {t('cp_portal_info', 'Welcome to the network')}
          </p>

          <AccessCodeForm
            onSubmit={handleCodeSubmit}
            loading={loading}
            termsAccepted={termsAccepted}
          />

          <div className="mt-4">
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-1 w-4 h-4 text-forest border-gray-300 rounded focus:ring-forest"
              />
              <span className="text-sm text-gray-700">
                {t('termcondition1', 'I accept')}{' '}
                <button
                  onClick={() => setShowTerms(true)}
                  className="text-forest hover:underline font-medium"
                >
                  {t('rules', 'terms')}
                </button>
                {' '}{t('termcondition2', 'of the provision of internet access services.')}
              </span>
            </label>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">
              {t('cp_portal_ifconfig_event_normal', 'Network interface configuration')}
            </h3>
            <div className="space-y-1 text-gray-600">
              <p><span className="font-medium text-sm">{t('cp_portal_ifconfig_ip_address', 'IP')}:</span> <span className="text-sm">{clientInfo.ipAddress}</span></p>
              <p><span className="font-medium text-sm">{t('cp_portal_ifconfig_mac_address', 'MAC')}:</span> <span className="text-sm">{clientInfo.macAddress}</span></p>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-gray-500">
            <p>{t('isp_info.isp_name', 'Burbase Invitados - Internet Service Provider')}</p>
            <p className="mt-1">{t('isp_info.isp_address', 'Street 10, City & Post Code etc.')}</p>
          </div>
        </div>

        <div className="mt-4 text-center text-sm text-white/80">
          <p>{t('cp_portal_cookies_note', 'This site uses cookies to store information on your computer.')}</p>
        </div>
      </div>

      <ErrorModal
        isOpen={showError}
        onClose={() => setShowError(false)}
        errorType={errorType}
        authType={authType}
      />

      <TermsModal
        isOpen={showTerms}
        onClose={() => setShowTerms(false)}
      />
    </div>
  );
}
