import { useEffect } from 'react';

export const SettingsPage = () => {
  function getAcceptLanguages() {
    chrome.i18n.getAcceptLanguages(function (languageList) {
      console.log('🚨 - languageList', languageList);
    });
  }

  useEffect(() => {
    getAcceptLanguages();
  }, []);

  return <div>SettingsPage</div>;
};
