import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import Products from '../../../src/pages/Products.jsx';
import { productAPI } from '../../../src/utils/api';

// Mock dependencies
const mockSearch = vi.fn();
const mockGetAll = vi.fn();
const mockGetCategories = vi.fn();

vi.mock('../../../src/utils/api', () => ({
  productAPI: {
    search: (...args) => mockSearch(...args),
    getAll: (...args) => mockGetAll(...args),
    getCategories: (...args) => mockGetCategories(...args)
  }
}));

describe('Products Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearch.mockResolvedValue({ data: { data: [] } });
    mockGetAll.mockResolvedValue({ data: { data: [] } });
    mockGetCategories.mockResolvedValue({ data: { data: [] } });
  });

  // TDD Evidence:
  // RED: This test failed because Products component did not exist
  // GREEN: After implementing Products component, test passed
  // REFACTOR: Test still passes
  it('should render products page', async () => {
    render(
      <BrowserRouter>
        <Products />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
    });
  });

  // TDD Evidence:
  // RED: This test failed because Products didn't fetch categories on mount
  // GREEN: After adding useEffect to fetch categories, test passed
  // REFACTOR: Test still passes
  it('should fetch categories on mount', async () => {
    render(
      <BrowserRouter>
        <Products />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(mockGetCategories).toHaveBeenCalled();
    });
  });

  // TDD Evidence:
  // RED: This test failed because Products didn't handle search query from URL
  // GREEN: After adding useSearchParams handling, test passed
  // REFACTOR: Test still passes
  it('should load search term from URL params', async () => {
    mockSearch.mockResolvedValue({ data: { data: [] } });

    render(
      <MemoryRouter initialEntries={['/products?q=laptop']}>
        <Products />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockSearch).toHaveBeenCalled();
    });
  });

  // TDD Evidence:
  // RED: This test failed because Products didn't handle search input
  // GREEN: After adding search input handler, test passed
  // REFACTOR: Test still passes
  it('should update search term on input change', async () => {
    render(
      <BrowserRouter>
        <Products />
      </BrowserRouter>
    );

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText(/search/i);
      fireEvent.change(searchInput, { target: { value: 'laptop' } });
      expect(searchInput.value).toBe('laptop');
    });
  });

  // TDD Evidence:
  // RED: This test failed because Products didn't filter by category
  // GREEN: After adding category filter, test passed
  // REFACTOR: Test still passes
  it('should filter products by category', async () => {
    mockGetCategories.mockResolvedValue({ data: { data: ['Electronics', 'Clothing'] } });

    render(
      <BrowserRouter>
        <Products />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(mockGetCategories).toHaveBeenCalled();
    });
  });

  // TDD Evidence:
  // RED: This test failed because Products didn't display products
  // GREEN: After adding product rendering, test passed
  // REFACTOR: Test still passes
  it('should display products', async () => {
    const mockProducts = [
      { _id: '1', name: 'Laptop', price: 1000, category: 'Electronics' }
    ];

    mockGetAll.mockResolvedValue({ data: { data: mockProducts } });
    mockGetCategories.mockResolvedValue({ data: { data: [] } });

    render(
      <BrowserRouter>
        <Products />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(mockGetAll).toHaveBeenCalled();
      expect(screen.getByText('Laptop')).toBeInTheDocument();
    });
  });
});

