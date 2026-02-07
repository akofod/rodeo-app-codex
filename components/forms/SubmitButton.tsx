'use client';

import { useState } from 'react';

type SubmitButtonProps = {
  label: string;
  pendingLabel: string;
  className: string;
};

export default function SubmitButton({ label, pendingLabel, className }: SubmitButtonProps) {
  const [pending, setPending] = useState(false);

  return (
    <button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      onClick={(event) => {
        const form = event.currentTarget.form;
        if (!form || form.checkValidity()) {
          setPending(true);
        }
      }}
      className={`${className} disabled:cursor-not-allowed disabled:opacity-60`}
    >
      {pending ? pendingLabel : label}
    </button>
  );
}
