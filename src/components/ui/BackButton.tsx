import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

interface BackButtonProps {
  fallbackPath?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({ fallbackPath }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else if (fallbackPath) {
      navigate(`${fallbackPath}?${searchParams.toString()}`);
    }
  };

  return (
    <button
      onClick={handleBack}
      className="flex items-center text-gray-400 hover:text-white transition-colors"
    >
      <ArrowLeft className="w-5 h-5 mr-2" />
      Back
    </button>
  );
};