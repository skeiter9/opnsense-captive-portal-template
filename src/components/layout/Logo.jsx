import { useSettings } from '../../contexts/SettingsContext';

export function Logo() {
  const { settings } = useSettings();

  if (!settings) return null;

  return (
    <div className="flex justify-center mb-6">
      <div className="bg-white p-4 rounded-xl shadow-lg">
        <img
          src="/images/logo.svg"
          alt="Logo"
          className="h-20 w-auto object-contain"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      </div>
    </div>
  );
}
