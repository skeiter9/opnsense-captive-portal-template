import { useLanguage } from '../../contexts/LanguageContext';

export function ErrorModal({ isOpen, onClose, errorType = 'invalid', authType = 'normal' }) {
  const { t } = useLanguage();

  if (!isOpen) return null;

  const isCodeAuth = authType === 'code' || authType === 'voucher';
  const isExpired = errorType === 'expired';

  let title, subtitle, info, solution, headerClass, icon;

  if (isCodeAuth && isExpired) {
    title = t('cp_error_code_expired_title', 'Access Code Expired');
    subtitle = t('cp_error_code_expired_subtitle', 'Your access code is no longer valid');
    info = t('cp_error_code_expired_info', 'The access code has expired.');
    solution = t('cp_error_code_expired_solution', 'Request a new access code.');
    headerClass = 'modal-header-expired';
    icon = '⏰';
  } else if (isCodeAuth) {
    title = t('cp_error_login_err', 'Invalid username or password');
    subtitle = t('cp_error_info_title', 'Unable to authenticate');
    info = t('cp_error_code_info', 'The access code is invalid.');
    solution = t('cp_error_code_solution', 'Double-check the code.');
    headerClass = 'modal-header-error';
    icon = '⚠️';
  } else {
    title = t('cp_error_login_err', 'Invalid username or password');
    subtitle = t('cp_error_info_title', 'Unable to authenticate');
    info = t('cp_error_info', 'Please check your credentials.');
    solution = t('cp_error_solution', 'Try again or contact support.');
    headerClass = 'modal-header-error';
    icon = '⚠️';
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className={`modal-header ${headerClass}`}>
          <span className="text-2xl">{icon}</span>
          <div>
            <div className="text-lg font-bold">{title}</div>
            <div className="text-sm opacity-90">{subtitle}</div>
          </div>
        </div>
        <div className="modal-body">
          <div className="mb-4" dangerouslySetInnerHTML={{ __html: info }} />
          <div className="font-medium mb-2">{t('cp_error_solution_title', 'What can you do?')}</div>
          <div dangerouslySetInnerHTML={{ __html: solution }} />
          <button
            onClick={onClose}
            className="btn-primary w-full mt-6"
          >
            {t('cp_button_close', 'Close')}
          </button>
        </div>
      </div>
    </div>
  );
}
