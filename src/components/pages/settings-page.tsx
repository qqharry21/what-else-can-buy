import { useEffect } from 'react';

export const SettingsPage = () => {
  useEffect(() => {
    const language = chrome.i18n.getUILanguage();
    console.log('🚨 - language', language);
  }, []);

  return <div>SettingsPage</div>;
};
