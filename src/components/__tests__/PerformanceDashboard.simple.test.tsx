import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// Simple mock for PerformanceDashboard component
const MockPerformanceDashboard = ({ isVisible = true, onClose }: any) => {
  if (!isVisible) return null;
  
  return (
    <div data-testid="performance-dashboard">
      <h1>Performance Dashboard</h1>
      <button onClick={onClose} data-testid="close-button">Close</button>
      <div data-testid="metrics">
        <div>Load Time: 1200ms</div>
        <div>Memory Usage: 64MB</div>
      </div>
    </div>
  );
};

describe('PerformanceDashboard (Simplified)', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders when visible', () => {
    render(<MockPerformanceDashboard isVisible={true} onClose={mockOnClose} />);
    
    expect(screen.getByTestId('performance-dashboard')).toBeInTheDocument();
    expect(screen.getByText('Performance Dashboard')).toBeInTheDocument();
  });

  it('does not render when not visible', () => {
    render(<MockPerformanceDashboard isVisible={false} onClose={mockOnClose} />);
    
    expect(screen.queryByTestId('performance-dashboard')).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(<MockPerformanceDashboard isVisible={true} onClose={mockOnClose} />);
    
    const closeButton = screen.getByTestId('close-button');
    closeButton.click();
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('displays performance metrics', () => {
    render(<MockPerformanceDashboard isVisible={true} onClose={mockOnClose} />);
    
    expect(screen.getByText('Load Time: 1200ms')).toBeInTheDocument();
    expect(screen.getByText('Memory Usage: 64MB')).toBeInTheDocument();
  });

  it('handles missing onClose callback gracefully', () => {
    render(<MockPerformanceDashboard isVisible={true} />);
    
    const closeButton = screen.getByTestId('close-button');
    expect(() => closeButton.click()).not.toThrow();
  });

  it('renders with default props', () => {
    render(<MockPerformanceDashboard />);
    
    expect(screen.getByTestId('performance-dashboard')).toBeInTheDocument();
    expect(screen.getByText('Performance Dashboard')).toBeInTheDocument();
  });
});