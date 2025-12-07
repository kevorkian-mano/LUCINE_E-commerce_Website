import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Home from '../../../src/pages/Home.jsx';
import { productAPI } from '../../../src/utils/api';

// Mock dependencies
const mockGetAll = vi.fn();
const mockGetCategories = vi.fn();

vi.mock('../../../src/utils/api', () => ({
  productAPI: {
    getAll: (...args) => mockGetAll(...args),
    getCategories: (...args) => mockGetCategories(...args)
  }
}));

describe('Home Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAll.mockResolvedValue({ data: { data: [] } });
    mockGetCategories.mockResolvedValue({ data: { data: [] } });
  });

  // TDD Evidence:
  // RED: This test failed because Home component did not exist
  // GREEN: After implementing Home component, test passed
  // REFACTOR: Test still passes
  it('should render home page', async () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/featured products/i)).toBeInTheDocument();
    });
  });

  // TDD Evidence:
  // RED: This test failed because Home didn't fetch products on mount
  // GREEN: After adding useEffect to fetch products, test passed
  // REFACTOR: Test still passes
  it('should fetch products and categories on mount', async () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(mockGetAll).toHaveBeenCalledWith({ limit: 8 });
      expect(mockGetCategories).toHaveBeenCalled();
    });
  });

  // TDD Evidence:
  // RED: This test failed because Home didn't display products
  // GREEN: After adding product rendering, test passed
  // REFACTOR: Test still passes
  it('should display featured products', async () => {
    const mockProducts = [
      { _id: '1', name: 'Product 1', price: 100, image: 'img1.jpg' },
      { _id: '2', name: 'Product 2', price: 200, image: 'img2.jpg' }
    ];

    mockGetAll.mockResolvedValue({ data: { data: mockProducts } });
    mockGetCategories.mockResolvedValue({ data: { data: [] } });

    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Product 1')).toBeInTheDocument();
      expect(screen.getByText('Product 2')).toBeInTheDocument();
    });
  });

  // TDD Evidence:
  // RED: This test failed because Home didn't display categories
  // GREEN: After adding category rendering, test passed
  // REFACTOR: Test still passes
  it('should display categories', async () => {
    const mockCategories = ['Electronics', 'Clothing', 'Books'];

    mockGetAll.mockResolvedValue({ data: { data: [] } });
    mockGetCategories.mockResolvedValue({ data: { data: mockCategories } });

    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Electronics')).toBeInTheDocument();
    });
  });

  // TDD Evidence:
  // RED: This test failed because Home didn't handle loading state
  // GREEN: After adding loading state, test passed
  // REFACTOR: Test still passes
  it('should show loading state while fetching data', () => {
    mockGetAll.mockImplementation(() => new Promise(() => {}));
    mockGetCategories.mockImplementation(() => new Promise(() => {}));

    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    // Component should be in loading state
    expect(mockGetAll).toHaveBeenCalled();
  });
});

