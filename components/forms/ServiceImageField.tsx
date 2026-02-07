'use client';
/* eslint-disable @next/next/no-img-element */

import { useMemo, useState } from 'react';

const isValidImageUrl = (value: string) => {
  if (!value) {
    return false;
  }
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
};

export default function ServiceImageField() {
  const [value, setValue] = useState('');
  const previewUrl = useMemo(() => (isValidImageUrl(value) ? value : ''), [value]);

  return (
    <div className="grid gap-3">
      <label className="grid gap-2 text-sm text-slate-200">
        Service image URL (optional)
        <input
          type="url"
          name="image_url"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="https://..."
          className="rounded-xl border border-white/10 bg-night-900/70 px-4 py-2 text-slate-100 placeholder:text-slate-400"
        />
        <span className="text-xs text-slate-300">Use a full URL starting with https://.</span>
      </label>
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-night-900/70">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Service image preview"
            className="h-40 w-full object-cover"
          />
        ) : (
          <div className="flex h-40 items-center justify-center px-4 text-center text-sm text-slate-300">
            No image selected. A branded fallback will be shown on detail pages.
          </div>
        )}
      </div>
    </div>
  );
}
