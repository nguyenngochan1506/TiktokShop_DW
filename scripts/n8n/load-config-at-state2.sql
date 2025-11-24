UPDATE controller.crawled_files_log
SET status = 'PROCESSING',
    processed_at = NOW()
WHERE id = (
    SELECT id 
    FROM controller.crawled_files_log
    WHERE status = 'PENDING'
    ORDER BY created_at
    LIMIT 1
    FOR UPDATE SKIP LOCKED
)
RETURNING *;
