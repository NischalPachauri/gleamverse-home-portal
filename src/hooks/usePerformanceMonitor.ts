import { useEffect, useState, useRef } from 'react';

export interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage?: number;
  fps?: number;
  networkRequests: number;
  errorCount: number;
}

export interface PerformanceReport {
  component: string;
  metrics: PerformanceMetrics;
  timestamp: number;
  userAgent: string;
}

export const usePerformanceMonitor = (componentName: string) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0,
    networkRequests: 0,
    errorCount: 0
  });
  
  const startTimeRef = useRef<number>(performance.now());
  const renderStartTimeRef = useRef<number>(performance.now());
  const errorCountRef = useRef<number>(0);
  const networkCountRef = useRef<number>(0);
  const fpsRef = useRef<number>(0);

  useEffect(() => {
    // Monitor component mount time
    const loadTime = performance.now() - startTimeRef.current;
    
    // Monitor memory usage if available
    const mem0 = (performance as Performance & { memory?: { usedJSHeapSize: number } }).memory;
    const memoryUsage = mem0 ? Math.round(mem0.usedJSHeapSize / 1024 / 1024) : undefined;

    // Optimize FPS measurement: use rAF to count frames per second
    let frames = 0;
    let lastTick = performance.now();
    let rafId = 0;
    const loop = (ts: number) => {
      frames++;
      if (ts - lastTick >= 1000) {
        fpsRef.current = frames;
        frames = 0;
        lastTick = ts;
      }
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    // Monitor network requests
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        networkCountRef.current++;
        return response;
      } catch (error) {
        errorCountRef.current++;
        throw error;
      }
    };

    // Monitor errors
    const handleError = () => {
      errorCountRef.current++;
    };
    
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleError);

    return () => {
      cancelAnimationFrame(rafId);
      window.fetch = originalFetch;
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleError);
    };
  }, []);

  useEffect(() => {
    // Update render time on each render
    const renderTime = performance.now() - renderStartTimeRef.current;
    renderStartTimeRef.current = performance.now();

    const mem = (performance as Performance & { memory?: { usedJSHeapSize: number } }).memory;
    setMetrics({
      loadTime: performance.now() - startTimeRef.current,
      renderTime,
      memoryUsage: mem ? Math.round(mem.usedJSHeapSize / 1024 / 1024) : undefined,
      fps: fpsRef.current || undefined,
      networkRequests: networkCountRef.current,
      errorCount: errorCountRef.current
    });
  }, []);

  const generateReport = (): PerformanceReport => {
    return {
      component: componentName,
      metrics,
      timestamp: Date.now(),
      userAgent: navigator.userAgent
    };
  };

  const logPerformance = () => {
    console.log(`[Performance] ${componentName}:`, {
      loadTime: `${Math.round(metrics.loadTime)}ms`,
      renderTime: `${Math.round(metrics.renderTime)}ms`,
      memoryUsage: metrics.memoryUsage ? `${metrics.memoryUsage}MB` : 'N/A',
      networkRequests: metrics.networkRequests,
      errors: metrics.errorCount
    });
  };

  return {
    metrics,
    generateReport,
    logPerformance,
    isSlow: metrics.loadTime > 3000 || metrics.renderTime > 100
  };
};

export const performanceBenchmarks = {
  // Component load time benchmarks (ms)
  loadTime: {
    excellent: 500,
    good: 1000,
    acceptable: 2000,
    poor: 3000
  },
  
  // Render time benchmarks (ms)
  renderTime: {
    excellent: 16, // 60 FPS
    good: 33, // 30 FPS
    acceptable: 50,
    poor: 100
  },
  
  // Memory usage benchmarks (MB)
  memoryUsage: {
    excellent: 50,
    good: 100,
    acceptable: 200,
    poor: 300
  }
};

export const analyzePerformance = (metrics: PerformanceMetrics) => {
  const results = {
    loadTime: 'excellent' as const,
    renderTime: 'excellent' as const,
    memoryUsage: 'excellent' as const,
    overall: 'excellent' as const
  };

  // Analyze load time
  if (metrics.loadTime > performanceBenchmarks.loadTime.poor) {
    results.loadTime = 'poor';
  } else if (metrics.loadTime > performanceBenchmarks.loadTime.acceptable) {
    results.loadTime = 'acceptable';
  } else if (metrics.loadTime > performanceBenchmarks.loadTime.good) {
    results.loadTime = 'good';
  }

  // Analyze render time
  if (metrics.renderTime > performanceBenchmarks.renderTime.poor) {
    results.renderTime = 'poor';
  } else if (metrics.renderTime > performanceBenchmarks.renderTime.acceptable) {
    results.renderTime = 'acceptable';
  } else if (metrics.renderTime > performanceBenchmarks.renderTime.good) {
    results.renderTime = 'good';
  }

  // Analyze memory usage
  if (metrics.memoryUsage && metrics.memoryUsage > performanceBenchmarks.memoryUsage.poor) {
    results.memoryUsage = 'poor';
  } else if (metrics.memoryUsage && metrics.memoryUsage > performanceBenchmarks.memoryUsage.acceptable) {
    results.memoryUsage = 'acceptable';
  } else if (metrics.memoryUsage && metrics.memoryUsage > performanceBenchmarks.memoryUsage.good) {
    results.memoryUsage = 'good';
  }

  // Determine overall performance
  const scores = [results.loadTime, results.renderTime, results.memoryUsage];
  if (scores.includes('poor')) {
    results.overall = 'poor';
  } else if (scores.includes('acceptable')) {
    results.overall = 'acceptable';
  } else if (scores.includes('good')) {
    results.overall = 'good';
  }

  return results;
};