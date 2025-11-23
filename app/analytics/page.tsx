import { Card, CardBody, CardHeader } from "@heroui/card";
import { prisma } from "@/lib/prisma";
import { serializeData } from "@/lib/utils";
import { TrendingUpIcon, StoreIcon, CalendarIcon } from "lucide-react";
import { TopProductsTable, TopShopsTable } from "@/components/analytics-tables";

async function getWarehouseData() {
  // 1. Lấy ngày mới nhất (Giữ nguyên)
  const maxDateResult = await prisma.fact_sales_snapshot.aggregate({
    _max: { date_key: true }
  });
  const latestDateKey = maxDateResult._max.date_key;

  if (!latestDateKey) {
    return { topProducts: [], topShops: [], latestDate: "N/A" };
  }

  const dateInfo = await prisma.dim_date.findUnique({
    where: { date_key: latestDateKey }
  });
  const dateDisplay = dateInfo ? new Date(dateInfo.full_date).toLocaleDateString('vi-VN') : latestDateKey.toString();

  // 2. Top Products (Code cũ đã fix GROUP BY - Giữ nguyên)
  const topProductsRaw: any[] = await prisma.$queryRaw`
    SELECT 
      p.title, p.product_id,
      MAX(s.shop_name) as shop_name,
      MAX(f.sold_count) as sold_count,
      MAX(f.price_sale) as price_sale
    FROM "warehouse"."fact_sales_snapshot" f
    JOIN "warehouse"."dim_product" p ON f.product_key = p.product_key
    JOIN "warehouse"."dim_shop" s ON f.shop_key = s.shop_key
    WHERE f.date_key = ${latestDateKey}
    GROUP BY p.product_key, p.title, p.product_id
    ORDER BY sold_count DESC
    LIMIT 5
  `;

  const topProductsFormatted = topProductsRaw.map(item => ({
    dim_product: { title: item.title, product_id: item.product_id },
    dim_shop: { shop_name: item.shop_name },
    sold_count: item.sold_count,
    price_sale: item.price_sale
  }));

  // 3. Top Shops (SỬA LẠI LOGIC TÍNH TỔNG)
  // Bước 3.1: Dùng CTE (WITH unique_products) để chỉ lấy 1 dòng duy nhất cho mỗi sản phẩm
  // Bước 3.2: Sau đó mới SUM trên danh sách đã khử trùng
  const topShopsRaw: any[] = await prisma.$queryRaw`
    WITH unique_products AS (
      SELECT DISTINCT ON (f.product_key) -- Chỉ lấy 1 dòng duy nhất cho mỗi Product Key
        f.product_key,
        f.shop_key,
        f.sold_count,
        f.price_sale
      FROM "warehouse"."fact_sales_snapshot" f
      WHERE f.date_key = ${latestDateKey}
      ORDER BY f.product_key, f.sold_count DESC -- Nếu trùng thì ưu tiên lấy số lớn nhất
    )
    SELECT 
      s.shop_name, 
      SUM(u.sold_count * u.price_sale) as revenue,
      SUM(u.sold_count) as total_sold
    FROM unique_products u
    JOIN "warehouse"."dim_shop" s ON u.shop_key = s.shop_key
    GROUP BY s.shop_name
    ORDER BY revenue DESC
    LIMIT 5
  `;

  return {
    topProducts: serializeData(topProductsFormatted),
    topShops: serializeData(topShopsRaw),
    latestDate: dateDisplay
  };
}

export default async function AnalyticsPage() {
  const data = await getWarehouseData();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Warehouse Analytics</h1>
        <div className="flex items-center gap-2 text-default-500 text-sm bg-default-100 px-3 py-1 rounded-full">
            <CalendarIcon size={14} />
            <span>Data Date: <strong>{data.latestDate}</strong></span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top Products Card */}
        <Card>
          <CardHeader className="flex gap-3">
            <TrendingUpIcon className="text-primary" />
            <div className="flex flex-col">
              <p className="text-md font-bold">Top Selling Products</p>
              <p className="text-small text-default-500">Highest cumulative sold count</p>
            </div>
          </CardHeader>
          <CardBody>
            <TopProductsTable products={data.topProducts} />
          </CardBody>
        </Card>

        {/* Top Shops Card */}
        <Card>
          <CardHeader className="flex gap-3">
            <StoreIcon className="text-success" />
            <div className="flex flex-col">
              <p className="text-md font-bold">Top Revenue Shops</p>
              <p className="text-small text-default-500">Estimated revenue based on sold count</p>
            </div>
          </CardHeader>
          <CardBody>
            <TopShopsTable shops={data.topShops} />
          </CardBody>
        </Card>

      </div>
    </div>
  );
}