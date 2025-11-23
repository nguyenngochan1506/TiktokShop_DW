"use client";

import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { User } from "@heroui/user";
import { Pagination } from "@heroui/pagination";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";

export const BaseProductsTable = ({ products, totalPages }: { products: any[], totalPages: number }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <Table
      aria-label="Base products table"
      bottomContent={
        totalPages > 1 && (
          <div className="flex w-full justify-center">
             <Pagination
                showControls
                showShadow
                color="primary"
                page={currentPage}
                total={totalPages}
                onChange={handlePageChange}
             />
          </div>
        )
      }
    >
      <TableHeader>
        <TableColumn>PRODUCT</TableColumn>
        <TableColumn>PRICE</TableColumn>
        <TableColumn>SOLD</TableColumn>
        <TableColumn>SELLER</TableColumn>
        <TableColumn>UPDATED</TableColumn>
      </TableHeader>
      <TableBody emptyContent="No products found">
        {products.map((item) => {
          // Logic xử lý ảnh an toàn (Vì JSONB có thể trả về string hoặc array tùy driver/data)
          let images: string[] = [];
          try {
            if (Array.isArray(item.images)) {
                images = item.images;
            } else if (typeof item.images === 'string') {
                images = JSON.parse(item.images);
            }
          } catch (e) {
            images = [];
          }
          
          // Lấy ảnh đầu tiên làm avatar
          const avatarUrl = images.length > 0 ? images[0] : undefined;

          return (
            <TableRow key={item.id}>
              <TableCell>
                {/* Link dẫn đến trang chi tiết Warehouse View */}
                <Link href={`/products/${encodeURIComponent(item.product_id)}`}>
                    <div className="cursor-pointer group">
                        <User
                            avatarProps={{
                                radius: "lg",
                                src: avatarUrl,
                                fallback: "IMG",
                                className: "group-hover:scale-105 transition-transform" // Hiệu ứng phóng to ảnh khi hover
                            }}
                            description={item.product_id}
                            name={
                                <div 
                                    className="w-[250px] truncate font-medium text-foreground group-hover:text-primary transition-colors" 
                                    title={item.title}
                                >
                                    {item.title}
                                </div>
                            }
                        />
                    </div>
                </Link>
              </TableCell>
              <TableCell>
                <div className="font-bold text-success">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price_sale || 0)}
                </div>
                {/* Nếu có giá gốc và giá gốc lớn hơn giá bán thì hiển thị gạch ngang */}
                {item.price_original && Number(item.price_original) > Number(item.price_sale) && (
                    <div className="text-tiny text-default-400 line-through">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price_original)}
                    </div>
                )}
              </TableCell>
              <TableCell>{new Intl.NumberFormat('vi-VN').format(item.sold_count || 0)}</TableCell>
              <TableCell>{item.seller_id}</TableCell>
              <TableCell className="text-tiny text-default-400">
                {item.load_timestamp ? new Date(item.load_timestamp).toLocaleDateString('vi-VN') : ''}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};