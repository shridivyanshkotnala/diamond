import { useCallback, useEffect, useRef, useState } from 'react';

import type { StoneRateType } from '@/types/scanner';
import { buildQuality } from '@/utils/qualityUtils';
import { lookupStoneRate, RateNotFoundError } from '@/utils/ratesApi';

interface UseStoneRateFetchOptions {
  type: StoneRateType;
  color: string;
  clarity: string;
  enabled?: boolean;
  onRateFetched?: (rate: string) => void;
}

interface UseStoneRateFetchResult {
  quality: string;
  rate: string;
  isFetching: boolean;
  rateNotFound: boolean;
  showRateNotFoundModal: boolean;
  notFoundQuality: string;
  fetchRate: () => Promise<void>;
  dismissRateNotFoundModal: () => void;
  setRate: (rate: string) => void;
}

export function useStoneRateFetch({
  type,
  color,
  clarity,
  enabled = true,
  onRateFetched,
}: UseStoneRateFetchOptions): UseStoneRateFetchResult {
  const [rate, setRate] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [rateNotFound, setRateNotFound] = useState(false);
  const [notFoundQuality, setNotFoundQuality] = useState('');
  const [modalDismissed, setModalDismissed] = useState(false);
  const requestIdRef = useRef(0);

  const quality = buildQuality(color, clarity);

  const fetchRate = useCallback(async () => {
    const trimmedColor = color.trim();
    const trimmedClarity = clarity.trim();

    if (!trimmedColor || !trimmedClarity) {
      setRate('');
      setRateNotFound(false);
      return;
    }

    const requestId = ++requestIdRef.current;
    setIsFetching(true);
    setRateNotFound(false);
    setModalDismissed(false);

    try {
      const response = await lookupStoneRate({
        type,
        color: trimmedColor,
        clarity: trimmedClarity,
      });

      if (requestId !== requestIdRef.current) return;

      const rateValue = String(response.rate);
      setRate(rateValue);
      onRateFetched?.(rateValue);
    } catch (error) {
      if (requestId !== requestIdRef.current) return;

      if (error instanceof RateNotFoundError) {
        setRate('');
        setRateNotFound(true);
        setNotFoundQuality(error.quality);
        onRateFetched?.('');
        return;
      }

      setRate('');
      onRateFetched?.('');
    } finally {
      if (requestId === requestIdRef.current) {
        setIsFetching(false);
      }
    }
  }, [type, color, clarity, onRateFetched]);

  useEffect(() => {
    if (!enabled) return;

    const trimmedColor = color.trim();
    const trimmedClarity = clarity.trim();

    if (!trimmedColor || !trimmedClarity) {
      setRate('');
      setRateNotFound(false);
      return;
    }

    const timer = setTimeout(() => {
      fetchRate();
    }, 400);

    return () => clearTimeout(timer);
  }, [color, clarity, enabled, fetchRate]);

  const dismissRateNotFoundModal = useCallback(() => {
    setModalDismissed(true);
  }, []);

  return {
    quality,
    rate,
    isFetching,
    rateNotFound,
    showRateNotFoundModal: rateNotFound && !modalDismissed,
    notFoundQuality,
    fetchRate,
    dismissRateNotFoundModal,
    setRate,
  };
}
