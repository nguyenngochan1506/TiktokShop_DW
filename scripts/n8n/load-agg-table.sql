INSERT INTO warehouse.Agg_Product_Daily_Summary (
    date_key,
    product_key,
    shop_key,
    total_reviews_today,
    avg_rating_today,
    total_sold_cumulative,
    current_stock,
    current_price
)
WITH DailyReviews AS (
    -- 1. Tính toán review trong ngày
    SELECT
        date_key,
        dp.product_key,
        COUNT(fr.review_fact_key) AS total_reviews_today,
        AVG(fr.rating) AS avg_rating_today
    FROM
        warehouse.Fact_Reviews AS fr
    JOIN
        warehouse.Dim_SKU AS ds ON fr.sku_key = ds.sku_key
    JOIN
        warehouse.Dim_Product AS dp ON ds.product_key = dp.product_key
    GROUP BY
        date_key, dp.product_key
),
DailySales AS (
    -- 2. Lấy snapshot doanh số
    SELECT
        date_key,
        product_key,
        shop_key,
        sold_count AS total_sold_cumulative,
        avg_rating 
    FROM
        warehouse.Fact_Sales_Snapshot
),
DailyInventory AS (
    -- 3. Lấy snapshot tồn kho
    SELECT
        fis.date_key,
        dp.product_key,
        SUM(fis.stock) AS current_stock,
        AVG(fis.price_real) AS current_price -- Có thể lấy AVG 
    FROM
        warehouse.Fact_Inventory_Snapshot AS fis
    JOIN
        warehouse.Dim_SKU AS ds ON fis.sku_key = ds.sku_key
    JOIN
        warehouse.Dim_Product AS dp ON ds.product_key = dp.product_key
    GROUP BY
        fis.date_key, dp.product_key
)
-- Join tất cả lại
SELECT
    COALESCE(ds.date_key, di.date_key, dr.date_key) AS date_key,
    COALESCE(ds.product_key, di.product_key, dr.product_key) AS product_key,
    ds.shop_key,
    COALESCE(dr.total_reviews_today, 0) AS total_reviews_today,
    dr.avg_rating_today,
    ds.total_sold_cumulative,
    di.current_stock,
    di.current_price
FROM
    DailySales AS ds
-- Dùng FULL JOIN để không bỏ sót ngày nào (có thể 1 ngày có sales nhưng ko có inventory)
FULL JOIN
    DailyInventory AS di ON ds.date_key = di.date_key AND ds.product_key = di.product_key
FULL JOIN
    DailyReviews AS dr ON ds.date_key = dr.date_key AND ds.product_key = dr.product_key;