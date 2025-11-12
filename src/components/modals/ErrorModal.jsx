import { useLanguage } from '../../contexts/LanguageContext';

export function ErrorModal({ isOpen, onClose, errorType = 'invalid', authType = 'normal' }) {
  const { t } = useLanguage();

  if (!isOpen) return null;

  const isCodeAuth = authType === 'code' || authType === 'voucher';
  const isExpired = errorType === 'expired';

  let title, subtitle, reasons, solutions, headerClass, icon;

  if (isCodeAuth && isExpired) {
    title = t('cp_error_code_expired_title', 'Access Code Expired');
    subtitle = t('cp_error_code_expired_subtitle', 'Your access code is no longer valid');
    reasons = t('cp_error_code_expired_info', 'The access code has expired.').split('\n').filter(Boolean);
    solutions = t('cp_error_code_expired_solution', 'Request a new access code.').split('\n').filter(Boolean);
    headerClass = 'bg-gradient-to-r from-amber-500 to-orange-500';
    icon = '⏰';
  } else if (isCodeAuth) {
    title = t('cp_error_login_err', 'Invalid username or password');
    subtitle = t('cp_error_info_title', 'Unable to authenticate');
    reasons = t('cp_error_code_info', 'The access code is invalid.').split('\n').filter(Boolean);
    solutions = t('cp_error_code_solution', 'Double-check the code.').split('\n').filter(Boolean);
    headerClass = 'bg-gradient-to-r from-red-600 to-red-500';
    icon = '⚠️';
  } else {
    title = t('cp_error_login_err', 'Invalid username or password');
    subtitle = t('cp_error_info_title', 'Unable to authenticate');
    reasons = t('cp_error_info', 'Please check your credentials.').split('\n').filter(Boolean);
    solutions = t('cp_error_solution', 'Try again or contact support.').split('\n').filter(Boolean);
    headerClass = 'bg-gradient-to-r from-red-600 to-red-500';
    icon = '⚠️';
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-slideUp" onClick={(e) => e.stopPropagation()}>
        <div className={`${headerClass} text-white p-6 flex items-center gap-4`}>
          <span className="text-4xl">{icon}</span>
          <div className="flex-1">
            <div className="text-xl font-bold">{title}</div>
            <div className="text-sm opacity-95 mt-1">{subtitle}</div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-lg">🔍</span>
              <span>{t('cp_error_info_title', 'Possible reasons:')}</span>
            </h3>
            <ul className="space-y-2">
              {reasons.map((reason, index) => (
                <li key={index} className="flex items-start gap-3 text-gray-700">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600 mt-0.5">
                    {index + 1}
                  </span>
                  <span className="text-sm leading-relaxed">{reason}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r">
            <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <span className="text-lg">💡</span>
              <span>{t('cp_error_solution_title', 'What you can do:')}</span>
            </h3>
            <ul className="space-y-2">
              {solutions.map((solution, index) => (
                <li key={index} className="flex items-start gap-2 text-blue-800">
                  <span className="text-blue-500 mt-1">•</span>
                  <span className="text-sm leading-relaxed">{solution}</span>
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-forest to-forest-dark text-white py-3 px-6 rounded-lg font-medium hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
          >
            {t('cp_button_close', 'Close')}
          </button>
        </div>
      </div>
    </div>
  );
}
