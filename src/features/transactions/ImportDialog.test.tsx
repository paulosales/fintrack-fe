import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import importReducer from './importSlice';
import authReducer from '../auth/authSlice';
import ImportDialog from './ImportDialog';

function buildStore(token: string | null = 'test-token') {
  return configureStore({
    reducer: {
      import: importReducer,
      auth: authReducer,
    },
    preloadedState: {
      auth: { token, loading: false, error: null },
    },
  });
}

function renderDialog(
  props: {
    open?: boolean;
    onClose?: () => void;
    onSuccess?: () => void;
  } = {},
  token: string | null = 'test-token'
) {
  const store = buildStore(token);
  const defaults = {
    open: true,
    onClose: vi.fn(),
    onSuccess: vi.fn(),
    ...props,
  };
  const utils = render(
    <Provider store={store}>
      <ImportDialog {...defaults} />
    </Provider>
  );
  return { ...utils, store };
}

describe('ImportDialog', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders dialog title and submit button when open', () => {
    renderDialog({ open: true });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Import Transactions')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Import$/i.toBeInTheDocument();
  });

  it('does not render when closed', () => {
    renderDialog({ open: false });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders the importer type autocomplete', () => {
    renderDialog();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('shows select file button', () => {
    renderDialog();
    expect(screen.getByRole('button', { name: /Select CSV File/i })).toBeInTheDocument();
  });

  it('shows cancel button', () => {
    renderDialog();
    expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
  });

  it('shows validation error when submitting without importer', async () => {
    renderDialog();
    fireEvent.click(screen.getByRole('button', { name: /^Import$/i }));
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
    expect(screen.getByText('Please select a bank.ank.')).toBeInTheDocument();
  });

  it('shows validation error when submitting without file after importer is selected', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          import_id: 'id',
          importer: 'rbc',
          queued_count: 0,
          message: '',
        }),
      })
    );
    const { store } = renderDialog();
    // Open the autocomplete and select rbc
    const combobox = screen.getByRole('combobox');
    fireEvent.change(combobox, { target: { value: 'rbc' } });
    const option = await screen.findByText('rbc');
    fireEvent.click(option);

    // Submit without file
    fireEvent.click(screen.getByRole('button', { name: /^Import$/i }));
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
    expect(screen.getByText('Please select a CSV file. a CSV file.')).toBeInTheDocument();
    expect(store.getState().import.loading).toBe(false);
  });

  it('displays selected file name after file selection', async () => {
    renderDialog();
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['col1,col2\n1,2'], 'my-transactions.csv', { type: 'text/csv' });
    fireEvent.change(fileInput, { target: { files: [file] } }{ files: [file] } });
    await waitFor(() => {
      expect(screen.getByText('my-transactions.csv')).toBeInTheDocument();
    });
  });

  it('calls dispatch and onSuccess when submission succeeds', async () => {
    const mockResponse = {
      import_id: 'import-abc',
      importer: 'pcfinancial',
      queued_count: 5,
      message: '5 transactions queued.',
    };
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      })
    );

    const onSuccess = vi.fn();
    const { store } = renderDialog({ onSuccess });

    // Select importer
    const combobox = screen.getByRole('combobox');
    fireEvent.change(combobox, { target: { value: 'pcfinancial' } });
    const option = await screen.findByText('pcfinancial');
    fireEvent.click(option);

    // Select file
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['date,amount\n2024-01-01,100'], 'data.csv', { type: 'text/csv' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    // Submit
    fireEvent.click(screen.getByRole('button', { name: /^Import$/i;

    await waitFor(() => {
      expect(store.getState().import.importId).toBe('import-abc');
    });
    expect(onSuccess).toHaveBeenCalled();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('shows error alert from store on failed import', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 422,
        text: async () => 'Unprocessable Entity',
      })
    );

    renderDialog();

    // Select importer
    const combobox = screen.getByRole('combobox');
    fireEvent.change(combobox, { target: { value: 'rbc' } });
    const option = await screen.findByText('rbc');
    fireEvent.click(option);

    // Select file
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['bad data'], 'bad.csv', { type: 'text/csv' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    // Submit
    fireEvent.click(screen.getByRole('button', { name: /^Import$/i;

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  it('calls onClose when cancel is clicked', () => {
    const onClose = vi.fn();
    renderDialog({ onClose });
    fireEvent.click(screen.getByRole('button', { name: /Cancel/i
    expect(onClose).toHaveBeenCalled();
  });

  it('resets state when dialog is reopened', async () => {
    const { store, rerender } = renderDialog({ open: true });

    // Close and reopen dialog to verify reset
    rerender(
      <Provider store={store}>
        <ImportDialog open={false} onClose={vi.fn()} onSuccess={vi.fn()} />
      </Provider>
    );
    rerender(
      <Provider store={store}>
        <ImportDialog open={true} onClose={vi.fn()} onSuccess={vi.fn()} />
      </Provider>
    );

    // State should be reset
    expect(store.getState().import.importId).toBe(null);
    expect(store.getState().import.error).toBe(null);
  });
});
