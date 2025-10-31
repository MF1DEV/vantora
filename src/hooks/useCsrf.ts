'use client';

import { useState, useEffect } from 'react';

export function useCsrf() {
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCsrfToken();
  }, []);

  const fetchCsrfToken = async () => {
    try {
      const response = await fetch('/api/csrf');
      const data = await response.json();
      setCsrfToken(data.token);
    } catch (error) {
      console.error('Failed to fetch CSRF token:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Get headers with CSRF token for fetch requests
   */
  const getCsrfHeaders = (): Record<string, string> => {
    if (!csrfToken) return {};
    return {
      'x-csrf-token': csrfToken,
    };
  };

  return { csrfToken, isLoading, getCsrfHeaders, refreshToken: fetchCsrfToken };
}
