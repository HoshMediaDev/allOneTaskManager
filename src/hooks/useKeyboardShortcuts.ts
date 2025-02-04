import { useEffect } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

interface ShortcutConfig {
  key: string;
  callback: () => void;
  description: string;
}

export const useKeyboardShortcuts = (shortcuts: ShortcutConfig[]) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore shortcuts when typing in input fields
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      shortcuts.forEach(({ key, callback }) => {
        if (e.key.toLowerCase() === key.toLowerCase()) {
          e.preventDefault();
          callback();
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);

  return shortcuts.map(({ key, description }) => ({ key, description }));
};