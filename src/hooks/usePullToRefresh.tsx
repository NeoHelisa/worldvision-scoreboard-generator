// src/hooks/usePullToRefresh.tsx

import { useEffect, useRef, useState } from 'react';

const usePullToRefresh = (onRefresh: () => void): boolean => {
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const startY = useRef<number>(0);
  const currentY = useRef<number>(0);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent): void => {
      startY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent): void => {
      currentY.current = e.touches[0].clientY;
      if (currentY.current - startY.current > 50) {
        setIsRefreshing(true);
      }
    };

    const handleTouchEnd = (): void => {
      if (isRefreshing) {
        onRefresh();
        setIsRefreshing(false);
      }
    };

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isRefreshing, onRefresh]);

  return isRefreshing;
};

export default usePullToRefresh;
