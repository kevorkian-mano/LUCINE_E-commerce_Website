// Import classes (they're exported as named exports)
import { UserRepository } from '../repositories/userRepository.js';
import { ProductRepository } from '../repositories/productRepository.js';
import { CartRepository } from '../repositories/cartRepository.js';
import { OrderRepository } from '../repositories/orderRepository.js';

/**
 * RepositoryFactory
 * Factory Method Pattern for creating repository instances
 * Centralizes repository creation and allows dependency injection
 */
class RepositoryFactory {
  /**
   * Create repository instance
   * @param {string} repositoryName - Name of the repository ('user', 'product', 'cart', 'order')
   * @param {Object} options - Optional configuration (e.g., database connection, custom implementation)
   * @returns {Object} Repository instance
   * @throws {Error} If repository name is not found
   */
  static createRepository(repositoryName, options = {}) {
    const repositories = {
      'user': () => {
        // If custom repository provided, use it (useful for testing)
        if (options.repository) {
          return options.repository;
        }
        // Otherwise create new instance
        return new UserRepository();
      },
      'product': () => {
        if (options.repository) {
          return options.repository;
        }
        return new ProductRepository();
      },
      'cart': () => {
        if (options.repository) {
          return options.repository;
        }
        return new CartRepository();
      },
      'order': () => {
        if (options.repository) {
          return options.repository;
        }
        return new OrderRepository();
      }
    };

    const createRepository = repositories[repositoryName.toLowerCase()];
    if (!createRepository) {
      throw new Error(
        `Repository "${repositoryName}" not found. ` +
        `Available repositories: ${RepositoryFactory.getAvailableRepositories().join(', ')}`
      );
    }

    return createRepository();
  }

  /**
   * Get list of available repositories
   * @returns {string[]} Array of repository names
   */
  static getAvailableRepositories() {
    return ['user', 'product', 'cart', 'order'];
  }

  /**
   * Check if a repository exists
   * @param {string} repositoryName - Name of the repository
   * @returns {boolean} True if repository exists
   */
  static repositoryExists(repositoryName) {
    return RepositoryFactory.getAvailableRepositories()
      .includes(repositoryName.toLowerCase());
  }

  /**
   * Create all repositories at once (useful for dependency injection)
   * @param {Object} options - Optional custom repositories
   * @returns {Object} Object with all repository instances
   */
  static createAllRepositories(options = {}) {
    return {
      userRepository: RepositoryFactory.createRepository('user', { repository: options.userRepository }),
      productRepository: RepositoryFactory.createRepository('product', { repository: options.productRepository }),
      cartRepository: RepositoryFactory.createRepository('cart', { repository: options.cartRepository }),
      orderRepository: RepositoryFactory.createRepository('order', { repository: options.orderRepository })
    };
  }
}

export default RepositoryFactory;

