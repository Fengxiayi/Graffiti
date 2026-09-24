import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface ThemeContextValue {
  theme: 'light';
}

const ThemeContext = createContext<ThemeContextValue>({ theme: 'light' });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme] = useState<'light'>('light');

  useEffect(() => {
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
  }, []);

  return <ThemeContext.Provider value={{ theme }}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
