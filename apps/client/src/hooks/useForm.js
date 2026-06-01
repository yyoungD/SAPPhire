import { useState } from 'react';

export function useForm(initialValues) {
  const [values, setValues] = useState(initialValues);
  const setField = (name, value) => setValues((current) => ({ ...current, [name]: value }));
  const handleChange = (event) => setField(event.target.name, event.target.value);
  const reset = () => setValues(initialValues);
  return { values, setValues, setField, handleChange, reset };
}
