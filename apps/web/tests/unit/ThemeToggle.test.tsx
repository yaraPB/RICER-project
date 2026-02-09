import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeToggle } from '@/components/layout/ThemeToggle';

// Mock the Icon and IconButton components
vi.mock('@/components/ui/Icon', () => ({
  Icon: ({ name }: { name: string }) => <span data-testid={`icon-${name}`}>{name}</span>,
}));

vi.mock('@/components/ui/IconButton', () => ({
  IconButton: ({ children, onClick, label }: any) => (
    <button onClick={onClick} aria-label={label} data-testid="theme-toggle">
      {children}
    </button>
  ),
}));

describe('ThemeToggle Component', () => {
  let localStorageMock: Record<string, string>;

  beforeEach(() => {
    // Mock localStorage
    localStorageMock = {};
    global.localStorage = {
      getItem: vi.fn((key) => localStorageMock[key] || null),
      setItem: vi.fn((key, value) => {
        localStorageMock[key] = value;
      }),
      removeItem: vi.fn((key) => {
        delete localStorageMock[key];
      }),
      clear: vi.fn(() => {
        localStorageMock = {};
      }),
      length: 0,
      key: vi.fn(),
    } as Storage;

    // Mock matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    // Clear classList
    document.documentElement.classList.remove('dark');
  });

  afterEach(() => {
    document.documentElement.classList.remove('dark');
  });

  describe('initialization', () => {
    it('renders with light theme by default', async () => {
      render(<ThemeToggle />);

      await waitFor(() => {
        const button = screen.getByTestId('theme-toggle');
        expect(button).toBeInTheDocument();
        expect(button).toHaveAttribute('aria-label', 'Dark mode');
      });

      expect(screen.getByTestId('icon-moon')).toBeInTheDocument();
    });

    it('initializes from localStorage if available', async () => {
      localStorageMock['theme'] = 'dark';

      render(<ThemeToggle />);

      await waitFor(() => {
        expect(document.documentElement.classList.contains('dark')).toBe(true);
        expect(screen.getByTestId('icon-sun')).toBeInTheDocument();
      });
    });

    it('respects system preference when no localStorage value', async () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query: string) => ({
          matches: query === '(prefers-color-scheme: dark)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      render(<ThemeToggle />);

      await waitFor(() => {
        expect(document.documentElement.classList.contains('dark')).toBe(true);
        expect(screen.getByTestId('icon-sun')).toBeInTheDocument();
      });
    });
  });

  describe('theme toggling', () => {
    it('switches from light to dark theme', async () => {
      const user = userEvent.setup();
      render(<ThemeToggle />);

      await waitFor(() => {
        expect(screen.getByTestId('icon-moon')).toBeInTheDocument();
      });

      const button = screen.getByTestId('theme-toggle');
      await user.click(button);

      await waitFor(() => {
        expect(document.documentElement.classList.contains('dark')).toBe(true);
        expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'dark');
        expect(screen.getByTestId('icon-sun')).toBeInTheDocument();
        expect(button).toHaveAttribute('aria-label', 'Light mode');
      });
    });

    it('switches from dark to light theme', async () => {
      const user = userEvent.setup();
      localStorageMock['theme'] = 'dark';

      render(<ThemeToggle />);

      await waitFor(() => {
        expect(screen.getByTestId('icon-sun')).toBeInTheDocument();
      });

      const button = screen.getByTestId('theme-toggle');
      await user.click(button);

      await waitFor(() => {
        expect(document.documentElement.classList.contains('dark')).toBe(false);
        expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'light');
        expect(screen.getByTestId('icon-moon')).toBeInTheDocument();
        expect(button).toHaveAttribute('aria-label', 'Dark mode');
      });
    });

    it('toggles multiple times correctly', async () => {
      const user = userEvent.setup();
      render(<ThemeToggle />);

      await waitFor(() => {
        expect(screen.getByTestId('icon-moon')).toBeInTheDocument();
      });

      const button = screen.getByTestId('theme-toggle');

      // First click: light -> dark
      await user.click(button);
      await waitFor(() => {
        expect(document.documentElement.classList.contains('dark')).toBe(true);
      });

      // Second click: dark -> light
      await user.click(button);
      await waitFor(() => {
        expect(document.documentElement.classList.contains('dark')).toBe(false);
      });

      // Third click: light -> dark
      await user.click(button);
      await waitFor(() => {
        expect(document.documentElement.classList.contains('dark')).toBe(true);
      });
    });
  });

  describe('localStorage persistence', () => {
    it('saves theme preference to localStorage', async () => {
      const user = userEvent.setup();
      render(<ThemeToggle />);

      await waitFor(() => {
        expect(screen.getByTestId('icon-moon')).toBeInTheDocument();
      });

      const button = screen.getByTestId('theme-toggle');
      await user.click(button);

      await waitFor(() => {
        expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'dark');
      });
    });

    it('persists theme across re-renders', async () => {
      const user = userEvent.setup();
      const { unmount } = render(<ThemeToggle />);

      await waitFor(() => {
        expect(screen.getByTestId('icon-moon')).toBeInTheDocument();
      });

      const button = screen.getByTestId('theme-toggle');
      await user.click(button);

      await waitFor(() => {
        expect(localStorageMock['theme']).toBe('dark');
      });

      unmount();

      // Re-render component
      render(<ThemeToggle />);

      await waitFor(() => {
        expect(screen.getByTestId('icon-sun')).toBeInTheDocument();
        expect(document.documentElement.classList.contains('dark')).toBe(true);
      });
    });
  });

  describe('accessibility', () => {
    it('has proper aria-label in light mode', async () => {
      render(<ThemeToggle />);

      await waitFor(() => {
        const button = screen.getByTestId('theme-toggle');
        expect(button).toHaveAttribute('aria-label', 'Dark mode');
      });
    });

    it('has proper aria-label in dark mode', async () => {
      localStorageMock['theme'] = 'dark';
      render(<ThemeToggle />);

      await waitFor(() => {
        const button = screen.getByTestId('theme-toggle');
        expect(button).toHaveAttribute('aria-label', 'Light mode');
      });
    });

    it('is keyboard accessible', async () => {
      const user = userEvent.setup();
      render(<ThemeToggle />);

      await waitFor(() => {
        expect(screen.getByTestId('icon-moon')).toBeInTheDocument();
      });

      const button = screen.getByTestId('theme-toggle');

      // Focus the button
      button.focus();
      expect(button).toHaveFocus();

      // Press Enter
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(document.documentElement.classList.contains('dark')).toBe(true);
      });
    });
  });

  describe('icon rendering', () => {
    it('displays moon icon in light mode', async () => {
      render(<ThemeToggle />);

      await waitFor(() => {
        expect(screen.getByTestId('icon-moon')).toBeInTheDocument();
        expect(screen.queryByTestId('icon-sun')).not.toBeInTheDocument();
      });
    });

    it('displays sun icon in dark mode', async () => {
      localStorageMock['theme'] = 'dark';
      render(<ThemeToggle />);

      await waitFor(() => {
        expect(screen.getByTestId('icon-sun')).toBeInTheDocument();
        expect(screen.queryByTestId('icon-moon')).not.toBeInTheDocument();
      });
    });
  });
});
