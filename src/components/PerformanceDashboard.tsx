import { useState, useEffect } from 'react';
import { usePerformanceMonitor, analyzePerformance, type PerformanceMetrics } from '@/hooks/usePerformanceMonitor';
import type { PerformanceTestResult } from '@/utils/performanceTester';
import { performanceTester } from '@/utils/performanceTester';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  Clock, 
  MemoryStick, 
  Network, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Play,
  RefreshCw
} from 'lucide-react';

interface PerformanceDashboardProps {
  isVisible?: boolean;
  onClose?: () => void;
}

export default function PerformanceDashboard({ isVisible = true, onClose }: PerformanceDashboardProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<PerformanceTestResult[]>([]);
  const [currentMetrics, setCurrentMetrics] = useState<PerformanceMetrics | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'tests' | 'metrics'>('overview');

  const { metrics, logPerformance } = usePerformanceMonitor('PerformanceDashboard');

  useEffect(() => {
    if (isVisible) {
      logPerformance();
      setCurrentMetrics(metrics);
    }
  }, [isVisible, metrics, logPerformance]);

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    try {
      const results = [];
      
      // Run memory test
      results.push(await performanceTester.runMemoryTest());
      
      // Run render performance test
      results.push(await performanceTester.runRenderPerformanceTest());
      
      // Run image loading test
      results.push(await performanceTester.runImageLoadingTest());
      
      // Run network performance test
      results.push(await performanceTester.runNetworkPerformanceTest());

      setTestResults(results);
    } catch (error) {
      console.error('Performance tests failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const getPerformanceStatus = (passed: boolean, duration: number) => {
    if (!passed) return 'failed';
    if (duration < 100) return 'excellent';
    if (duration < 500) return 'good';
    if (duration < 1000) return 'acceptable';
    return 'poor';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-500';
      case 'good': return 'text-blue-500';
      case 'acceptable': return 'text-yellow-500';
      case 'poor': return 'text-orange-500';
      case 'failed': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      excellent: 'bg-green-100 text-green-800',
      good: 'bg-blue-100 text-blue-800',
      acceptable: 'bg-yellow-100 text-yellow-800',
      poor: 'bg-orange-100 text-orange-800',
      failed: 'bg-red-100 text-red-800'
    };
    
    return (
      <Badge className={colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (!isVisible) return null;

  const performanceAnalysis = currentMetrics ? analyzePerformance(currentMetrics) : null;

  return (
    <div className="fixed top-4 right-4 w-96 bg-background border rounded-lg shadow-lg z-50">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Performance Dashboard
          </h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ×
          </Button>
        </div>
        
        <div className="flex gap-2 mt-3">
          <Button
            size="sm"
            variant={activeTab === 'overview' ? 'default' : 'outline'}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </Button>
          <Button
            size="sm"
            variant={activeTab === 'tests' ? 'default' : 'outline'}
            onClick={() => setActiveTab('tests')}
          >
            Tests
          </Button>
          <Button
            size="sm"
            variant={activeTab === 'metrics' ? 'default' : 'outline'}
            onClick={() => setActiveTab('metrics')}
          >
            Metrics
          </Button>
        </div>
      </div>

      <div className="p-4 max-h-96 overflow-y-auto">
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {performanceAnalysis && (
              <Alert>
                <Activity className="w-4 h-4" />
                <AlertDescription>
                  Overall Performance: {getStatusBadge(performanceAnalysis.overall)}
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-2 gap-3">
              <Card className="p-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Load Time</p>
                    <p className="font-semibold">{Math.round(currentMetrics?.loadTime || 0)}ms</p>
                  </div>
                </div>
              </Card>

              <Card className="p-3">
                <div className="flex items-center gap-2">
                  <MemoryStick className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Memory</p>
                    <p className="font-semibold">{currentMetrics?.memoryUsage || 0}MB</p>
                  </div>
                </div>
              </Card>
            </div>

            <Button onClick={runAllTests} disabled={isRunning} className="w-full">
              {isRunning ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Running Tests...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Run All Tests
                </>
              )}
            </Button>
          </div>
        )}

        {activeTab === 'tests' && (
          <div className="space-y-3">
            {testResults.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No tests run yet</p>
                <Button onClick={runAllTests} className="mt-3" size="sm">
                  Run Tests
                </Button>
              </div>
            ) : (
              testResults.map((result, index) => (
                <Card key={index} className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {result.passed ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                      <span className="font-medium">{result.testName}</span>
                    </div>
                    {getStatusBadge(getPerformanceStatus(result.passed, result.duration))}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{result.message}</p>
                </Card>
              ))
            )}
          </div>
        )}

        {activeTab === 'metrics' && (
          <div className="space-y-3">
            <Card className="p-3">
              <h4 className="font-medium mb-2">Current Metrics</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Load Time:</span>
                  <span>{Math.round(currentMetrics?.loadTime || 0)}ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Render Time:</span>
                  <span>{Math.round(currentMetrics?.renderTime || 0)}ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Memory Usage:</span>
                  <span>{currentMetrics?.memoryUsage || 0}MB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Network Requests:</span>
                  <span>{currentMetrics?.networkRequests || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Errors:</span>
                  <span>{currentMetrics?.errorCount || 0}</span>
                </div>
              </div>
            </Card>

            {performanceAnalysis && (
              <Card className="p-3">
                <h4 className="font-medium mb-2">Performance Analysis</h4>
                <div className="space-y-2">
                  {Object.entries(performanceAnalysis).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center">
                      <span className="text-muted-foreground capitalize">{key}:</span>
                      {getStatusBadge(value)}
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}