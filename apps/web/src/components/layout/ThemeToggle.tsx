'use client';

import React, { useEffect, useState } from 'react';
import { IconButton } from '@/components/ui/IconButton';
import { Icon } from '@/components/ui/Icon';

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const stored = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initial = stored ?? (prefersDark ? 'dark' : 'light');
    setTheme(initial);
    document.documentElement.classList.toggle('dark', initial === 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  return (
    <IconButton
      label={theme === 'light' ? 'Dark mode' : 'Light mode'}
      onClick={toggleTheme}
    >
      <Icon name={theme === 'light' ? 'moon' : 'sun'} aria-hidden size={20} />
    </IconButton>
  );
}
