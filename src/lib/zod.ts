import { z } from 'zod';
import { zodI18nMap } from './zodI18nMap';

z.setErrorMap(zodI18nMap);

export { z };
