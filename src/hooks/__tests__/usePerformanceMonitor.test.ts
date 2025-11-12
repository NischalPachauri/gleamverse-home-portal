import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { usePerformanceMonitor } from '../usePerformanceMonitor';

// Mock performance APIs
global.performance = {
  now: vi.fn(() => Date.now()),
  mark: vi.fn(),
  measure: vi.fn(),
  clearMarks: vi.fn(),
  clearMeasures: vi.fn(),
  getEntriesByType: vi.fn(() => []),
  getEntriesByName: vi.fn(() => []),
} as any;

// Mock PerformanceObserver
global.PerformanceObserver = class PerformanceObserver {
  constructor(callback: Function) {
    this.callback = callback;
  }
  private callback: Function;
  observe() {}
  disconnect() {}
};

describe('usePerformanceMonitor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset performance mocks
    (global.performance.now as any).mockReturnValue(Date.now());
  });

  it('initializes with default metrics', () => {
    const { result } = renderHook(() => usePerformanceMonitor('TestComponent'));
    
    expect(result.current.metrics).toEqual({
      loadTime: 0,
      renderTime: 0,
      memoryUsage: 0,
      networkRequests: 0,
      errors: 0,
    });
  });

  it('logs performance metrics correctly', () => {
    const consoleSpy = vi.spyOn(console, 'log');
    const { result } = renderHook(() => usePerformanceMonitor('TestComponent'));
    
    act(() => {
      result.current.logPerformance('test_event', { duration: 100 });
    });
    
    expect(consoleSpy).toHaveBeenCalledWith(
      '[Performance Monitor] TestComponent - test_event:',
      expect.objectContaining({ duration: 100 })
    );
  });

  it('tracks load time correctly', () => {
    const { result } = renderHook(() => usePerformanceMonitor('TestComponent'));
    
    // Simulate load time measurement
    act(() => {
      result.current.logPerformance('load', { duration: 1500 });
    });
    
    expect(result.current.metrics.loadTime).toBe(1500);
  });

  it('tracks render time correctly', () => {
    const { result } = renderHook(() => usePerformanceMonitor('TestComponent'));
    
    act(() => {
      result.current.logPerformance('render', { duration: 50 });
    });
    
    expect(result.current.metrics.renderTime).toBe(50);
  });

  it('tracks memory usage correctly', () => {
    const { result } = renderHook(() => usePerformanceMonitor('TestComponent'));
    
    act(() => {
      result.current.logPerformance('memory', { usage: 128 });
    });
    
    expect(result.current.metrics.memoryUsage).toBe(128);
  });

  it('tracks network requests correctly', () => {
    const { result } = renderHook(() => usePerformanceMonitor('TestComponent'));
    
    act(() => {
      result.current.logPerformance('network', { requests: 5 });
    });
    
    expect(result.current.metrics.networkRequests).toBe(5);
  });

  it('tracks errors correctly', () => {
    const { result } = renderHook(() => usePerformanceMonitor('TestComponent'));
    
    act(() => {
      result.current.logPerformance('error', { error: 'Test error' });
    });
    
    expect(result.current.metrics.errors).toBe(1);
  });

  it('generates performance report correctly', () => {
    const { result } = renderHook(() => usePerformanceMonitor('TestComponent'));
    
    // Log some metrics
    act(() => {
      result.current.logPerformance('load', { duration: 1200 });
      result.current.logPerformance('render', { duration: 45 });
      result.current.logPerformance('memory', { usage: 64 });
    });
    
    const report = result.current.report();
    
    expect(report).toEqual({
      component: 'TestComponent',
      metrics: {
        loadTime: 1200,
        renderTime: 45,
        memoryUsage: 64,
        networkRequests: 0,
        errors: 0,
      },
      timestamp: expect.any(Number),
    });
  });

  it('warns when component is slow', () => {
    const consoleSpy = vi.spyOn(console, 'warn');
    const { result } = renderHook(() => usePerformanceMonitor('TestComponent'));
    
    act(() => {
      result.current.logPerformance('render', { duration: 300 });
    });
    
    expect(consoleSpy).toHaveBeenCalledWith(
      '[Performance Warning] TestComponent is slow:',
      expect.objectContaining({ duration: 300 })
    );
  });

  it('calculates performance score correctly', () => {
    const { result } = renderHook(() => usePerformanceMonitor('TestComponent'));
    
    act(() => {
      result.current.logPerformance('load', { duration: 1000 });
      result.current.logPerformance('render', { duration: 30 });
      result.current.logPerformance('memory', { usage: 50 });
    });
    
    const report = result.current.report();
    
    // Score should be calculated based on metrics
    expect(report.score).toBeGreaterThan(0);
    expect(report.score).toBeLessThanOrEqual(100);
  });

  it('provides recommendations for poor performance', () => {
    const { result } = renderHook(() => usePerformanceMonitor('TestComponent'));
    
    act(() => {
      result.current.logPerformance('load', { duration: 5000 });
      result.current.logPerformance('render', { duration: 200 });
      result.current.logPerformance('memory', { usage: 200 });
    });
    
    const report = result.current.report();
    
    expect(report.recommendations).toContain(expect.stringContaining('Load time'));
    expect(report.recommendations).toContain(expect.stringContaining('Render time'));
    expect(report.recommendations).toContain(expect.stringContaining('Memory usage'));
  });

  it('handles multiple components independently', () => {
    const { result: result1 } = renderHook(() => usePerformanceMonitor('Component1'));
    const { result: result2 } = renderHook(() => usePerformanceMonitor('Component2'));
    
    act(() => {
      result1.current.logPerformance('load', { duration: 1000 });
      result2.current.logPerformance('load', { duration: 2000 });
    });
    
    expect(result1.current.metrics.loadTime).toBe(1000);
    expect(result2.current.metrics.loadTime).toBe(2000);
  });

  it('handles edge cases gracefully', () => {
    const { result } = renderHook(() => usePerformanceMonitor('TestComponent'));
    
    act(() => {
      result.current.logPerformance('load', { duration: 0 });
      result.current.logPerformance('render', { duration: -10 });
      result.current.logPerformance('memory', { usage: -50 });
    });
    
    expect(result.current.metrics.loadTime).toBe(0);
    expect(result.current.metrics.renderTime).toBe(-10);
    expect(result.current.metrics.memoryUsage).toBe(-50);
  });

  it('cleans up on unmount', () => {
    const { unmount } = renderHook(() => usePerformanceMonitor('TestComponent'));
    
    act(() => {
      unmount();
    });
    
    // Should not cause any errors
    expect(() => unmount()).not.toThrow();
  });

  it('handles high-frequency logging', () => {
    const { result } = renderHook(() => usePerformanceMonitor('TestComponent'));
    
    // Log many events quickly
    for (let i = 0; i < 100; i++) {
      act(() => {
        result.current.logPerformance('render', { duration: i });
      });
    }
    
    expect(result.current.metrics.renderTime).toBe(99); // Last value
  });
});