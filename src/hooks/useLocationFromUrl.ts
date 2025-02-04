import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export const useLocationFromUrl = () => {
  const location = useLocation();
  const { setLocationId } = useAuthStore();

  useEffect(() => {
    // Extract locationId from URL path (e.g., /locationid=123)
    const match = location.pathname.match(/\/locationid=([^/]+)/);
    const locationId = match ? match[1] : null;
    
    if (locationId) {
      setLocationId(locationId);
    }
  }, [location.pathname, setLocationId]);
};