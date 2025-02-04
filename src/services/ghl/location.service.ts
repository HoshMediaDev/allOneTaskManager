import { GHLApiClient } from './api.client';
import { GHL_CONFIG } from './config';
import type { Location, LocationTokenResponse } from './types';

export class LocationService {
  private static instance: LocationService;
  private apiClient: GHLApiClient;

  private constructor() {
    this.apiClient = GHLApiClient.getInstance();
  }

  static getInstance(): LocationService {
    if (!this.instance) {
      this.instance = new LocationService();
    }
    return this.instance;
  }

  async getLocationToken(companyId: string, locationId: string): Promise<LocationTokenResponse> {
    const response = await fetch(`${GHL_CONFIG.BASE_URL}/oauth/locationToken`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${this.apiClient.getAccessToken()}`,
        'Version': '2021-07-28'
      },
      body: new URLSearchParams({
        companyId,
        locationId
      })
    });

    if (!response.ok) {
      throw new Error('Failed to get location token');
    }

    return response.json();
  }

  async getLocationDetails(locationId: string): Promise<Location> {
    return this.apiClient.request<{ location: Location }>(
      `/locations/${locationId}`
    ).then(response => response.location);
  }
}