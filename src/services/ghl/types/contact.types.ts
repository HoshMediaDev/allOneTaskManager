export interface Contact {
  id: string;
  locationId: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  type: string;
  source: string;
  tags: string[];
  dateAdded: string;
  dateUpdated: string;
  customFields: Array<{
    id: string;
    name: string;
    value: string;
  }>;
}

export interface ContactsResponse {
  contacts: Contact[];
  meta: {
    total: number;
    count: number;
    currentPage: number;
    totalPages: number;
  };
}

export interface ContactSearchParams {
  query?: string;
  tags?: string[];
  dateAddedFrom?: string;
  dateAddedTo?: string;
  page?: number;
  limit?: number;
}