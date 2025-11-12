import { useLanguage } from '../../contexts/LanguageContext';

export function TermsModal({ isOpen, onClose }) {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-slideUp" onClick={(e) => e.stopPropagation()}>
        <div className={`bg-gradient-to-r from-forest to-forest-dark text-white p-6 flex items-center gap-4`}>
          <span className="text-4xl">📋</span>
          <div className="flex-1">
            <div className="text-lg font-bold">{t('cp_rules_title', 'Terms and Conditions')}</div>
            <div className="text-sm opacity-90">{t('cp_rules_info_title', 'Please read carefully')}</div>
          </div>
        </div>
        <div className="modal-body max-h-[60vh] overflow-y-auto p-6">
          <div
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: t('cp_rules_content', '') }}
          />
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
