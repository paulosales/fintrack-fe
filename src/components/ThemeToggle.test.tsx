import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ThemeToggle from './ThemeToggle';
import { describe, it, expect, beforeEach } from 'vitest';
import { ThemeProvider } from '../context/ThemeContext';

describe('ThemeToggle', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('shows tooltip for switching to dark and toggles theme on click', async () => {
    // initialize saved mode to light
    localStorage.setItem('themeMode', 'light');

    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );

    const button = screen.getByRole('button', { name: /toggle theme/i });

    // Hover to show the tooltip
    fireEvent.mouseOver(button);

    // Tooltip should indicate switching to dark mode when current mode is light
    expect(await screen.findByText(/Switch to dark mode/i)).toBeInTheDocument();

    // Click to toggle theme
    fireEvent.click(button);

    // localStorage should be updated to dark
    await waitFor(() => expect(localStorage.getItem('themeMode')).toBe('dark'));

    // Hover again — tooltip should now indicate switching to light mode
    fireEvent.mouseOver(button);
    expect(await screen.findByText(/Switch to light mode/i)).toBeInTheDocument();
  });
});
