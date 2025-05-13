import { useGlobalContext } from '@/hooks/useGlobalContext';

export const SettingsPage = () => {
  const { currency, category, available } = useGlobalContext();
  console.log('🚨 - currency', currency);
  console.log('🚨 - available', available);
  console.log('🚨 - category', category);

  return <div>SettingsPage</div>;
};
