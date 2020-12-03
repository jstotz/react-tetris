import { useState } from "react";

export function useLocalStorage<T>(
  key: string,
  defaultValue: T
): [T, (value: T | null) => void] {
  const [valueState, setValueState] = useState<T>(() => {
    const initialPersistedData = window.localStorage.getItem(key);
    return initialPersistedData === null
      ? defaultValue
      : JSON.parse(initialPersistedData);
  });

  const setValue = (value: T | null) => {
    if (value === null) {
      window.localStorage.removeItem(key);
    } else {
      window.localStorage.setItem(key, JSON.stringify(value));
    }
    setValueState(value || defaultValue);
  };
  return [valueState, setValue];
}
