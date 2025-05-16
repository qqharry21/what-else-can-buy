import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type AlternativeTab = {
  title: string;
  icon: string;
  items: Alternative[];
};

type Alternative = {
  label: string;
  unitPrice: number;
  icon: string;
  unit?: string;
};

function sortByUnitPrice(items: Alternative[]) {
  return items.sort((a, b) => a.unitPrice - b.unitPrice);
}

type AlternativeKey = 'food' | 'cool' | 'travel';

export const AlternativeTabs = ({ productPrice }: { productPrice: number }) => {
  const { t } = useTranslation();
  const alternatives = t('alternatives', { returnObjects: true }) as Record<
    AlternativeKey,
    AlternativeTab
  >;

  const sortedAlternativesWithQuantityNotEmpty = useMemo(
    () =>
      Object.entries(alternatives).reduce((acc, [key, value]) => {
        const filteredAlternatives = sortByUnitPrice(value.items)
          .map((item) => ({
            ...item,
            quantity: Math.floor(productPrice / item.unitPrice),
          }))
          .filter((item) => item.quantity > 0);
        if (filteredAlternatives.length > 0) {
          acc[key as AlternativeKey] = {
            ...value,
            items: filteredAlternatives,
          };
        }
        return acc;
      }, {} as Record<AlternativeKey, AlternativeTab>),
    [alternatives, productPrice]
  );

  const alternativeKeys = Object.keys(sortedAlternativesWithQuantityNotEmpty);

  return (
    <>
      <h3 className='text-lg mb-4 text-center font-medium text-balance'>
        {t('result.alternatives.title')}
      </h3>
      <Tabs
        defaultValue='food'
        className='w-full flex-1'>
        <TabsList className='w-full mb-2'>
          <div className='overflow-x-auto flex items-center w-full'>
            {alternativeKeys.map((key) => (
              <TabsTrigger
                className='min-w-20 shrink-0'
                key={key}
                value={key}
                title={t(`alternatives.${key}.title`)}>
                {t(`alternatives.${key}.icon`)}
              </TabsTrigger>
            ))}
          </div>
        </TabsList>
        {Object.entries(sortedAlternativesWithQuantityNotEmpty).map(([key, value]) => (
          <TabsContent
            key={key}
            value={key}
            className='mt-0 grid sm:grid-cols-2 grid-cols-1 gap-4'>
            {value.items.map((item) => (
              <AlternativeCard
                key={item.label}
                item={item}
                productPrice={productPrice}
              />
            ))}
          </TabsContent>
        ))}
      </Tabs>
    </>
  );
};

const AlternativeCard = ({ item, productPrice }: { item: Alternative; productPrice: number }) => {
  const quantity = Math.floor(productPrice / item.unitPrice);
  const isZero = quantity === 0;
  if (isZero) return null;

  return (
    <Card className='p-0 overflow-hidden'>
      <CardContent className='p-4'>
        <div className='flex items-center gap-3'>
          <p className='text-2xl text-muted-foreground'>{item.icon}</p>
          <div className='flex-1'>
            <div className='flex justify-between items-start'>
              <p className='font-medium text-sm'>{item.label}</p>
            </div>
            <p className='text-neutral-900 font-bold text-xl'>
              {quantity}
              {item.unit && (
                <span className='ml-2 text-neutral-600 font-medium text-sm'>{item.unit}</span>
              )}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
