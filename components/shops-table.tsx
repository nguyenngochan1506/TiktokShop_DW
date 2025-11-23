"use client";

import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { User } from "@heroui/user";
import { Chip } from "@heroui/chip";
import { Pagination } from "@heroui/pagination";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { StarIcon, MapPinIcon } from "lucide-react";

export const ShopsTable = ({ shops, totalPages }: { shops: any[], totalPages: number }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  // Helper format số lượng (vd: 1.2k)
  const formatCompactNumber = (number: number) => {
    return new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(number);
  };

  return (
    <Table 
      aria-label="Bảng danh mục cửa hàng"
      className="font-sans"
      bottomContent={
        totalPages > 1 && (
          <div className="flex w-full justify-center">
             <Pagination showControls page={currentPage} total={totalPages} onChange={handlePageChange} />
          </div>
        )
      }
    >
      <TableHeader>
        <TableColumn>THÔNG TIN CỬA HÀNG</TableColumn>
        <TableColumn>ĐIỂM ĐÁNH GIÁ</TableColumn>
        <TableColumn>NGƯỜI THEO DÕI</TableColumn>
        <TableColumn>SẢN PHẨM ĐANG BÁN</TableColumn>
        <TableColumn>KHU VỰC</TableColumn>
      </TableHeader>
      <TableBody emptyContent="Không tìm thấy cửa hàng nào">
        {shops.map((shop) => {
            // Xử lý ảnh Logo từ JSON
            const logoData = shop.shop_logo ? (typeof shop.shop_logo === 'string' ? JSON.parse(shop.shop_logo) : shop.shop_logo) : [];
            // Giả sử logo là array string hoặc string url, lấy phần tử đầu
            const logoUrl = Array.isArray(logoData) ? logoData[0] : (typeof logoData === 'string' ? logoData : null);

            return (
            <TableRow key={shop.id}>
              <TableCell>
                <User
                  avatarProps={{ src: logoUrl, fallback: "CH" }}
                  description={shop.seller_id}
                  name={shop.shop_name || "Cửa hàng không rõ"}
                />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                    <StarIcon size={16} className="text-warning fill-warning" />
                    <span className="font-bold">{shop.shop_rating?.toFixed(1) || "N/A"}</span>
                </div>
              </TableCell>
              <TableCell>
                <Chip size="sm" variant="flat" color="primary">
                    {formatCompactNumber(Number(shop.followers_count || 0))}
                </Chip>
              </TableCell>
              <TableCell>{new Intl.NumberFormat('vi-VN').format(shop.on_sell_product_count || 0)}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1 text-default-500">
                    <MapPinIcon size={14} />
                    <span className="text-small">{shop.region || "N/A"}</span>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};