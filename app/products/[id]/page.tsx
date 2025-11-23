import { prisma } from "@/lib/prisma";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { User } from "@heroui/user";
import { ProductHistoryChart } from "@/components/product-history-chart";
import { ArrowLeftIcon, CalendarIcon, StoreIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@heroui/button";
// Import component bảng đã tách ra để tránh lỗi Server Component
import { ProductVersionHistoryTable } from "@/components/product-version-history-table";

// Hàm lấy dữ liệu chi tiết sản phẩm từ Warehouse
async function getProductDetail(productId: string) {
  // 1. Lấy thông tin Dimension hiện tại (Current Version)
  const currentDim = await prisma.dim_product.findFirst({
    where: { 
      product_id: productId,
      is_current: true 
    }
  });

  // Nếu không tìm thấy sản phẩm hiện tại, trả về null
  if (!currentDim) return null;

  // 2. Lấy lịch sử biến động giá/kho từ Fact Table (Inventory Snapshot)
  // Join với Dim Date để lấy ngày tháng hiển thị cho biểu đồ
  const historyRaw: any[] = await prisma.$queryRaw`
    SELECT 
      d.full_date,
      f.stock,
      f.price_real
    FROM "warehouse"."fact_inventory_snapshot" f
    JOIN "warehouse"."dim_sku" s ON f.sku_key = s.sku_key
    JOIN "warehouse"."dim_date" d ON f.date_key = d.date_key
    WHERE s.product_key = ${currentDim.product_key}
    ORDER BY d.full_date ASC
    LIMIT 30 -- Lấy 30 ngày gần nhất
  `;

  // 3. Lấy lịch sử thay đổi thông tin (SCD Type 2 History)
  // Xem sản phẩm này đã thay đổi tiêu đề/mô tả/danh mục bao nhiêu lần
  const versionHistory = await prisma.dim_product.findMany({
    where: { product_id: productId },
    orderBy: { valid_from: 'desc' },
    select: {
      title: true,
      valid_from: true,
      valid_to: true,
      is_current: true,
      description: true,
      categories: true
    }
  });

  return {
    info: currentDim,
    // Map dữ liệu cho Recharts
    chartData: historyRaw.map(item => ({
        date: new Date(item.full_date).toLocaleDateString('vi-VN', {day: '2-digit', month: '2-digit'}),
        price: Number(item.price_real),
        stock: item.stock
    })),
    versions: versionHistory
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // Decode ID vì URL có thể chứa ký tự đặc biệt (ví dụ dấu cách, tiếng Việt)
  const decodedId = decodeURIComponent(id);
  const data = await getProductDetail(decodedId);

  if (!data) {
    return (
        <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
            <h2 className="text-xl font-bold text-default-500">Không tìm thấy Sản phẩm trong Warehouse</h2>
            <Link href="/products">
                <Button color="primary" variant="flat">Quay lại Danh sách</Button>
            </Link>
        </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Header & Back Button */}
      <div className="flex items-center gap-4">
        <Link href="/products">
          <Button isIconOnly variant="flat" size="sm"><ArrowLeftIcon size={20}/></Button>
        </Link>
        <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
                Chế độ Xem Toàn diện Sản phẩm (360 View)
                <Chip size="sm" color="success" variant="flat">Dữ liệu Warehouse</Chip>
            </h1>
            <p className="text-default-500 text-sm font-mono">ID: {decodedId}</p>
        </div>
      </div>

      {/* 2. Main Content Grid: Info & Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Product Information */}
        <Card className="lg:col-span-1 h-full">
            <CardHeader>
                <h3 className="font-semibold text-lg">Thông tin Dimension Hiện tại</h3>
            </CardHeader>
            <CardBody className="flex flex-col gap-5">
                <User 
                    name={<span className="text-lg font-semibold line-clamp-2">{data.info.title}</span>}
                    description={data.info.product_id}
                    avatarProps={{ radius: "lg", size: "lg", isBordered: true }}
                />
                
                <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm p-2 bg-default-100 rounded-lg">
                        <div className="flex items-center gap-2 text-default-500">
                            <StoreIcon size={16} />
                            <span>ID Người Bán</span>
                        </div>
                        <span className="font-mono font-bold">{data.info.seller_id}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm p-2 bg-default-100 rounded-lg">
                        <div className="flex items-center gap-2 text-default-500">
                            <CalendarIcon size={16} />
                            <span>Có hiệu lực từ</span>
                        </div>
                        <span>{data.info.valid_from ? new Date(data.info.valid_from).toLocaleDateString('vi-VN') : 'N/A'}</span>
                    </div>
                </div>
                
                <div className="p-3 border border-default-200 rounded-lg text-sm bg-background">
                    <p className="font-semibold mb-2 text-default-600">Ảnh chụp Mô tả:</p>
                    <p className="line-clamp-[8] text-default-500 leading-relaxed">
                        {data.info.description || "Không có mô tả nào."}
                    </p>
                </div>
            </CardBody>
        </Card>

        {/* Right Column: Price & Stock Chart */}
        <div className="lg:col-span-2">
             <ProductHistoryChart data={data.chartData} />
        </div>
      </div>

      {/* 3. Bottom Section: Version History Table (SCD Type 2) */}
      <Card>
        <CardHeader>
            <div className="flex flex-col">
                <h3 className="font-semibold text-lg">Lịch sử Dimension</h3>
                <p className="text-small text-default-500">Theo dõi Dimension Thay đổi Chậm (SCD Loại 2)</p>
            </div>
        </CardHeader>
        <CardBody>
            <ProductVersionHistoryTable versions={data.versions} />
        </CardBody>
      </Card>
    </div>
  );
}