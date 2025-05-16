import enAlternatives from '../../locales/en/alternatives.json';
import en from '../../locales/en/message.json';
import enZod from '../../locales/en/zod.json';
import zh_TWAlternatives from '../../locales/zh_TW/alternatives.json';
import zh_TW from '../../locales/zh_TW/message.json';
import zh_TWZod from '../../locales/zh_TW/zod.json';

const resources = {
  en: {
    translation: en,
    zod: enZod,
    alternatives: enAlternatives,
  },
  zh_TW: {
    translation: zh_TW,
    zod: zh_TWZod,
    alternatives: zh_TWAlternatives,
  },
};

export default resources;
