import { useState, useCallback } from 'react';

interface ModalState {
  isOpen: boolean;
  data?: any;
}

export const useModalState = (initialState: boolean = false) => {
  const [state, setState] = useState<ModalState>({ isOpen: initialState });

  const open = useCallback((data?: any) => {
    setState({ isOpen: true, data });
  }, []);

  const close = useCallback(() => {
    setState({ isOpen: false });
  }, []);

  return {
    isOpen: state.isOpen,
    data: state.data,
    open,
    close,
  };
};