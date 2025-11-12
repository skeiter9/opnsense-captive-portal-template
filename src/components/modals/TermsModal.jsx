import { useLanguage } from '../../contexts/LanguageContext';

export function TermsModal({ isOpen, onClose }) {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header bg-forest">
          <span className="text-2xl">📋</span>
          <div>
            <div className="text-lg font-bold">{t('cp_rules_title', 'Terms and Conditions')}</div>
            <div className="text-sm opacity-90">{t('cp_rules_info_title', 'Please read carefully')}</div>
          </div>
        </div>
        <div className="modal-body max-h-[60vh] overflow-y-auto">
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
