import { useState, useEffect } from 'react';
import { get } from 'idb-keyval';

export const useIdbUrl = (url: string) => {
  const [resolvedUrl, setResolvedUrl] = useState<string>(url);

  useEffect(() => {
    let objectUrl: string | null = null;
    let isActive = true;

    setResolvedUrl(url); // Initial set to avoid delay if not idb://

    if (url && url.startsWith('idb://')) {
      const key = url.replace('idb://', '');
      get(key).then(file => {
        if (!isActive) return;
        if (file instanceof File || file instanceof Blob) {
          objectUrl = URL.createObjectURL(file);
          setResolvedUrl(objectUrl);
        }
      }).catch(err => {
        console.error("Failed to load file from IndexedDB:", err);
      });
    }

    return () => {
      isActive = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [url]);

  return resolvedUrl;
};
