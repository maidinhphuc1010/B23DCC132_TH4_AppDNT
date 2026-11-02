import { useRef, useState } from 'react';
export function useMutation() {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const busy = useRef(false);
  async function run(operation, onSuccess) {
    if (busy.current) {
      return;
    }
    busy.current = true;
    setSaving(true);
    setError(null);
    try {
      await operation();
      onSuccess?.();
    } catch (failure) {
      setError(failure.message || 'Không thể lưu thay đổi.');
    } finally {
      busy.current = false;
      setSaving(false);
    }
  }
  return { saving, error, run };
}
