import { useEffect } from 'react';
import { usePrivateBoardStore } from '../store/privateBoardStore';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';

export const usePrivateBoards = () => {
  const { loadBoards, boards } = usePrivateBoardStore();
  const { userEmail } = useAuthStore();
  const navigate = useNavigate();

  // Load boards when email changes or on mount
  useEffect(() => {
    if (!userEmail) {
      navigate('/dashboard');
      return;
    }

    loadBoards();
  }, [userEmail, loadBoards, navigate]);

  // Filter boards by current user email
  const userBoards = boards.filter(board => board.user_email === userEmail);

  return { boards: userBoards };
};