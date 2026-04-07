import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { ThemeProvider, useTheme } from './ThemeContext';

describe('ThemeContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('provides theme mode and toggles theme, persisting to localStorage', async () => {
    localStorage.setItem('themeMode', 'light');

    const TestComponent = () => {
      const { mode, toggleTheme } = useTheme();
      return (
        <div>
          <span>mode:{mode}</span>
          <button onClick={toggleTheme}>toggle</button>
        </div>
      );
    };

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByText(/mode:light/)).toBeInTheDocument();

    fireEvent.click(screen.getByText('toggle'));

    await waitFor(() => expect(screen.getByText(/mode:dark/)).toBeInTheDocument());
    expect(localStorage.getItem('themeMode')).toBe('dark');
  });

  it('throws when `useTheme` is used outside of ThemeProvider', () => {
    const Bad = () => {
      // this should throw during render
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _ = useTheme();
      return null;
    };

    expect(() => render(<Bad />)).toThrow('useTheme must be used within a ThemeProvider');
  });
});
