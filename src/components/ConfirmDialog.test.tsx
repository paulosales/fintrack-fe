import { fireEvent, render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ConfirmDialog from './ConfirmDialog';

describe('ConfirmDialog', () => {
  it('renders title and string content and calls cancel/confirm handlers', () => {
    const onCancel = vi.fn();
    const onConfirm = vi.fn();

    render(
      <ConfirmDialog
        open={true}
        title="Confirm Delete"
        content="Are you sure?"
        onCancel={onCancel}
        onConfirm={onConfirm}
      />
    );

    expect(screen.getByText(/Confirm Delete/i)).toBeInTheDocument();
    expect(screen.getByText(/Are you sure/i)).toBeInTheDocument();

    const cancelBtn = screen.getByRole('button', { name: /Cancel/i });
    const confirmBtn = screen.getByRole('button', { name: /Delete/i });

    fireEvent.click(cancelBtn);
    expect(onCancel).toHaveBeenCalled();

    fireEvent.click(confirmBtn);
    expect(onConfirm).toHaveBeenCalled();
  });

  it('renders node content and custom button labels', () => {
    const onCancel = vi.fn();
    const onConfirm = vi.fn();

    render(
      <ConfirmDialog
        open={true}
        content={<span>Node content</span>}
        confirmText="Yes"
        cancelText="No"
        onCancel={onCancel}
        onConfirm={onConfirm}
      />
    );

    expect(screen.getByText(/Node content/i)).toBeInTheDocument();

    const noBtn = screen.getByRole('button', { name: /No/i });
    const yesBtn = screen.getByRole('button', { name: /Yes/i });

    fireEvent.click(noBtn);
    expect(onCancel).toHaveBeenCalled();

    fireEvent.click(yesBtn);
    expect(onConfirm).toHaveBeenCalled();
  });
});
