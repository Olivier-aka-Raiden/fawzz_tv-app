import { useTranslation } from 'react-i18next';

function App() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col items-center justify-center gap-6">
      <img
        src="/assets/brand/logo.png"
        alt="Fawzz_tv"
        className="h-32 w-auto drop-shadow-[0_0_30px_rgba(145,70,255,0.4)]"
      />
      <p className="text-gray-500 text-sm">{t('common.construction')}</p>
    </div>
  )
}

export default App
