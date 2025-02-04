/*
  # Fix Private Boards Migration
  
  1. Changes
    - Migrate data from boards to private_boards
    - Migrate data from lists to private_lists
    - Migrate data from tasks to private_tasks
    - Preserve all relationships and data
  
  2. Security
    - Maintains RLS policies
    - Preserves data ownership
*/

-- First, migrate any existing boards to private_boards
INSERT INTO private_boards (id, title, user_email, created_at, updated_at)
SELECT 
  b.id,
  b.title,
  t.user_email,
  b.created_at,
  b.updated_at
FROM boards b
JOIN tasks t ON t.list_id IN (SELECT id FROM lists WHERE board_id = b.id)
WHERE t.user_email IS NOT NULL
GROUP BY b.id, b.title, t.user_email, b.created_at, b.updated_at
ON CONFLICT (id) DO NOTHING;

-- Then migrate lists to private_lists
INSERT INTO private_lists (id, board_id, title, position, user_email, created_at, updated_at)
SELECT 
  l.id,
  l.board_id,
  l.title,
  l.position,
  t.user_email,
  l.created_at,
  l.updated_at
FROM lists l
JOIN tasks t ON t.list_id = l.id
WHERE t.user_email IS NOT NULL
GROUP BY l.id, l.board_id, l.title, l.position, t.user_email, l.created_at, l.updated_at
ON CONFLICT (id) DO NOTHING;

-- Finally migrate tasks to private_tasks
INSERT INTO private_tasks (
  id, list_id, title, description, content, priority,
  labels, assignees, tags, custom_field_values, checklist,
  attachments, due_date, start_date, estimated_time,
  actual_time, position, status, user_email, created_at, updated_at
)
SELECT 
  t.id,
  t.list_id,
  t.title,
  t.description,
  t.content,
  t.priority,
  t.labels,
  t.assignees,
  t.tags,
  t.custom_field_values,
  t.checklist,
  t.attachments,
  t.due_date,
  t.start_date,
  t.estimated_time,
  t.actual_time,
  t.position,
  t.status,
  t.user_email,
  t.created_at,
  t.updated_at
FROM tasks t
WHERE t.user_email IS NOT NULL
ON CONFLICT (id) DO NOTHING;

-- Add comments
COMMENT ON TABLE private_boards IS 'Private boards visible only to their owners';
COMMENT ON TABLE private_lists IS 'Lists within private boards';
COMMENT ON TABLE private_tasks IS 'Tasks within private lists';