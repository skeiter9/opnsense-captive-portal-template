import { useState } from 'react';
import { LanguageSwitcher } from '../components/layout/LanguageSwitcher';
import { Logo } from '../components/layout/Logo';
import { AccessCodeForm } from '../components/auth/AccessCodeForm';
import { ErrorModal } from '../components/modals/ErrorModal';
import { TermsModal } from '../components/modals/TermsModal';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../contexts/LanguageContext';

export function LoginPage() {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showError, setShowError] = useState(false);
  const { authenticate, loading, errorType, authType } = useAuth();
  const { t } = useLanguage();

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
            {t('cp_wellcome_title', 'User login system')}
          </h1>
          
          <p className="text-center text-gray-600 mb-6">
            {t('cp_wellcome_info_title', 'Welcome to the network')}
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
                {t('cp_text_accept', 'I accept')}{' '}
                <button
                  onClick={() => setShowTerms(true)}
                  className="text-forest hover:underline font-medium"
                >
                  {t('cp_link_rules', 'terms')}
                </button>
                {' '}{t('cp_text_provision', 'of the provision of internet access services.')}
              </span>
            </label>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">
              {t('cp_network_interface', 'Network interface configuration')}
            </h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p><span className="font-medium">IP:</span> 127.0.0.1</p>
              <p><span className="font-medium">MAC:</span> 00:11:22:33:44:55</p>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-gray-500">
            <p>{t('cp_footer_info', 'Burbase Invitados - Internet Service Provider')}</p>
            <p className="mt-1">{t('cp_footer_address', 'Street 10, City & Post Code etc.')}</p>
          </div>
        </div>

        <div className="mt-4 text-center text-sm text-white/80">
          <p>{t('cp_cookie_notice', 'This site uses cookies to store information on your computer.')}</p>
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
