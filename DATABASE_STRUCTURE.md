# Database Structure and Configuration Guide

## Overview
This project uses Supabase as its database backend. The database schema is designed to support a task management system with boards, lists, tasks, and related features, including integration with GoHighLevel (GHL).

## Database Schema

### Tables Structure

#### `boards`
- Primary table for shared project boards
```sql
CREATE TABLE boards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  location_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### `private_boards`
- Table for user-specific private boards
```sql
CREATE TABLE private_boards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email text NOT NULL,
  title text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### `lists`
- Contains task lists within shared boards
```sql
CREATE TABLE lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id uuid REFERENCES boards(id) ON DELETE CASCADE,
  title text NOT NULL,
  position integer NOT NULL DEFAULT 0,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### `private_lists`
- Contains task lists within private boards
```sql
CREATE TABLE private_lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id uuid REFERENCES private_boards(id) ON DELETE CASCADE,
  title text NOT NULL,
  position integer NOT NULL DEFAULT 0,
  user_email text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### `tasks`
- Stores shared tasks with GHL integration
```sql
CREATE TABLE tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id uuid REFERENCES lists(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  content text DEFAULT '',
  priority text CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  labels jsonb DEFAULT '[]'::jsonb,
  assignees jsonb DEFAULT '[]'::jsonb,
  tags jsonb DEFAULT '[]'::jsonb,
  custom_field_values jsonb DEFAULT '[]'::jsonb,
  checklist jsonb DEFAULT '[]'::jsonb,
  attachments jsonb DEFAULT '[]'::jsonb,
  due_date timestamptz,
  start_date timestamptz,
  estimated_time integer,
  actual_time integer,
  position integer NOT NULL DEFAULT 0,
  status text CHECK (status IN ('completed', 'incompleted')) DEFAULT 'incompleted',
  ghl_task_id text,
  contact_id text,
  location_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### `private_tasks`
- Stores private tasks for individual users
```sql
CREATE TABLE private_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id uuid REFERENCES private_lists(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  content text DEFAULT '',
  priority text CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  labels jsonb DEFAULT '[]'::jsonb,
  assignees jsonb DEFAULT '[]'::jsonb,
  tags jsonb DEFAULT '[]'::jsonb,
  custom_field_values jsonb DEFAULT '[]'::jsonb,
  checklist jsonb DEFAULT '[]'::jsonb,
  attachments jsonb DEFAULT '[]'::jsonb,
  due_date timestamptz,
  start_date timestamptz,
  estimated_time integer,
  actual_time integer,
  position integer NOT NULL DEFAULT 0,
  status text DEFAULT 'incompleted',
  user_email text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### `comments`
- Stores comments for shared tasks
```sql
CREATE TABLE comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid REFERENCES tasks(id) ON DELETE CASCADE,
  user_id text NOT NULL,
  user_name text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### `private_comments`
- Stores comments for private tasks
```sql
CREATE TABLE private_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid REFERENCES private_tasks(id) ON DELETE CASCADE,
  user_id text NOT NULL,
  user_name text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### `contacts`
- Stores contact information synced with GHL
```sql
CREATE TABLE contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ghl_id text UNIQUE NOT NULL,
  name text NOT NULL,
  email text,
  location_id text NOT NULL,
  api_key text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### `team_members`
- Stores team member information
```sql
CREATE TABLE team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id text NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  ghl_user_id text UNIQUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

## Security Features

### Row Level Security (RLS)
All tables have RLS enabled with appropriate policies:
- Shared resources: Access based on location_id
- Private resources: Access based on user_email
- Comments: Access through task association

### Indexes
Strategic indexes are created for performance:
- Primary keys (automatically indexed)
- Foreign key relationships
- Commonly queried fields
- JSON fields using GIN indexes where appropriate
- Position fields for ordering
- User email and location ID fields

## GHL Integration
- Tasks are synchronized with GHL tasks
- Contacts are synchronized with GHL contacts
- Team members are linked to GHL users
- Metadata tracks sync status and timestamps
- Error handling for failed synchronization

## Data Synchronization
The following fields are synchronized between the application and GHL:
- Task title
- Task description
- Task status (completed/incompleted)
- Contact assignment
- Team member assignment
- Due date

All other fields are maintained locally in the application only.