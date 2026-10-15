'use client';

import type { ButtonHTMLAttributes } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  appName: string;
};

export function Button({ appName, children, ...props }: ButtonProps) {
  return (
    <button
      type="button"
      {...props}
      onClick={() => window.alert(`Hello from ${appName}!`)}
    >
      {children}
    </button>
  );
}
