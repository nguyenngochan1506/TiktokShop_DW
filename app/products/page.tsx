"use client";


import {Table, TableHeader, TableColumn, TableBody, TableRow, TableCell} from '@heroui/table';
// Mock mapping DB fields
const products = [
  { id: "1", product_id: "SP001", title: "iPhone 15 Pro Max", price_sale: 29990000, sold_count: 120, seller_id: "SHOP_APPLE" },
  { id: "2", product_id: "SP002", title: "Samsung S24 Ultra", price_sale: 25000000, sold_count: 50, seller_id: "SHOP_SAMSUNG" },
];

export default function ProductsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Base Products</h1>
      <Table aria-label="Products table">
        <TableHeader>
          <TableColumn>PRODUCT ID</TableColumn>
          <TableColumn>TITLE</TableColumn>
          <TableColumn>PRICE</TableColumn>
          <TableColumn>SOLD</TableColumn>
          <TableColumn>SELLER</TableColumn>
        </TableHeader>
        <TableBody>
          {products.map((p) => (
            <TableRow key={p.id}>
              <TableCell>{p.product_id}</TableCell>
              <TableCell className="max-w-xs truncate">{p.title}</TableCell>
              <TableCell>
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.price_sale)}
              </TableCell>
              <TableCell>{p.sold_count}</TableCell>
              <TableCell>{p.seller_id}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}