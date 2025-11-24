INSERT INTO warehouse.Fact_Reviews (
    sku_key, date_key, shop_key, review_id, rating, review_timestamp
)
SELECT
    -- 1. Chỉ chọn MỘT dòng cho mỗi 'review_id'
    DISTINCT ON (rev.review_id)
    COALESCE(dsku.sku_key, -1), 
    CAST(TO_CHAR(rev.review_timestamp, 'YYYYMMDD') AS INTEGER), 
    COALESCE(dshop.shop_key, -1),
    rev.review_id,              
    rev.rating,                 
    rev.review_timestamp        
FROM 
    staging.tbl_base_product_reviews AS rev
LEFT JOIN
    warehouse.Dim_SKU AS dsku ON rev.sku_id = dsku.sku_id AND dsku.is_current = true
LEFT JOIN
    warehouse.Dim_Product AS dp ON dsku.product_key = dp.product_key 
LEFT JOIN
    warehouse.Dim_Shop AS dshop ON dp.seller_id = dshop.seller_id AND dshop.is_current = true
-- 2. Ưu tiên dòng có load_timestamp mới nhất
ORDER BY
    rev.review_id, rev.load_timestamp DESC
-- 3. Phần còn lại của câu lệnh
ON CONFLICT (review_id) DO NOTHING;