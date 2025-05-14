import { useTranslation } from 'react-i18next';

export const Header = () => {
  const { t } = useTranslation();

  return (
    <header className='border-b p-4 flex items-center justify-center'>
      <div className='flex items-center gap-2'>
        <h1 className='font-semibold text-lg'>💸 {t('appName')}</h1>
      </div>

      {/* <Button
        variant='ghost'
        size='icon'
        onClick={handleClick}>
        {page === 'home' ? (
          <>
            <SettingsIcon className='h-4 w-4' />
            <span className='sr-only'>Settings</span>
          </>
        ) : (
          <>
            <ArrowLeftIcon className='h-4 w-4' />
            <span className='sr-only'>Home</span>
          </>
        )}
      </Button> */}
    </header>
  );
};
