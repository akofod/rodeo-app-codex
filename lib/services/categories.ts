export const SERVICE_CATEGORY_OPTIONS = [
  { value: 'farrier', label: 'Farrier' },
  { value: 'trainer', label: 'Trainer' },
  { value: 'stock-contractor', label: 'Stock Contractor' },
  { value: 'ranch-services', label: 'Ranch Services' },
  { value: 'photography', label: 'Photography' },
  { value: 'veterinary', label: 'Veterinary' },
  { value: 'transportation', label: 'Transportation' },
] as const;

export type ServiceCategoryValue = (typeof SERVICE_CATEGORY_OPTIONS)[number]['value'];

const CATEGORY_BY_VALUE = new Map<string, string>(
  SERVICE_CATEGORY_OPTIONS.map((option) => [option.value, option.label]),
);

const LEGACY_LABEL_TO_VALUE = new Map<string, ServiceCategoryValue>(
  SERVICE_CATEGORY_OPTIONS.map((option) => [option.label.toLowerCase(), option.value]),
);

export const normalizeServiceCategory = (value: string): ServiceCategoryValue | null => {
  const normalized = value.trim().toLowerCase();
  if (!normalized) {
    return null;
  }

  const slugCandidate = normalized.replace(/\s+/g, '-');
  if (CATEGORY_BY_VALUE.has(slugCandidate)) {
    return slugCandidate as ServiceCategoryValue;
  }

  return LEGACY_LABEL_TO_VALUE.get(normalized) ?? null;
};

export const getServiceCategoryLabel = (value: string): string => {
  const normalized = normalizeServiceCategory(value);
  if (!normalized) {
    return value;
  }
  return CATEGORY_BY_VALUE.get(normalized) ?? value;
};
