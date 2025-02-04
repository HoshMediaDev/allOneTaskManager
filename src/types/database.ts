export interface Database {
  public: {
    Tables: {
      boards: {
        Row: {
          id: string;
          title: string;
          lists: any[];
          location_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          lists?: any[];
          location_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          lists?: any[];
          location_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      custom_fields: {
        Row: {
          id: string;
          location_id: string;
          name: string;
          type: string;
          options: any[];
          required: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          location_id: string;
          name: string;
          type: string;
          options?: any[];
          required?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          location_id?: string;
          name?: string;
          type?: string;
          options?: any[];
          required?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}