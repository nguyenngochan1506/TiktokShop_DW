INSERT INTO warehouse.Dim_Shop (
    seller_id, shop_name, region, shop_rating, followers_count, on_sell_product_count
)
SELECT 
    DISTINCT ON (seller_id)
    seller_id, 
    shop_name, 
    region, 
    shop_rating, 
    followers_count, 
    on_sell_product_count
FROM 
    staging.tbl_base_shop_info
ORDER BY 
    seller_id, load_timestamp DESC
ON CONFLICT (seller_id) WHERE (is_current = true)
DO UPDATE SET
    shop_name = EXCLUDED.shop_name,
    region = EXCLUDED.region,
    shop_rating = EXCLUDED.shop_rating,
    followers_count = EXCLUDED.followers_count,
    on_sell_product_count = EXCLUDED.on_sell_product_count,
    valid_from = now();