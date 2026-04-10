import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LanguageSelector from './LanguageSelector';
import i18n from '../i18n';

describe('LanguageSelector', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('opens menu and changes language when selecting an item', async () => {
    const spy = vi.spyOn(i18n, 'changeLanguage');

    render(<LanguageSelector />);

    // IconButton has aria-label set to the language label
    const button = screen.getByLabelText(/Language/i);
    fireEvent.click(button);

    // Wait for menu items to appear
    expect(await screen.findByText(/Français \(FR\)/i)).toBeInTheDocument();

    const frenchItem = screen.getByText(/Français \(FR\)/i);
    fireEvent.click(frenchItem);

    await waitFor(() => expect(spy).toHaveBeenCalledWith('fr-FR'));

    // language change should be persisted by i18n languageChanged handler
    await waitFor(() => expect(localStorage.getItem('fintrack-language')).toBe('fr-FR'));

    spy.mockRestore();
  });
});
