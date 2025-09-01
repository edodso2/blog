'use client';
import React, {
  createContext,
  useContext,
  useCallback,
  ReactNode,
} from 'react';
import { driver, Driver } from 'driver.js';
import 'driver.js/dist/driver.css';

interface HighlightConfig {
  element: string | HTMLElement;
  popover?: {
    title?: string;
    description?: string;
  };
}

interface HighlightContextType {
  highlight: (config: HighlightConfig) => void;
}

// Context
const HighlightContext = createContext<HighlightContextType | undefined>(
  undefined
);

// Provider
export function HighlightProvider({ children }: { children: ReactNode }) {
  const driverInstanceRef = React.useRef<Driver | null>(null);

  // Get or create driver instance
  const getDriverInstance = useCallback(() => {
    if (!driverInstanceRef.current) {
      driverInstanceRef.current = driver();
    }
    return driverInstanceRef.current;
  }, []);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (driverInstanceRef.current) {
        driverInstanceRef.current.destroy();
        driverInstanceRef.current = null;
      }
    };
  }, []);

  const highlight = useCallback(
    (config: HighlightConfig) => {
      const driverInstance = getDriverInstance();
      driverInstance.highlight(config);
    },
    [getDriverInstance]
  );

  const contextValue: HighlightContextType = {
    highlight,
  };

  return (
    <HighlightContext.Provider value={contextValue}>
      {children}
    </HighlightContext.Provider>
  );
}

// Hook to use context
export function useHighlight() {
  const context = useContext(HighlightContext);
  if (context === undefined) {
    throw new Error('useHighlight must be used within a HighlightProvider');
  }
  return context;
}
