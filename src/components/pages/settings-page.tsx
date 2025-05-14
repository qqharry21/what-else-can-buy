import { useGlobalContext } from '@/hooks/useGlobalContext';

export const SettingsPage = () => {
  const { available } = useGlobalContext();

  return <div>SettingsPage</div>;
};
