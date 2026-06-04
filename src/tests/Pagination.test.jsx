import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import Pagination from '../pages/reusables/Pagination';

describe('Pagination', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('increments numerically when currentPage is provided as a string', () => {
    const onPageChange = vi.fn();

    render(
      <Pagination
        currentPage="1"
        lastPage="4"
        onPageChange={onPageChange}
        totalItems={40}
        perPage={10}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('shows zero-safe entry counts when there are no results', () => {
    const onPageChange = vi.fn();

    render(
      <Pagination
        currentPage={1}
        lastPage={1}
        onPageChange={onPageChange}
        totalItems={0}
        perPage={10}
      />
    );

    expect(screen.getByText(/showing/i)).toHaveTextContent('Showing 0 to 0 of 0 entries');
    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled();
  });
});
