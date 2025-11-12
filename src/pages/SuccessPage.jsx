import { useEffect, useState } from 'react';
import { CountdownWidget } from '../components/ui/CountdownWidget';
import { Logo } from '../components/layout/Logo';
import { LanguageSwitcher } from '../components/layout/LanguageSwitcher';
import { captivePortalApi } from '../services/captivePortalApi';
import { useLanguage } from '../contexts/LanguageContext';

export function SuccessPage() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    loadSession();
  }, []);

  const loadSession = async () => {
    try {
      const data = await captivePortalApi.status();
      setSession(data);
    } catch (error) {
      console.error('Failed to load session:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await captivePortalApi.logoff();
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">
          {t('cp_loading', 'Loading')}...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <LanguageSwitcher />
        </div>

        <div className="card">
          <Logo />
          
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {t('cp_success_title', 'Connected Successfully!')}
            </h1>
            <p className="text-gray-600">
              {t('cp_success_subtitle', 'You now have access to the internet')}
            </p>
          </div>

          {session && (
            <div className="space-y-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">
                  {t('cp_session_info', 'Session Information')}
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('cp_label_ip', 'IP Address')}:</span>
                    <span className="font-medium">{session.ipAddress || '127.0.0.1'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('cp_label_mac', 'MAC Address')}:</span>
                    <span className="font-medium">{session.macAddress || '00:11:22:33:44:55'}</span>
                  </div>
                  {session.userName && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('cp_label_user', 'User')}:</span>
                      <span className="font-medium">{session.userName}</span>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="btn-secondary w-full"
              >
                {t('cp_button_logoff', 'Disconnect')}
              </button>
            </div>
          )}

          <div className="text-center text-xs text-gray-500">
            <p>{t('cp_footer_info', 'Burbase Invitados - Internet Service Provider')}</p>
          </div>
        </div>
      </div>

      {session?.sessionTimeout && (
        <CountdownWidget
          sessionEndTime={session.sessionTimeout}
          ticketType={session.ticketType}
        />
      )}
    </div>
  );
}
