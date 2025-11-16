import { performanceBenchmarks, analyzePerformance } from '@/hooks/usePerformanceMonitor';

export interface PerformanceTestResult {
  testName: string;
  passed: boolean;
  metrics: any;
  message: string;
  duration: number;
}

export class PerformanceTester {
  private results: PerformanceTestResult[] = [];

  async runTest(testName: string, testFn: () => Promise<any> | any): Promise<PerformanceTestResult> {
    const startTime = performance.now();
    
    try {
      const result = await testFn();
      const duration = performance.now() - startTime;
      
      const testResult: PerformanceTestResult = {
        testName,
        passed: true,
        metrics: result,
        message: `Test completed in ${Math.round(duration)}ms`,
        duration
      };
      
      this.results.push(testResult);
      return testResult;
    } catch (error) {
      const duration = performance.now() - startTime;
      
      const testResult: PerformanceTestResult = {
        testName,
        passed: false,
        metrics: error,
        message: `Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration
      };
      
      this.results.push(testResult);
      return testResult;
    }
  }

  async runMemoryTest(): Promise<PerformanceTestResult> {
    return this.runTest('Memory Usage Test', () => {
      const memory = (performance as any).memory;
      if (!memory) {
        throw new Error('Memory API not available');
      }

      const usedMemory = Math.round(memory.usedJSHeapSize / 1024 / 1024);
      const memoryBenchmark = performanceBenchmarks.memoryUsage;

      if (usedMemory > memoryBenchmark.poor) {
        throw new Error(`Memory usage too high: ${usedMemory}MB`);
      }

      return {
        usedMemory,
        totalMemory: Math.round(memory.totalJSHeapSize / 1024 / 1024),
        limit: memoryBenchmark
      };
    });
  }

  async runLoadTimeTest(targetTime: number = 2000): Promise<PerformanceTestResult> {
    return this.runTest('Load Time Test', () => {
      const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
      
      if (loadTime > targetTime) {
        throw new Error(`Load time too slow: ${loadTime}ms (target: ${targetTime}ms)`);
      }

      return {
        loadTime,
        targetTime,
        benchmark: performanceBenchmarks.loadTime
      };
    });
  }

  async runRenderPerformanceTest(): Promise<PerformanceTestResult> {
    return this.runTest('Render Performance Test', async () => {
      const frameCount = 60; // Test over 60 frames (1 second at 60fps)
      const frameTimes: number[] = [];
      
      for (let i = 0; i < frameCount; i++) {
        const frameStart = performance.now();
        
        // Force a layout/reflow
        document.body.offsetHeight;
        
        const frameEnd = performance.now();
        frameTimes.push(frameEnd - frameStart);
        
        // Wait for next frame
        await new Promise(resolve => requestAnimationFrame(resolve));
      }

      const avgFrameTime = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
      const maxFrameTime = Math.max(...frameTimes);
      const fps = Math.round(1000 / avgFrameTime);

      if (avgFrameTime > 33) { // Less than 30fps
        throw new Error(`Poor render performance: ${fps}fps average, max frame: ${Math.round(maxFrameTime)}ms`);
      }

      return {
        avgFrameTime: Math.round(avgFrameTime),
        maxFrameTime: Math.round(maxFrameTime),
        fps,
        benchmark: performanceBenchmarks.renderTime
      };
    });
  }

  async runImageLoadingTest(): Promise<PerformanceTestResult> {
    return this.runTest('Image Loading Test', async () => {
      const images = Array.from(document.querySelectorAll('img'));
      const loadPromises = images.map(img => {
        return new Promise((resolve, reject) => {
          if (img.complete) {
            resolve({ src: img.src, loaded: true, time: 0 });
          } else {
            const startTime = performance.now();
            img.addEventListener('load', () => {
              resolve({ src: img.src, loaded: true, time: performance.now() - startTime });
            });
            img.addEventListener('error', () => {
              reject(new Error(`Failed to load image: ${img.src}`));
            });
          }
        });
      });

      const results = await Promise.allSettled(loadPromises);
      const successfulLoads = results.filter(r => r.status === 'fulfilled').length;
      const failedLoads = results.filter(r => r.status === 'rejected').length;

      if (failedLoads > 0) {
        throw new Error(`${failedLoads} images failed to load out of ${images.length}`);
      }

      const loadTimes = results
        .filter(r => r.status === 'fulfilled')
        .map(r => (r as any).value.time);
      const avgLoadTime = loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length;

      if (avgLoadTime > 1000) { // 1 second threshold
        throw new Error(`Image loading too slow: ${Math.round(avgLoadTime)}ms average`);
      }

      return {
        totalImages: images.length,
        successfulLoads,
        failedLoads,
        avgLoadTime: Math.round(avgLoadTime),
        maxLoadTime: Math.max(...loadTimes)
      };
    });
  }

  async runNetworkPerformanceTest(): Promise<PerformanceTestResult> {
    return this.runTest('Network Performance Test', async () => {
      const testUrls = [
        '/api/health', // Health check endpoint
        '/data/books.json', // Books data
        '/assets/images/book-covers/' // Book covers
      ];

      const networkResults = await Promise.allSettled(
        testUrls.map(async (url) => {
          const startTime = performance.now();
          try {
            const response = await fetch(url, { method: 'HEAD' });
            const duration = performance.now() - startTime;
            return {
              url,
              status: response.status,
              duration: Math.round(duration),
              success: response.ok
            };
          } catch (error) {
            const duration = performance.now() - startTime;
            return {
              url,
              status: 0,
              duration: Math.round(duration),
              success: false,
              error: error instanceof Error ? error.message : 'Network error'
            };
          }
        })
      );

      // Use only fulfilled requests to compute accurate average latency
      const fulfilled = networkResults.filter(r => r.status === 'fulfilled') as PromiseFulfilledResult<any>[];
      const successfulRequests = fulfilled.filter(r => (r as any).value.success).length;
      const failedRequests = networkResults.filter(r => r.status === 'rejected' || (r as any).value?.success === false).length;
      // Avoid dividing by total when some promises are rejected
      const avgResponseTime = fulfilled.length
        ? fulfilled.reduce((acc, r) => acc + (r as any).value.duration, 0) / fulfilled.length
        : 0;

      if (failedRequests > 0) {
        throw new Error(`${failedRequests} network requests failed out of ${testUrls.length}`);
      }

      if (avgResponseTime > 2000) { // 2 second threshold
        throw new Error(`Network requests too slow: ${Math.round(avgResponseTime)}ms average`);
      }

      return {
        totalRequests: testUrls.length,
        successfulRequests,
        failedRequests,
        avgResponseTime: Math.round(avgResponseTime),
        results: networkResults.map(r => (r as any).value)
      };
    });
  }

  getResults(): PerformanceTestResult[] {
    return [...this.results];
  }

  getSummary(): { total: number; passed: number; failed: number; avgDuration: number } {
    const total = this.results.length;
    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => !r.passed).length;
    // Guard against division by zero when no tests have run
    const avgDuration = total ? this.results.reduce((acc, r) => acc + r.duration, 0) / total : 0;

    return { total, passed, failed, avgDuration: Math.round(avgDuration) };
  }

  clearResults(): void {
    this.results = [];
  }
}

// Export a singleton instance
export const performanceTester = new PerformanceTester();

// Auto-run basic performance tests when in development
if (process.env.NODE_ENV === 'development') {
  window.addEventListener('load', async () => {
    console.log('Running performance tests...');
    
    try {
      await performanceTester.runLoadTimeTest();
      await performanceTester.runMemoryTest();
      console.log('Basic performance tests completed');
    } catch (error) {
      console.warn('Performance test failed:', error);
    }
  });
}