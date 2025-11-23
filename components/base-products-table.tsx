"use client";

import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { User } from "@heroui/user";
import { Pagination } from "@heroui/pagination";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

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
             <Pagination showControls page={currentPage} total={totalPages} onChange={handlePageChange} />
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
          // Xử lý hiển thị ảnh từ JSON images
          const images = item.images ? (typeof item.images === 'string' ? JSON.parse(item.images) : item.images) : [];
          const avatarUrl = images.length > 0 ? images[0] : null;

          return (
            <TableRow key={item.id}>
              <TableCell>
                <User
                  avatarProps={{ radius: "lg", src: avatarUrl, fallback: "IMG" }}
                  description={item.product_id}
                  name={
                    <div className="w-[200px] truncate" title={item.title}>
                        {item.title}
                    </div>
                  }
                />
              </TableCell>
              <TableCell>
                <div className="font-bold text-success">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price_sale || 0)}
                </div>
                {item.price_original && (
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