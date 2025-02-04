import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CustomCSSState {
  css: string;
  setCSS: (css: string) => void;
}

export const useCustomCSSStore = create<CustomCSSState>()(
  persist(
    (set) => ({
      css: '',
      setCSS: (css) => {
        set({ css });
        // Apply CSS to the document
        let styleElement = document.getElementById('custom-css');
        if (!styleElement) {
          styleElement = document.createElement('style');
          styleElement.id = 'custom-css';
          document.head.appendChild(styleElement);
        }
        styleElement.textContent = css;
      },
    }),
    {
      name: 'custom-css-storage',
      onRehydrateStorage: () => (state) => {
        // Reapply CSS after storage rehydration
        if (state?.css) {
          let styleElement = document.getElementById('custom-css');
          if (!styleElement) {
            styleElement = document.createElement('style');
            styleElement.id = 'custom-css';
            document.head.appendChild(styleElement);
          }
          styleElement.textContent = state.css;
        }
      },
    }
  )
);