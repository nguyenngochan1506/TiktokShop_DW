"use client";

import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";

// Component hiển thị bảng Top Products
export const TopProductsTable = ({ products }: { products: any[] }) => {
  return (
    <Table aria-label="Top sản phẩm" removeWrapper className="font-sans">
      <TableHeader>
        <TableColumn>SẢN PHẨM</TableColumn>
        <TableColumn>CỬA HÀNG</TableColumn>
        <TableColumn>SỐ LƯỢNG ĐÃ BÁN</TableColumn>
        <TableColumn>GIÁ BÁN</TableColumn>
      </TableHeader>
      <TableBody emptyContent="Không có dữ liệu">
        {products.map((item: any, index: number) => (
          <TableRow key={index}>
            <TableCell>
              <div className="w-[150px] truncate" title={item.dim_product?.title}>
                {item.dim_product?.title || item.dim_product?.product_id}
              </div>
            </TableCell>
            <TableCell>{item.dim_shop?.shop_name || "N/A"}</TableCell>
            <TableCell className="font-bold">
              {new Intl.NumberFormat("vi-VN").format(item.sold_count)}
            </TableCell>
            <TableCell>
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(item.price_sale)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

// Component hiển thị bảng Top Shops
export const TopShopsTable = ({ shops }: { shops: any[] }) => {
  return (
    <Table aria-label="Top cửa hàng" removeWrapper className="font-sans">
      <TableHeader>
        <TableColumn>TÊN CỬA HÀNG</TableColumn>
        <TableColumn>TỔNG SỐ LƯỢNG ĐÃ BÁN</TableColumn>
        <TableColumn>DOANH THU ƯỚC TÍNH</TableColumn>
      </TableHeader>
      <TableBody emptyContent="Không có dữ liệu">
        {shops.map((item: any, index: number) => (
          <TableRow key={index}>
            <TableCell className="font-semibold">{item.shop_name}</TableCell>
            <TableCell>
              {new Intl.NumberFormat("vi-VN").format(item.total_sold)}
            </TableCell>
            <TableCell className="text-success font-bold">
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(item.revenue)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};