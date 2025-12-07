import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import Footer from '../../../../src/components/layout/Footer.jsx';

describe('Footer', () => {
  beforeEach(() => {
    // Reset any mocks if needed
  });

  // TDD Evidence:
  // RED: This test failed because Footer component did not exist
  // GREEN: After implementing Footer component, test passed
  // REFACTOR: Test still passes
  it('should render footer with brand name', () => {
    render(<Footer />);
    
    expect(screen.getByText('LUCINE')).toBeInTheDocument();
  });

  // TDD Evidence:
  // RED: This test failed because Footer didn't show quick links
  // GREEN: After adding quick links section, test passed
  // REFACTOR: Test still passes
  it('should render quick links section', () => {
    render(<Footer />);
    
    expect(screen.getByText(/quick links/i)).toBeInTheDocument();
    expect(screen.getByText(/products/i)).toBeInTheDocument();
    expect(screen.getByText(/about us/i)).toBeInTheDocument();
  });

  // TDD Evidence:
  // RED: This test failed because Footer didn't show contact information
  // GREEN: After adding contact section, test passed
  // REFACTOR: Test still passes
  it('should render contact information', () => {
    render(<Footer />);
    
    // There are multiple "Contact" texts (heading and link), use getAllByText
    const contactTexts = screen.getAllByText(/contact/i);
    expect(contactTexts.length).toBeGreaterThan(0);
    expect(screen.getByText(/support@lucine.com/i)).toBeInTheDocument();
    expect(screen.getByText(/\+1.*555.*123.*4567/i)).toBeInTheDocument();
  });

  // TDD Evidence:
  // RED: This test failed because Footer didn't show copyright
  // GREEN: After adding copyright section, test passed
  // REFACTOR: Test still passes
  it('should render copyright with current year', () => {
    const currentYear = new Date().getFullYear();
    render(<Footer />);
    
    expect(screen.getByText(new RegExp(currentYear.toString()))).toBeInTheDocument();
    expect(screen.getByText(/All rights reserved/i)).toBeInTheDocument();
  });

  // TDD Evidence:
  // RED: This test failed because Footer didn't have proper structure
  // GREEN: After implementing footer structure, test passed
  // REFACTOR: Test still passes
  it('should have proper footer structure', () => {
    const { container } = render(<Footer />);
    
    const footer = container.querySelector('footer');
    expect(footer).toBeInTheDocument();
    expect(footer).toHaveClass('bg-gray-800');
  });
});

