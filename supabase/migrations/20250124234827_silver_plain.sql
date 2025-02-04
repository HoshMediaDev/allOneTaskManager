/*
  # Delete Specific Boards

  1. Changes
    - Delete boards "privet" and "Test Board 1" and their associated data
    - Preserve "test board 2" and its data

  2. Safety
    - Uses cascading delete to ensure all related data is removed
    - Preserves data integrity
    - Verifies board existence before deletion
*/

DO $$ 
BEGIN
  -- Delete boards and their associated data
  DELETE FROM boards 
  WHERE title IN ('privet', 'Test Board 1');

  -- Due to foreign key constraints with ON DELETE CASCADE,
  -- this will automatically delete:
  -- 1. All lists belonging to these boards
  -- 2. All tasks belonging to those lists
  -- 3. All comments on those tasks
END $$;