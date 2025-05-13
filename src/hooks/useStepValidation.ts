// src/hooks/useStepValidation.ts
import { formSchema, type FormSchema } from '@/lib/schema';
import { useFormContext } from 'react-hook-form';

export function useStepValidation(fields: (keyof FormSchema)[]) {
  const { getValues, setError, clearErrors } = useFormContext<FormSchema>();

  const validateStep = () => {
    const values = getValues();
    // 只取需要驗證的欄位
    const stepValues = Object.fromEntries(fields.map((key) => [key, values[key]]));
    // 只取需要的 schema
    const stepSchema = formSchema.pick(
      fields.reduce((acc, key) => ({ ...acc, [key]: true }), {}) as {
        [K in keyof FormSchema]?: true;
      }
    );
    const result = stepSchema.safeParse(stepValues);
    if (result.success) {
      clearErrors();
      return true;
    } else {
      result.error.errors.forEach((err) => {
        setError(err.path[0] as keyof FormSchema, { message: err.message });
      });
      return false;
    }
  };

  return { validateStep };
}
