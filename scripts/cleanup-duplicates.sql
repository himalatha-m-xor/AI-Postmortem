-- Clean up duplicate incidents
-- This script removes duplicate incidents with the same title

-- Show duplicates before deletion
SELECT title, COUNT(*) as count
FROM incidents
GROUP BY title
HAVING COUNT(*) > 1
ORDER BY count DESC;

-- Delete duplicates, keeping only the oldest one
DELETE FROM incidents a USING incidents b
WHERE a.id > b.id
AND a.title = b.title;

-- Show remaining incidents
SELECT id, title, start_time, status
FROM incidents
ORDER BY start_time DESC;
