import { useLayoutEffect } from 'react';
export function useScreenTitle(navigation, title) {
  useLayoutEffect(() => {
    navigation.setOptions({ title });
  }, [navigation, title]);
}
