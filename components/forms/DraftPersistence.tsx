'use client';

import { useEffect, useRef } from 'react';

type DraftPersistenceProps = {
  storageKey: string;
  fieldNames: string[];
};

const setFieldValue = (field: Element, value: string) => {
  if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement || field instanceof HTMLSelectElement)) {
    return;
  }

  if (field instanceof HTMLInputElement && field.type === 'checkbox') {
    field.checked = value === 'true';
    return;
  }

  field.value = value;
};

const getFieldValue = (field: Element) => {
  if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement || field instanceof HTMLSelectElement)) {
    return '';
  }

  if (field instanceof HTMLInputElement && field.type === 'checkbox') {
    return field.checked ? 'true' : 'false';
  }

  return field.value;
};

export default function DraftPersistence({ storageKey, fieldNames }: DraftPersistenceProps) {
  const anchorRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const form = anchorRef.current?.closest('form');
    if (!form) {
      return;
    }

    const stored = window.localStorage.getItem(storageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Record<string, string>;
        fieldNames.forEach((name) => {
          if (parsed[name] === undefined) {
            return;
          }
          const field = form.querySelector(`[name="${name}"]`);
          if (field) {
            setFieldValue(field, parsed[name]);
          }
        });
      } catch {
        window.localStorage.removeItem(storageKey);
      }
    }

    const persist = () => {
      const next: Record<string, string> = {};
      fieldNames.forEach((name) => {
        const field = form.querySelector(`[name="${name}"]`);
        if (field) {
          next[name] = getFieldValue(field);
        }
      });
      window.localStorage.setItem(storageKey, JSON.stringify(next));
    };

    form.addEventListener('input', persist);
    form.addEventListener('change', persist);

    return () => {
      form.removeEventListener('input', persist);
      form.removeEventListener('change', persist);
    };
  }, [fieldNames, storageKey]);

  return <span ref={anchorRef} className="hidden" aria-hidden="true" />;
}
