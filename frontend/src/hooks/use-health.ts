'use client';

import { useState, useEffect, useCallback } from 'react';
import { healthService } from '@/services/health.service';
import { HealthStatus } from '@/types';

export function useHealth() {
  const [data, setData] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const checkInitialHealth = async () => {
      try {
        const res = await healthService.getHealth();
        if (!cancelled) {
          setData(res);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to connect to backend service');
          setData(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    checkInitialHealth();

    return () => {
      cancelled = true;
    };
  }, []);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await healthService.getHealth();
      setData(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect to backend service');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, refetch };
}
