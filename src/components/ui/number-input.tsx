import React from 'react';
import { Input } from './input';

export const NumberInput = (
  props: Omit<React.ComponentProps<typeof Input>, 'type' | 'onChange'> & {
    onChange: (value: number) => void;
  }
) => {
  return (
    <Input
      type='number'
      {...props}
      onChange={(e) => {
        const value = e.target.value;
        if (value === '' || /^\d+$/.test(value)) {
          props.onChange?.(Number(value));
        }
      }}
      onBlur={(e) => {
        let value = e.target.value;
        // 去除前導零
        value = value.replace(/^0+(\d+)/, '$1');
        // 如果是空字串，設為 0
        if (value === '') value = '0';
        // 更新 input 顯示
        e.target.value = value;
        // 觸發 onChange
        props.onChange?.(Number(value));
      }}
    />
  );
};
