import React, { createContext, useContext, useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";

interface RefreshContextType {
  refreshData: (queryKeys?: string[]) => Promise<void>;
  isRefreshing: boolean;
}

const RefreshContext = createContext<RefreshContextType | undefined>(undefined);

export const RefreshProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshData = useCallback(async (queryKeys?: string[]) => {
    setIsRefreshing(true);
    try {
      if (queryKeys && queryKeys.length > 0) {
        // Invalidate specific queries
        await Promise.all(
          queryKeys.map((key) =>
            queryClient.invalidateQueries({ queryKey: [key] })
          )
        );
      } else {
        // Invalidate all queries
        await queryClient.refetchQueries();
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [queryClient]);

  return (
    <RefreshContext.Provider value={{ refreshData, isRefreshing }}>
      {children}
    </RefreshContext.Provider>
  );
};

export const useRefresh = () => {
  const context = useContext(RefreshContext);
  if (context === undefined) {
    throw new Error("useRefresh must be used within a RefreshProvider");
  }
  return context;
};
