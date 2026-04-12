import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import AuthErrorPage from './AuthErrorPage';

const renderErrorPage = (search = '') =>
  render(
    <MemoryRouter initialEntries={[`/auth/error${search}`]}>
      <Routes>
        <Route path="/auth/error" element={<AuthErrorPage />} />
        <Route path="/login" element={<div>Login Page</div>} />
      </Routes>
    </MemoryRouter>
  );

describe('AuthErrorPage', () => {
  it('renders the error title', () => {
    renderErrorPage();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('displays the error message from query params', () => {
    renderErrorPage('?message=invalid_token');
    expect(screen.getByText(/invalid_token/i)).toBeInTheDocument();
  });

  it('renders the back to login link', () => {
    renderErrorPage();
    expect(screen.getByRole('link', { name: /back to login/i })).toBeInTheDocument();
  });
});
