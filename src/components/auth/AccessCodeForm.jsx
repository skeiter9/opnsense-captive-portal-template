import { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

export function AccessCodeForm({ onSubmit, loading, termsAccepted }) {
  const [code, setCode] = useState('');
  const { t } = useLanguage();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (code.length === 5 && termsAccepted) {
      onSubmit(code);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="accessCode" className="block text-sm font-semibold text-gray-700 mb-3">
          {t('code', 'Access Code')}
        </label>
        <input
          id="accessCode"
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.slice(0, 5))}
          placeholder={t('code_placeholder', 'Enter 5-digit code')}
          className="w-full px-5 py-4 text-lg font-semibold text-center tracking-widest rounded-xl border-2 border-gray-300 focus:border-forest focus:ring-4 focus:ring-forest/20 outline-none transition-all duration-200 bg-white text-gray-900 placeholder:text-gray-400 placeholder:font-normal placeholder:tracking-normal"
          maxLength={5}
          required
          autoComplete="off"
        />
      </div>

      <button
        type="submit"
        disabled={code.length !== 5 || !termsAccepted || loading}
        className="btn-primary w-full"
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {t('signin', 'Log in')}...
          </span>
        ) : (
          t('signin', 'Log in')
        )}
      </button>
    </form>
  );
}
