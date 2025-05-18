import { usePageContext } from '@/hooks/usePageContext';
import { ArrowLeftIcon, SettingsIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from './ui/button';

export const Header = () => {
  const { page, setPage } = usePageContext();
  const { t } = useTranslation();

  const handleClick = () => {
    setPage(page === 'home' ? 'settings' : 'home');
  };

  return (
    <header className='border-b w-full p-4 flex items-center justify-between'>
      <div className='flex items-center gap-2'>
        <h1 className='font-semibold text-lg'>💸 {t('appName')}</h1>
      </div>

      <Button
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
      </Button>
    </header>
  );
};
