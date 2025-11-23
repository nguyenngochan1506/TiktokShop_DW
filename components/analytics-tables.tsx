"use client"; // Bắt buộc phải có dòng này

import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";

// Component hiển thị bảng Top Products
export const TopProductsTable = ({ products }: { products: any[] }) => {
  return (
    <Table aria-label="Top products" removeWrapper>
      <TableHeader>
        <TableColumn>PRODUCT</TableColumn>
        <TableColumn>SHOP</TableColumn>
        <TableColumn>SOLD COUNT</TableColumn>
        <TableColumn>PRICE</TableColumn>
      </TableHeader>
      <TableBody emptyContent="No data">
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
    <Table aria-label="Top shops" removeWrapper>
      <TableHeader>
        <TableColumn>SHOP NAME</TableColumn>
        <TableColumn>TOTAL SOLD</TableColumn>
        <TableColumn>EST. REVENUE</TableColumn>
      </TableHeader>
      <TableBody emptyContent="No data">
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