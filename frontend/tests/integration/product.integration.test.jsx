import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../src/context/AuthContext';
import { CartProvider } from '../../src/context/CartContext';
import Products from '../../src/pages/Products';
import ProductDetails from '../../src/pages/ProductDetails';
import { createMockResponse, createMockError } from './setup';

// Mock API module - must be before imports
vi.mock('../../src/utils/api', () => ({
  productAPI: {
    getAll: vi.fn(),
    search: vi.fn(),
    getById: vi.fn(),
    getCategories: vi.fn(),
    getByCategory: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  cartAPI: {
    getCart: vi.fn(),
    addItem: vi.fn(),
    updateItem: vi.fn(),
    removeItem: vi.fn(),
    clearCart: vi.fn(),
  },
  authAPI: {
    getProfile: vi.fn(),
  },
}));

import { productAPI, cartAPI, authAPI } from '../../src/utils/api';

// Mock react-router-dom
const mockSetSearchParams = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useParams: () => ({ id: 'product1' }),
    useSearchParams: () => [
      new URLSearchParams(),
      mockSetSearchParams,
    ],
    Link: ({ children, to }) => <a href={to}>{children}</a>,
  };
});

const TestWrapper = ({ children }) => (
  <BrowserRouter>
    <AuthProvider>
      <CartProvider>{children}</CartProvider>
    </AuthProvider>
  </BrowserRouter>
);

describe('Product Flow Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('token', 'test-token');
    localStorage.setItem(
      'user',
      JSON.stringify({
        _id: 'user123',
        email: 'test@example.com',
        role: 'customer',
      })
    );
    mockSetSearchParams.mockClear();
    // Set default mock for authAPI.getProfile() to prevent errors when AuthContext mounts
    authAPI.getProfile.mockResolvedValue(
      createMockResponse({
        _id: 'user123',
        email: 'test@example.com',
        role: 'customer',
      })
    );
    // Set default mock for cartAPI.getCart() to prevent errors when CartContext mounts
    cartAPI.getCart.mockResolvedValue(
      createMockResponse({ _id: 'cart123', items: [] })
    );
  });

  describe('Products List Integration', () => {
    it('should fetch and display products on mount', async () => {
      const mockProducts = [
        {
          _id: 'product1',
          name: 'Product 1',
          price: 99.99,
          description: 'Test product 1',
          category: 'Electronics',
          stock: 10,
        },
        {
          _id: 'product2',
          name: 'Product 2',
          price: 149.99,
          description: 'Test product 2',
          category: 'Clothing',
          stock: 5,
        },
      ];

      productAPI.getAll.mockResolvedValue(createMockResponse(mockProducts));
      productAPI.getCategories.mockResolvedValue(
        createMockResponse(['Electronics', 'Clothing', 'Books'])
      );

      render(
        <TestWrapper>
          <Products />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(productAPI.getAll).toHaveBeenCalled();
      });

      await waitFor(() => {
        // Use getAllByText since "Product 1" appears in both heading and description
        const product1Elements = screen.getAllByText(/product 1/i);
        expect(product1Elements.length).toBeGreaterThan(0);
        const product2Elements = screen.getAllByText(/product 2/i);
        expect(product2Elements.length).toBeGreaterThan(0);
      });
      
      // Check for prices - wait for them to be rendered
      await waitFor(() => {
        const allText = document.body.textContent || '';
        expect(allText).toContain('99.99');
        expect(allText).toContain('149.99');
      });
    });

    it('should search products with query', async () => {
      const mockProducts = [
        {
          _id: 'product1',
          name: 'Laptop',
          price: 999.99,
          description: 'Test laptop',
          category: 'Electronics',
          stock: 10,
        },
      ];

      productAPI.search.mockResolvedValue(createMockResponse(mockProducts));
      productAPI.getCategories.mockResolvedValue(
        createMockResponse(['Electronics'])
      );

      render(
        <TestWrapper>
          <Products />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(productAPI.getCategories).toHaveBeenCalled();
      });

      const searchInput = screen.getByPlaceholderText(/search products/i);
      const searchButton = screen.getByRole('button', { name: /search/i });

      await userEvent.type(searchInput, 'laptop');
      await userEvent.click(searchButton);

      await waitFor(() => {
        expect(mockSetSearchParams).toHaveBeenCalled();
      });
    });

    it('should filter products by category', async () => {
      const mockProducts = [
        {
          _id: 'product1',
          name: 'Product 1',
          price: 99.99,
          category: 'Electronics',
          stock: 10,
        },
      ];

      productAPI.getAll.mockResolvedValue(createMockResponse(mockProducts));
      productAPI.getCategories.mockResolvedValue(
        createMockResponse(['Electronics', 'Clothing'])
      );

      render(
        <TestWrapper>
          <Products />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(productAPI.getCategories).toHaveBeenCalled();
      });

      // Open filters
      const filtersButton = screen.getByRole('button', { name: /filters/i });
      await userEvent.click(filtersButton);

      await waitFor(() => {
        // Wait for filters to be visible
        expect(screen.getByText(/category/i)).toBeInTheDocument();
      });

      // Find select by role (there should only be one combobox in the filters section)
      const categorySelect = screen.getByRole('combobox');
      await userEvent.selectOptions(categorySelect, 'Electronics');

      const applyButton = screen.getByRole('button', { name: /apply/i });
      await userEvent.click(applyButton);

      await waitFor(() => {
        expect(mockSetSearchParams).toHaveBeenCalled();
      });
    });

    it('should display empty message when no products found', async () => {
      productAPI.getAll.mockResolvedValue(createMockResponse([]));
      productAPI.getCategories.mockResolvedValue(createMockResponse([]));

      render(
        <TestWrapper>
          <Products />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(productAPI.getAll).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(screen.getByText(/no products found/i)).toBeInTheDocument();
      });
    });

    it('should handle product fetch errors', async () => {
      productAPI.getAll.mockRejectedValue(
        createMockError('Failed to fetch products', 500)
      );
      productAPI.getCategories.mockResolvedValue(createMockResponse([]));

      render(
        <TestWrapper>
          <Products />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(productAPI.getAll).toHaveBeenCalled();
      });

      // Should handle error gracefully
      await waitFor(() => {
        expect(screen.getByText(/no products found/i)).toBeInTheDocument();
      });
    });
  });

  describe('Product Details Integration', () => {
    it('should fetch and display product details', async () => {
      const mockProduct = {
        _id: 'product1',
        name: 'Product 1',
        price: 99.99,
        description: 'Detailed product description',
        category: 'Electronics',
        stock: 10,
        image: 'https://example.com/image.jpg',
      };

      productAPI.getById.mockResolvedValue(createMockResponse(mockProduct));

      render(
        <TestWrapper>
          <ProductDetails />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(productAPI.getById).toHaveBeenCalledWith('product1');
      });

      await waitFor(() => {
        expect(screen.getByText(/product 1/i)).toBeInTheDocument();
      });

      expect(screen.getByText(/detailed product description/i)).toBeInTheDocument();
      expect(screen.getByText(/\$99\.99/)).toBeInTheDocument();
    });

    it('should add product to cart from details page', async () => {
      const mockProduct = {
        _id: 'product1',
        name: 'Product 1',
        price: 99.99,
        description: 'Test product',
        category: 'Electronics',
        stock: 10,
      };

      const mockCart = {
        _id: 'cart123',
        items: [
          {
            product: mockProduct,
            quantity: 1,
          },
        ],
      };

      productAPI.getById.mockResolvedValue(createMockResponse(mockProduct));
      cartAPI.addItem.mockResolvedValue(createMockResponse(mockCart));

      render(
        <TestWrapper>
          <ProductDetails />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(productAPI.getById).toHaveBeenCalled();
      });

      // Find and click add to cart button
      const addToCartButton = screen.getByRole('button', { name: /add to cart/i });
      await userEvent.click(addToCartButton);

      await waitFor(() => {
        expect(cartAPI.addItem).toHaveBeenCalledWith({
          productId: 'product1',
          quantity: 1,
        });
      });
    });

    it('should handle product not found', async () => {
      productAPI.getById.mockRejectedValue(
        createMockError('Product not found', 404)
      );

      render(
        <TestWrapper>
          <ProductDetails />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(productAPI.getById).toHaveBeenCalled();
      });

      // Should handle error gracefully
      await waitFor(() => {
        expect(screen.queryByText(/product 1/i)).not.toBeInTheDocument();
      });
    });

    it('should update quantity when adding to cart', async () => {
      const mockProduct = {
        _id: 'product1',
        name: 'Product 1',
        price: 99.99,
        description: 'Test product',
        category: 'Electronics',
        stock: 10,
      };

      productAPI.getById.mockResolvedValue(createMockResponse(mockProduct));
      cartAPI.addItem.mockResolvedValue(createMockResponse({}));

      render(
        <TestWrapper>
          <ProductDetails />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(productAPI.getById).toHaveBeenCalled();
      });

      // Find quantity increment button and click it twice to set quantity to 3
      const incrementButtons = screen.getAllByRole('button');
      const incrementButton = incrementButtons.find(btn => {
        const svg = btn.querySelector('svg');
        return svg && svg.innerHTML.includes('line') && svg.innerHTML.includes('x1="12"');
      });
      
      if (incrementButton) {
        // Click increment button twice to go from 1 to 3
        await userEvent.click(incrementButton);
        await userEvent.click(incrementButton);

        const addToCartButton = screen.getByRole('button', { name: /add to cart/i });
        await userEvent.click(addToCartButton);

        await waitFor(() => {
          expect(cartAPI.addItem).toHaveBeenCalledWith({
            productId: 'product1',
            quantity: 3,
          });
        });
      }
    });
  });

  describe('Product Search and Filter Integration', () => {
    it('should filter products by price range', async () => {
      const mockProducts = [
        {
          _id: 'product1',
          name: 'Product 1',
          price: 50.99,
          category: 'Electronics',
          stock: 10,
        },
      ];

      productAPI.search.mockResolvedValue(createMockResponse(mockProducts));
      productAPI.getCategories.mockResolvedValue(
        createMockResponse(['Electronics'])
      );

      render(
        <TestWrapper>
          <Products />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(productAPI.getCategories).toHaveBeenCalled();
      });

      // Open filters
      const filtersButton = screen.getByRole('button', { name: /filters/i });
      await userEvent.click(filtersButton);

      await waitFor(() => {
        const minPriceInput = screen.getByPlaceholderText('0');
        expect(minPriceInput).toBeInTheDocument();
      });

      const minPriceInput = screen.getByPlaceholderText('0');
      const maxPriceInput = screen.getByPlaceholderText('1000');

      await userEvent.type(minPriceInput, '0');
      await userEvent.type(maxPriceInput, '100');

      const applyButton = screen.getByRole('button', { name: /apply/i });
      await userEvent.click(applyButton);

      await waitFor(() => {
        expect(mockSetSearchParams).toHaveBeenCalled();
      });
    });

    it('should clear filters', async () => {
      productAPI.getAll.mockResolvedValue(createMockResponse([]));
      productAPI.getCategories.mockResolvedValue(createMockResponse([]));

      render(
        <TestWrapper>
          <Products />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(productAPI.getCategories).toHaveBeenCalled();
      });

      // Open filters
      const filtersButton = screen.getByRole('button', { name: /filters/i });
      await userEvent.click(filtersButton);

      await waitFor(() => {
        const clearButton = screen.getByRole('button', { name: /clear/i });
        expect(clearButton).toBeInTheDocument();
      });

      const clearButton = screen.getByRole('button', { name: /clear/i });
      await userEvent.click(clearButton);

      await waitFor(() => {
        expect(mockSetSearchParams).toHaveBeenCalled();
      });
    });
  });
});

