export interface LocationTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  locationId: string;
  planId: string;
  userId: string;
}

export interface LocationBusiness {
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  website: string;
  timezone: string;
  logoUrl: string;
}

export interface LocationSocial {
  facebookUrl?: string;
  googlePlus?: string;
  linkedIn?: string;
  foursquare?: string;
  twitter?: string;
  yelp?: string;
  instagram?: string;
  youtube?: string;
  pinterest?: string;
  blogRss?: string;
  googlePlacesId?: string;
}

export interface LocationSettings {
  allowDuplicateContact: boolean;
  allowDuplicateOpportunity: boolean;
  allowFacebookNameMerge: boolean;
  disableContactTimezone: boolean;
}

export interface Location {
  id: string;
  companyId: string;
  name: string;
  domain: string;
  address: string;
  city: string;
  state: string;
  logoUrl: string;
  country: string;
  postalCode: string;
  website: string;
  timezone: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  business: LocationBusiness;
  social: LocationSocial;
  settings: LocationSettings;
  reseller: Record<string, unknown>;
}