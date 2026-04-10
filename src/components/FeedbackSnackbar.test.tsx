import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import FeedbackSnackbar from './FeedbackSnackbar';

describe('FeedbackSnackbar', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the message and calls onClose when close button is clicked', async () => {
    const onClose = vi.fn();

    render(
      <FeedbackSnackbar
        open={true}
        message="Saved successfully"
        severity="success"
        onClose={onClose}
      />
    );

    // message is shown
    expect(screen.getByText(/Saved successfully/i)).toBeInTheDocument();

    // Alert should be present with role alert
    expect(screen.getByRole('alert')).toBeInTheDocument();

    // click the close icon button (aria-label="close")
    const closeBtn = screen.getByLabelText(/close/i);
    fireEvent.click(closeBtn);

    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose after autoHideDuration elapses', async () => {
    vi.useFakeTimers();
    const onClose = vi.fn();

    render(
      <FeedbackSnackbar
        open={true}
        message="Auto hide"
        severity="error"
        onClose={onClose}
        autoHideDuration={1000}
      />
    );

    expect(screen.getByText(/Auto hide/i)).toBeInTheDocument();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1100);
    });

    expect(onClose).toHaveBeenCalled();
  });
});
