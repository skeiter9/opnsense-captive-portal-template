import { useEffect, useState } from 'react';
import { useCountdown } from '../../hooks/useCountdown';
import { useLanguage } from '../../contexts/LanguageContext';

export function CountdownWidget({ sessionEndTime, ticketType }) {
  const [isVisible, setIsVisible] = useState(false);
  const { formattedTime, isExpired } = useCountdown(sessionEndTime);
  const { t } = useLanguage();

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible || isExpired) return null;

  return (
    <div className="fixed bottom-6 right-6 bg-white rounded-xl shadow-2xl p-6 max-w-xs animate-fade-in z-50">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-forest rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-sm mb-1">
            {t('cp_countdown_title', 'Time Remaining')}
          </h3>
          {ticketType && (
            <p className="text-xs text-gray-500 mb-2">
              {t('cp_ticket_type', 'Ticket')}: {ticketType}
            </p>
          )}
          <div className="text-2xl font-bold text-forest tabular-nums">
            {formattedTime}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {t('cp_countdown_subtitle', 'Your internet access time')}
          </p>
        </div>
      </div>
    </div>
  );
}
