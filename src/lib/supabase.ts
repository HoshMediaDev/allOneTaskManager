import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'x-application-name': 'task-manager'
    }
  },
  // Add retry configuration
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  // Add request retry configuration
  fetch: (url, options = {}) => {
    const retryOptions = {
      retries: 3,
      retryDelay: (attempt: number) => Math.min(attempt * 1000, 3000), // Exponential backoff up to 3 seconds
      retryCondition: (error: any) => {
        // Retry on network errors and 5xx server errors
        return !error.response || (error.response.status >= 500 && error.response.status < 600);
      }
    };

    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'x-retry-after': '1' // Tell server to retry after 1 second
      }
    }).catch(async error => {
      if (retryOptions.retryCondition(error)) {
        for (let attempt = 1; attempt <= retryOptions.retries; attempt++) {
          try {
            await new Promise(resolve => 
              setTimeout(resolve, retryOptions.retryDelay(attempt))
            );
            return await fetch(url, options);
          } catch (retryError) {
            if (attempt === retryOptions.retries) throw retryError;
          }
        }
      }
      throw error;
    });
  }
});