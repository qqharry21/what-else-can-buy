import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useTranslation } from 'react-i18next';

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = async () => {
    const newLang = i18n.language === 'en' ? 'zh-TW' : 'en';
    await i18n.changeLanguage(newLang);
    await chrome.storage.local.set({ language: newLang });
  };

  return (
    <div className='flex items-center space-x-2'>
      <Label htmlFor='language-switch'>{i18n.language === 'en' ? 'English' : '繁體中文'}</Label>
      <Switch
        id='language-switch'
        checked={i18n.language === 'zh-TW'}
        onCheckedChange={toggleLanguage}
      />
    </div>
  );
};
