import { useLocationStore } from '../../store/locationStore';

export class LocationService {
  private static instance: LocationService;

  private constructor() {}

  static getInstance(): LocationService {
    if (!this.instance) {
      this.instance = new LocationService();
    }
    return this.instance;
  }

  async testConnection(): Promise<boolean> {
    const { apiKey, baseUrl } = useLocationStore.getState();
    
    if (!apiKey) {
      throw new Error('API key not configured');
    }

    try {
      const response = await fetch(`${baseUrl}locations/me`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        }
      });

      return response.ok;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }
}