import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import PerformanceDashboard from '../PerformanceDashboard';

// Mock the hooks and utilities
vi.mock('@/hooks/usePerformanceMonitor', () => ({
  usePerformanceMonitor: vi.fn(() => ({
    metrics: {
      loadTime: 1200,
      renderTime: 45,
      memoryUsage: 64,
      networkRequests: 8,
      errorCount: 0,
    },
    logPerformance: vi.fn(),
    generateReport: vi.fn(),
    isSlow: false,
  })),
  analyzePerformance: vi.fn(() => ({
    overall: 'good',
    loadTime: 'good',
    renderTime: 'good',
    memoryUsage: 'good'
  })),
}));

// Mock UI components
vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => <div className={className}>{children}</div>
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, className, variant, size }: any) => (
    <button onClick={onClick} disabled={disabled} className={className} data-variant={variant} data-size={size}>
      {children}
    </button>
  )
}));

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, className }: any) => <span className={className}>{children}</span>
}));

vi.mock('@/components/ui/progress', () => ({
  Progress: ({ value, className }: any) => <div className={className} data-value={value} />
}));

vi.mock('@/components/ui/alert', () => ({
  Alert: ({ children, className }: any) => <div className={className}>{children}</div>,
  AlertDescription: ({ children }: any) => <div>{children}</div>
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Activity: () => <span data-icon="activity">⚡</span>,
  Clock: () => <span data-icon="clock">⏰</span>,
  MemoryStick: () => <span data-icon="memory">💾</span>,
  Network: () => <span data-icon="network">🌐</span>,
  AlertTriangle: () => <span data-icon="alert">⚠️</span>,
  CheckCircle: () => <span data-icon="check">✅</span>,
  XCircle: () => <span data-icon="x">❌</span>,
  Play: () => <span data-icon="play">▶️</span>,
  RefreshCw: () => <span data-icon="refresh">🔄</span>
}));

vi.mock('@/utils/performanceTester', () => ({
  PerformanceTester: class {
    async runMemoryTest() {
      return {
        testName: 'Memory Usage Test',
        passed: true,
        metrics: { usedMemory: 64, totalMemory: 128, limit: {} },
        message: 'Test completed in 50ms',
        duration: 50
      };
    }
    async runLoadTimeTest() {
      return {
        testName: 'Load Time Test',
        passed: true,
        metrics: { loadTime: 1200, targetTime: 2000, benchmark: {} },
        message: 'Test completed in 25ms',
        duration: 25
      };
    }
    async runRenderPerformanceTest() {
      return {
        testName: 'Render Performance Test',
        passed: true,
        metrics: { avgFrameTime: 16, maxFrameTime: 33, fps: 60, benchmark: {} },
        message: 'Test completed in 1000ms',
        duration: 1000
      };
    }
    async runImageLoadingTest() {
      return {
        testName: 'Image Loading Test',
        passed: true,
        metrics: { totalImages: 5, successfulLoads: 5, failedLoads: 0, avgLoadTime: 150, maxLoadTime: 300 },
        message: 'Test completed in 200ms',
        duration: 200
      };
    }
    async runNetworkPerformanceTest() {
      return {
        testName: 'Network Performance Test',
        passed: true,
        metrics: { successfulRequests: 3, failedRequests: 0, avgResponseTime: 85 },
        message: 'Test completed in 300ms',
        duration: 300
      };
    }
  },
}));

describe('PerformanceDashboard', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders performance dashboard when visible', () => {
    render(<PerformanceDashboard isVisible={true} onClose={mockOnClose} />);
    
    expect(screen.getByText('Performance Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Test Results')).toBeInTheDocument();
    expect(screen.getByText('Detailed Metrics')).toBeInTheDocument();
  });

  it('does not render when not visible', () => {
    render(<PerformanceDashboard isVisible={false} onClose={mockOnClose} />);
    
    expect(screen.queryByText('Performance Dashboard')).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(<PerformanceDashboard isVisible={true} onClose={mockOnClose} />);
    
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('displays performance metrics correctly', () => {
    render(<PerformanceDashboard isVisible={true} onClose={mockOnClose} />);
    
    expect(screen.getByText('Load Time')).toBeInTheDocument();
    expect(screen.getByText('1.2s')).toBeInTheDocument();
    expect(screen.getByText('Render Time')).toBeInTheDocument();
    expect(screen.getByText('45ms')).toBeInTheDocument();
    expect(screen.getByText('Memory Usage')).toBeInTheDocument();
    expect(screen.getByText('64 MB')).toBeInTheDocument();
  });

  it('switches between tabs correctly', () => {
    render(<PerformanceDashboard isVisible={true} onClose={mockOnClose} />);
    
    const testResultsTab = screen.getByRole('tab', { name: 'Test Results' });
    fireEvent.click(testResultsTab);
    
    expect(screen.getByText('Memory Usage')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
    
    const detailedMetricsTab = screen.getByRole('tab', { name: 'Detailed Metrics' });
    fireEvent.click(detailedMetricsTab);
    
    expect(screen.getByText('Network Requests')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
  });

  it('runs performance tests when run tests button is clicked', async () => {
    render(<PerformanceDashboard isVisible={true} onClose={mockOnClose} />);
    
    const runTestsButton = screen.getByRole('button', { name: /run tests/i });
    fireEvent.click(runTestsButton);
    
    await waitFor(() => {
      expect(screen.getByText('Memory Usage')).toBeInTheDocument();
      expect(screen.getByText('50%')).toBeInTheDocument();
    });
  });

  it('handles errors gracefully', () => {
    vi.mock('@/utils/performanceTester', () => ({
      PerformanceTester: class {
        async runBasicTests() {
          throw new Error('Test failed');
        }
      },
    }));

    render(<PerformanceDashboard isVisible={true} onClose={mockOnClose} />);
    
    const runTestsButton = screen.getByRole('button', { name: /run tests/i });
    fireEvent.click(runTestsButton);
    
    // Should not crash and should still render basic UI
    expect(screen.getByText('Performance Dashboard')).toBeInTheDocument();
  });

  it('logs performance metrics when mounted', () => {
    const consoleSpy = vi.spyOn(console, 'log');
    
    render(<PerformanceDashboard isVisible={true} onClose={mockOnClose} />);
    
    expect(consoleSpy).toHaveBeenCalledWith('Performance Dashboard mounted');
  });
});
