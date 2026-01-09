import { useCallback } from 'react';

export const useFullscreen = (elementRef: React.RefObject<HTMLElement>) => {
  const enterFullscreen = useCallback(async () => {
    if (!elementRef.current) return;

    try {
      const elem = elementRef.current;
      
      if (elem.requestFullscreen) {
        await elem.requestFullscreen();
      } else if ((elem as any).webkitRequestFullscreen) {
        await (elem as any).webkitRequestFullscreen();
      } else if ((elem as any).mozRequestFullScreen) {
        await (elem as any).mozRequestFullScreen();
      } else if ((elem as any).msRequestFullscreen) {
        await (elem as any).msRequestFullscreen();
      }
    } catch (error) {
      console.error('Fullscreen request failed:', error);
    }
  }, [elementRef]);

  const exitFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else if ((document as any).webkitFullscreenElement) {
        await (document as any).webkitExitFullscreen();
      } else if ((document as any).mozFullScreenElement) {
        await (document as any).mozCancelFullScreen();
      } else if ((document as any).msFullscreenElement) {
        await (document as any).msExitFullscreen();
      }
    } catch (error) {
      console.error('Exit fullscreen failed:', error);
    }
  }, []);

  const isFullscreen = useCallback(() => {
    return !!(
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).msFullscreenElement
    );
  }, []);

  return { enterFullscreen, exitFullscreen, isFullscreen };
};
