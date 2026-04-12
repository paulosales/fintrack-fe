import React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from './LoginPage';
import { startPkceLogin } from './pkce';

vi.mock('./pkce', () => ({
  startPkceLogin: vi.fn(),
}));

const renderLoginPage = () =>
  render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>
  );

beforeEach(() => {
  vi.clearAllMocks();
});

describe('LoginPage', () => {
  it('renders the app logo and title', () => {
    renderLoginPage();
    expect(screen.getByText('Fintrack')).toBeInTheDocument();
  });

  it('renders all three provider buttons', () => {
    renderLoginPage();
    expect(screen.getByRole('button', { name: /google/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /facebook/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /enterprise sso/i })).toBeInTheDocument();
  });

  it('calls startPkceLogin with the correct idp hint when a provider button is clicked', async () => {
    vi.mocked(startPkceLogin).mockResolvedValue(undefined);
    renderLoginPage();
    fireEvent.click(screen.getByRole('button', { name: /google/i }));
    await waitFor(() => {
      expect(startPkceLogin).toHaveBeenCalledWith('google');
    });
  });

  it('shows a loading spinner while the PKCE flow is initiating', async () => {
    vi.mocked(startPkceLogin).mockReturnValue(new Promise(() => {}));
    renderLoginPage();
    fireEvent.click(screen.getByRole('button', { name: /google/i }));
    await waitFor(() => {
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });

  it('shows an error alert when PKCE initiation fails', async () => {
    vi.mocked(startPkceLogin).mockRejectedValue(new Error('Crypto unavailable'));
    renderLoginPage();
    fireEvent.click(screen.getByRole('button', { name: /google/i }));
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });
});
