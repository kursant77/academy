import { useEffect, useRef } from 'react';

export function useSwipeGesture(onSwipeRight: () => void) {
    const touchStart = useRef<{ x: number; y: number } | null>(null);

    useEffect(() => {
        const handleTouchStart = (e: TouchEvent) => {
            const touch = e.touches[0];
            // Only start if touch is near the left edge (e.g., within 50px)
            // This prevents accidental triggers when interacting with content
            if (touch.clientX < 50) {
                touchStart.current = { x: touch.clientX, y: touch.clientY };
            }
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (!touchStart.current) return;

            const touch = e.touches[0];
            const deltaX = touch.clientX - touchStart.current.x;
            const deltaY = Math.abs(touch.clientY - touchStart.current.y);

            // Thresholds:
            // deltaX > 70: Swiped at least 70px to the right
            // deltaY < 50: Movement was mostly horizontal
            if (deltaX > 70 && deltaY < 50) {
                onSwipeRight();
                touchStart.current = null; // Prevent multiple triggers during one swipe
            }
        };

        const handleTouchEnd = () => {
            touchStart.current = null;
        };

        document.addEventListener('touchstart', handleTouchStart, { passive: true });
        document.addEventListener('touchmove', handleTouchMove, { passive: true });
        document.addEventListener('touchend', handleTouchEnd);

        return () => {
            document.removeEventListener('touchstart', handleTouchStart);
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('touchend', handleTouchEnd);
        };
    }, [onSwipeRight]);
}
