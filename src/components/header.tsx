import { ArrowLeftIcon, SettingsIcon } from 'lucide-react';

import { usePageContext } from '@/hooks/usePageContext';
import { useCallback } from 'react';
import { Button } from './ui/button';

export const Header = () => {
  const { page, setPage } = usePageContext();

  const handleClick = useCallback(() => {
    if (page === 'home') {
      setPage('settings');
    } else {
      setPage('home');
    }
  }, [page, setPage]);

  return (
    <header className='border-b p-4 flex items-center justify-between'>
      <div className='flex items-center gap-2'>
        <h1 className='font-semibold text-lg'>💸 What Else Could You Buy?</h1>
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
