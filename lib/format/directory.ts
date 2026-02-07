const compact = (value: string | null | undefined) => (value ?? '').trim();

export const formatAddressLine = (input: {
  street?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  country?: string | null;
}) => {
  const street = compact(input.street);
  const locality = [compact(input.city), compact(input.state)].filter(Boolean).join(', ');
  const postal = compact(input.zip);
  const country = compact(input.country);

  const lineOne = [street, locality].filter(Boolean).join(', ');
  const lineTwo = [postal, country].filter(Boolean).join(' ');
  const value = [lineOne, lineTwo].filter(Boolean).join(', ');

  return value || 'Address pending';
};

export const formatPhoneNumber = (value: string | null | undefined) => {
  const digits = compact(value).replace(/\D/g, '');
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  return compact(value) || 'Not provided';
};

export const normalizeWebsiteUrl = (value: string | null | undefined) => {
  const url = compact(value);
  if (!url) {
    return null;
  }
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `https://${url}`;
};
