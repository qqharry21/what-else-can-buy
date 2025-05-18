import { useGlobalContext } from '@/hooks/useGlobalContext';
import { Switch } from './ui/switch';

export const EnableSwitcher = () => {
  const { enabled, setEnabled } = useGlobalContext();

  const handleChange = async (checked: boolean) => {
    await chrome.storage.local.set({ enabled: checked });
    setEnabled(checked);
  };

  return (
    <div className='flex items-center space-x-2'>
      <Switch
        id='enabled-switch'
        checked={enabled}
        onCheckedChange={handleChange}
      />
    </div>
  );
};
