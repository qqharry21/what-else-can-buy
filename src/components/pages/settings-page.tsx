import { LanguageSwitcher } from '@/components/language-switcher';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import { EnableSwitcher } from '../enable-switcher';

export const SettingsPage = () => {
  const { t } = useTranslation();

  return (
    <div className='container mx-auto p-4'>
      <Card>
        <CardHeader>
          <CardTitle className='text-lg'>{t('settings.title')}</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex items-center justify-between'>
            <div>
              <h3 className='text-lg font-medium'>{t('settings.enable.title')}</h3>
              <p className='text-sm text-muted-foreground'>{t('settings.enable.description')}</p>
            </div>
            <EnableSwitcher />
          </div>
          <div className='flex items-center justify-between'>
            <div>
              <h3 className='text-lg font-medium'>{t('settings.language.title')}</h3>
              <p className='text-sm text-muted-foreground'>{t('settings.language.description')}</p>
            </div>
            <LanguageSwitcher />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
