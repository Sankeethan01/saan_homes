/**
 * Performance Monitoring Utilities
 * Helps track and optimize application performance
 */

interface PerformanceMetrics {
  componentRenderTime: number;
  apiResponseTime: number;
  bundleSize: number;
  memoryUsage: number;
  fps: number;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetrics> = new Map();
  private observers: PerformanceObserver[] = [];

  /**
   * Start monitoring component render time
   */
  startComponentRender(componentName: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      this.updateMetric(componentName, 'componentRenderTime', renderTime);
      
      // Log slow renders
      if (renderTime > 16) { // More than one frame at 60fps
        console.warn(`Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
      }
    };
  }

  /**
   * Start monitoring API response time
   */
  startAPICall(url: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      this.updateMetric(url, 'apiResponseTime', responseTime);
      
      // Log slow API calls
      if (responseTime > 1000) { // More than 1 second
        console.warn(`Slow API call detected: ${url} took ${responseTime.toFixed(2)}ms`);
      }
    };
  }

  /**
   * Monitor memory usage
   */
  monitorMemory(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const memoryUsage = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
      
      this.updateMetric('global', 'memoryUsage', memoryUsage);
      
      // Log high memory usage
      if (memoryUsage > 0.8) { // More than 80%
        console.warn(`High memory usage detected: ${(memoryUsage * 100).toFixed(1)}%`);
      }
    }
  }

  /**
   * Monitor FPS
   */
  monitorFPS(): void {
    let lastTime = performance.now();
    let frameCount = 0;
    
    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        this.updateMetric('global', 'fps', fps);
        
        // Log low FPS
        if (fps < 30) {
          console.warn(`Low FPS detected: ${fps}`);
        }
        
        frameCount = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(measureFPS);
    };
    
    requestAnimationFrame(measureFPS);
  }

  /**
   * Update metric for a specific key
   */
  private updateMetric(key: string, metric: keyof PerformanceMetrics, value: number): void {
    const existing = this.metrics.get(key) || {} as PerformanceMetrics;
    this.metrics.set(key, { ...existing, [metric]: value });
  }

  /**
   * Get performance metrics
   */
  getMetrics(): Map<string, PerformanceMetrics> {
    return new Map(this.metrics);
  }

  /**
   * Get performance report
   */
  getReport(): string {
    const report: string[] = [];
    
    for (const [key, metrics] of this.metrics.entries()) {
      report.push(`\n=== ${key} ===`);
      if (metrics.componentRenderTime) {
        report.push(`Render Time: ${metrics.componentRenderTime.toFixed(2)}ms`);
      }
      if (metrics.apiResponseTime) {
        report.push(`API Response Time: ${metrics.apiResponseTime.toFixed(2)}ms`);
      }
      if (metrics.memoryUsage) {
        report.push(`Memory Usage: ${(metrics.memoryUsage * 100).toFixed(1)}%`);
      }
      if (metrics.fps) {
        report.push(`FPS: ${metrics.fps}`);
      }
    }
    
    return report.join('\n');
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics.clear();
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// Start monitoring on app load
if (typeof window !== 'undefined') {
  performanceMonitor.monitorMemory();
  performanceMonitor.monitorFPS();
}

/**
 * React hook for monitoring component performance
 */
export function usePerformanceMonitor(componentName: string) {
  const endRender = performanceMonitor.startComponentRender(componentName);
  
  // End monitoring on unmount
  React.useEffect(() => {
    return endRender;
  }, [endRender]);
}

/**
 * Hook for monitoring API performance
 */
export function useAPIPerformanceMonitor() {
  return {
    startAPICall: performanceMonitor.startAPICall.bind(performanceMonitor),
  };
}

/**
 * Performance optimization utilities
 */
export const performanceUtils = {
  /**
   * Debounce function calls
   */
  debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  /**
   * Throttle function calls
   */
  throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  /**
   * Check if component should re-render
   */
  shouldComponentUpdate<T extends Record<string, any>>(
    prevProps: T,
    nextProps: T,
    keys: (keyof T)[]
  ): boolean {
    return keys.some(key => prevProps[key] !== nextProps[key]);
  },

  /**
   * Lazy load component with error boundary
   */
  lazyLoad<T extends React.ComponentType<any>>(
    importFunc: () => Promise<{ default: T }>,
    fallback?: React.ComponentType
  ): React.LazyExoticComponent<T> {
    return React.lazy(() => 
      importFunc().catch(() => ({
        default: fallback || (() => <div>Failed to load component</div>)
      }))
    );
  },
};

// Import React for the hooks
import React from 'react';
