import React, { createContext, useContext, useMemo, ReactNode } from "react";

function generateHookName(baseName = "") {
  return `use${baseName || "This"}Context`;
}

function generateProviderName(baseName = "") {
  return `${baseName.replace(/^use/, "") || "This"}Provider`;
}

/**
 * generateContext is a helper to create a context, provider, and hook in one go.
 * 
 * @param useGetContextValue A custom hook that returns the value for the context.
 * @returns [Provider, useThisContext, Context]
 */
function generateContext<T extends object, P extends object>(
  useGetContextValue: ((props: P) => T) & { displayName?: string }
) {
  const functionName = useGetContextValue.displayName || useGetContextValue.name;
  const hookName = generateHookName(functionName);
  const providerName = generateProviderName(functionName);
  
  const Context = createContext<T & P | undefined>(undefined);

  const errorMessage = `${hookName} hook must be used within ${providerName}`;

  const Provider = (props: P & { children: ReactNode }) => {
    const { children, ...restProps } = props;
    // We cast restProps to P because we know it matches the expected props for useGetContextValue
    const contextValue = useGetContextValue(restProps as unknown as P);

    const value = useMemo(() => {
      return { ...restProps, ...contextValue } as T & P;
    }, [contextValue, restProps]);

    return <Context.Provider value={value}>{children}</Context.Provider>;
  };

  const useThisContext = () => {
    const context = useContext(Context);
    if (context === undefined) {
      throw new Error(errorMessage);
    }
    return context;
  };

  // Set display names for better debugging
  Provider.displayName = providerName;

  return [Provider, useThisContext, Context] as const;
}

export default generateContext;