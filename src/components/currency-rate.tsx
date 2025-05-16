import type { ExchangeInfo } from '@/lib/types';
import { useTranslation } from 'react-i18next';

type CurrencyWithRate = Pick<
  ExchangeInfo,
  'productCurrencyToTWD' | 'salaryCurrencyToTWD' | 'productCurrency' | 'salaryCurrency'
>;

export const CurrencyRate = ({
  productCurrencyToTWD,
  salaryCurrencyToTWD,
  productCurrency,
  salaryCurrency,
}: CurrencyWithRate) => {
  const { t } = useTranslation();
  return (
    <div className='text-center text-sm text-neutral-500'>
      {productCurrencyToTWD !== 1 && <p> 1 TWD ≈ {`${productCurrencyToTWD} ${productCurrency}`}</p>}
      {salaryCurrencyToTWD !== 1 && <p> 1 TWD ≈ {`${salaryCurrencyToTWD} ${salaryCurrency}`}</p>}
      {productCurrencyToTWD === salaryCurrencyToTWD && <p>{t('result.same_currency')}</p>}
    </div>
  );
};
