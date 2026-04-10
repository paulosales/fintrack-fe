import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PaginationControls from './PaginationControls';

describe('PaginationControls', () => {
  it('renders page size select and items text', () => {
    const onPageChange = vi.fn();
    const onPageSizeChange = vi.fn();

    render(
      <PaginationControls
        page={1}
        pageSize={10}
        totalCount={42}
        totalPages={5}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    );

    // page size select (combobox) is present
    expect(screen.getByRole('combobox')).toBeInTheDocument();

    // items text includes count
    expect(screen.getByText(/42 items/i)).toBeInTheDocument();
  });

  it('calls onPageChange when pagination is used and onPageSizeChange when selecting a size', async () => {
    const onPageChange = vi.fn();
    const onPageSizeChange = vi.fn();

    render(
      <PaginationControls
        page={1}
        pageSize={10}
        totalCount={100}
        totalPages={10}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    );

    // Click page 2 button in pagination (MUI labels page buttons like "Go to page 2")
    const page2 = screen.getByRole('button', { name: /go to page 2/i });
    fireEvent.click(page2);
    expect(onPageChange).toHaveBeenCalledWith(2);

    // Open page size select and choose 20 — MUI renders the select as a combobox
    const combobox = screen.getByRole('combobox');
    fireEvent.mouseDown(combobox);
    const option20 = screen.getByRole('option', { name: '20' });
    fireEvent.click(option20);
    expect(onPageSizeChange).toHaveBeenCalledWith(20);
  });
});
