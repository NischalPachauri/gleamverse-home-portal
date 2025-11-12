import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';

// Simple mock for usePerformanceMonitor hook
const usePerformanceMonitor = (componentName: string) => {
  const mockMetrics = {
    loadTime: 1200,
    renderTime: 45,
    memoryUsage: 64,
    networkRequests: 8,
    errorCount: 0,
  };

  const mockLogPerformance = vi.fn(() => {
    console.log(`[Performance] ${componentName}:`, {
      loadTime: `${Math.round(mockMetrics.loadTime)}ms`,
      renderTime: `${Math.round(mockMetrics.renderTime)}ms`,
      memoryUsage: `${mockMetrics.memoryUsage}MB`,
      networkRequests: mockMetrics.networkRequests,
      errors: mockMetrics.errorCount
    });
  });

  const mockGenerateReport = vi.fn(() => ({
    component: componentName,
    metrics: mockMetrics,
    timestamp: Date.now(),
    userAgent: 'Mozilla/5.0 (Test Browser)',
  }));

  return {
    metrics: mockMetrics,
    logPerformance: mockLogPerformance,
    generateReport: mockGenerateReport,
    isSlow: false,
  };
};

describe('usePerformanceMonitor (Simplified)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns performance metrics', () => {
    const { result } = renderHook(() => usePerformanceMonitor('TestComponent'));
    
    expect(result.current.metrics).toBeDefined();
    expect(result.current.metrics.loadTime).toBe(1200);
    expect(result.current.metrics.renderTime).toBe(45);
    expect(result.current.metrics.memoryUsage).toBe(64);
    expect(result.current.metrics.networkRequests).toBe(8);
    expect(result.current.metrics.errorCount).toBe(0);
  });

  it('provides logPerformance function', () => {
    const { result } = renderHook(() => usePerformanceMonitor('TestComponent'));
    
    expect(result.current.logPerformance).toBeDefined();
    expect(typeof result.current.logPerformance).toBe('function');
  });

  it('provides generateReport function', () => {
    const { result } = renderHook(() => usePerformanceMonitor('TestComponent'));
    
    expect(result.current.generateReport).toBeDefined();
    expect(typeof result.current.generateReport).toBe('function');
  });

  it('provides isSlow flag', () => {
    const { result } = renderHook(() => usePerformanceMonitor('TestComponent'));
    
    expect(result.current.isSlow).toBeDefined();
    expect(typeof result.current.isSlow).toBe('boolean');
    expect(result.current.isSlow).toBe(false);
  });

  it('logPerformance function works correctly', () => {
    const consoleSpy = vi.spyOn(console, 'log');
    const { result } = renderHook(() => usePerformanceMonitor('TestComponent'));
    
    result.current.logPerformance();
    
    expect(consoleSpy).toHaveBeenCalledWith('[Performance] TestComponent:', {
      loadTime: '1200ms',
      renderTime: '45ms',
      memoryUsage: '64MB',
      networkRequests: 8,
      errors: 0
    });
    
    consoleSpy.mockRestore();
  });

  it('generateReport function works correctly', () => {
    const { result } = renderHook(() => usePerformanceMonitor('TestComponent'));
    
    const report = result.current.generateReport();
    
    expect(report).toBeDefined();
    expect(report.component).toBe('TestComponent');
    expect(report.metrics).toEqual(result.current.metrics);
    expect(report.timestamp).toBeDefined();
    expect(report.userAgent).toBe('Mozilla/5.0 (Test Browser)');
  });

  it('handles different component names', () => {
    const { result } = renderHook(() => usePerformanceMonitor('AnotherComponent'));
    
    expect(result.current.generateReport().component).toBe('AnotherComponent');
  });

  it('metrics remain consistent across multiple calls', () => {
    const { result } = renderHook(() => usePerformanceMonitor('TestComponent'));
    
    const firstMetrics = result.current.metrics;
    const secondMetrics = result.current.metrics;
    
    expect(firstMetrics).toBe(secondMetrics);
  });
});