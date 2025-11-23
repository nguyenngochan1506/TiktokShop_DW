import { Card, CardBody, CardHeader } from "@heroui/card";
import { prisma } from "@/lib/prisma";
import { serializeData } from "@/lib/utils";
import { TrendingUpIcon, StoreIcon, CalendarIcon, FilterXIcon } from "lucide-react";
import { TopProductsTable, TopShopsTable } from "@/components/analytics-tables";
import { DownloadBtn } from "@/components/download-btn";
import { DateRangeFilter } from "@/components/date-range-filter";

// Hàm lấy ngày mới nhất có dữ liệu trong khoảng filter
async function getTargetDateKey(from?: string, to?: string) {
  // Nếu không có filter, lấy ngày max tuyệt đối trong hệ thống
  if (!from || !to) {
    const maxResult = await prisma.fact_sales_snapshot.aggregate({
      _max: { date_key: true }
    });
    return maxResult._max.date_key;
  }

  // Nếu có filter, tìm date_key lớn nhất (gần nhất) nằm trong khoảng đó
  // Cần join với dim_date để so sánh ngày thực tế
  const targetDateInfo = await prisma.dim_date.findFirst({
    where: {
      full_date: {
        gte: new Date(from),
        lte: new Date(to)
      }
    },
    orderBy: { date_key: 'desc' }, // Lấy ngày cuối cùng của khoảng
    select: { date_key: true }
  });

  return targetDateInfo?.date_key || null;
}

async function getWarehouseData(from?: string, to?: string) {
  // 1. Xác định Date Key cần query
  const targetDateKey = await getTargetDateKey(from, to);

  if (!targetDateKey) {
    return { topProducts: [], topShops: [], displayDate: "Không tìm thấy dữ liệu", hasData: false };
  }

  // Lấy thông tin hiển thị ngày
  const dateInfo = await prisma.dim_date.findUnique({
    where: { date_key: targetDateKey }
  });
  const dateDisplay = dateInfo 
    ? new Date(dateInfo.full_date).toLocaleDateString('vi-VN') 
    : targetDateKey.toString();

  // 2. Top Products (Snapshot tại ngày target)
  const topProductsRaw: any[] = await prisma.$queryRaw`
    SELECT 
      p.title, p.product_id,
      MAX(s.shop_name) as shop_name,
      MAX(f.sold_count) as sold_count,
      MAX(f.price_sale) as price_sale
    FROM "warehouse"."fact_sales_snapshot" f
    JOIN "warehouse"."dim_product" p ON f.product_key = p.product_key
    JOIN "warehouse"."dim_shop" s ON f.shop_key = s.shop_key
    WHERE f.date_key = ${targetDateKey}
    GROUP BY p.product_key, p.title, p.product_id
    ORDER BY sold_count DESC
    LIMIT 50 -- Lấy 50 để export Excel cho sướng, Table hiển thị 5 cũng được
  `;

  // Format cho Table hiển thị
  const topProductsFormatted = topProductsRaw.map(item => ({
    dim_product: { title: item.title, product_id: item.product_id },
    dim_shop: { shop_name: item.shop_name },
    sold_count: item.sold_count,
    price_sale: item.price_sale
  }));

  // Format flat data cho Excel export
  const topProductsExport = topProductsRaw.map(item => ({
    "Tên Sản Phẩm": item.title,
    "ID Sản Phẩm": item.product_id,
    "Tên Cửa Hàng": item.shop_name,
    "Số Lượng Đã Bán": Number(item.sold_count), // BigInt safe convert
    "Giá Bán": Number(item.price_sale)
  }));

  // 3. Top Shops (Snapshot tại ngày target)
  const topShopsRaw: any[] = await prisma.$queryRaw`
    WITH unique_products AS (
      SELECT DISTINCT ON (f.product_key)
        f.product_key,
        f.shop_key,
        f.sold_count,
        f.price_sale
      FROM "warehouse"."fact_sales_snapshot" f
      WHERE f.date_key = ${targetDateKey}
      ORDER BY f.product_key, f.sold_count DESC
    )
    SELECT 
      s.shop_name, s.seller_id,
      SUM(u.sold_count * u.price_sale) as revenue,
      SUM(u.sold_count) as total_sold
    FROM unique_products u
    JOIN "warehouse"."dim_shop" s ON u.shop_key = s.shop_key
    GROUP BY s.shop_name, s.seller_id
    ORDER BY revenue DESC
    LIMIT 50
  `;

  const topShopsExport = topShopsRaw.map(item => ({
    "Tên Cửa Hàng": item.shop_name,
    "ID Người Bán": item.seller_id,
    "Tổng Số Lượng Đã Bán": Number(item.total_sold),
    "Doanh Thu Ước Tính": Number(item.revenue)
  }));

  return {
    topProducts: serializeData(topProductsFormatted.slice(0, 10)), // Chỉ lấy 10 hiển thị
    topProductsExport: serializeData(topProductsExport), // Full list export
    topShops: serializeData(topShopsRaw.slice(0, 10)),
    topShopsExport: serializeData(topShopsExport),
    displayDate: dateDisplay,
    hasData: true
  };
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const params = await searchParams;
  const data = await getWarehouseData(params.from, params.to);

  return (
    <div className="space-y-6">
      {/* Header & Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Phân Tích Data Warehouse</h1>
          <p className="text-small text-default-500">
            Phân tích dữ liệu Snapshot (Hiển thị dữ liệu cho ngày: <strong>{data.displayDate}</strong>)
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 items-end sm:items-center w-full md:w-auto">
          <DateRangeFilter />
          
          <div className="flex items-center gap-2 text-default-500 text-sm bg-default-100 px-3 py-2 rounded-lg border border-default-200 h-10">
              <CalendarIcon size={16} />
              <span className="whitespace-nowrap">Snapshot: <strong>{data.displayDate}</strong></span>
          </div>
        </div>
      </div>
      
      {!data.hasData ? (
        <div className="flex flex-col items-center justify-center h-[300px] border border-dashed border-default-300 rounded-xl bg-default-50">
            <FilterXIcon size={48} className="text-default-300 mb-4"/>
            <h3 className="text-lg font-semibold text-default-500">Không tìm thấy Dữ liệu Snapshot</h3>
            <p className="text-sm text-default-400">Hãy thử chọn một khoảng ngày khác.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Top Products Card */}
          <Card>
            <CardHeader className="flex justify-between items-start">
              <div className="flex gap-3">
                <TrendingUpIcon className="text-primary" />
                <div className="flex flex-col">
                  <p className="text-md font-bold">Sản Phẩm Bán Chạy Nhất</p>
                  <p className="text-small text-default-500">Tổng số lượng đã bán tích lũy</p>
                </div>
              </div>
              <DownloadBtn 
                data={data.topProductsExport} 
                fileName={`Top_Products_${data.displayDate.replace(/\//g, '-')}`}
              />
            </CardHeader>
            <CardBody>
              <TopProductsTable products={data.topProducts} />
            </CardBody>
          </Card>

          {/* Top Shops Card */}
          <Card>
            <CardHeader className="flex justify-between items-start">
              <div className="flex gap-3">
                <StoreIcon className="text-success" />
                <div className="flex flex-col">
                  <p className="text-md font-bold">Cửa Hàng Doanh Thu Cao Nhất</p>
                  <p className="text-small text-default-500">Doanh thu dựa trên số lượng đã bán</p>
                </div>
              </div>
              <DownloadBtn 
                data={data.topShopsExport} 
                fileName={`Top_Shops_${data.displayDate.replace(/\//g, '-')}`}
                color="success"
              />
            </CardHeader>
            <CardBody>
              <TopShopsTable shops={data.topShops} />
            </CardBody>
          </Card>

        </div>
      )}
    </div>
  );
}