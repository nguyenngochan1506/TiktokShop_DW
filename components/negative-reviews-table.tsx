"use client";

import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { User } from "@heroui/user";
import { Chip } from "@heroui/chip";
import { StarIcon } from "lucide-react";

export const NegativeReviewsTable = ({ reviews }: { reviews: any[] }) => {
  return (
    <Table aria-label="Negative reviews" removeWrapper>
      <TableHeader>
        <TableColumn>PRODUCT</TableColumn>
        <TableColumn>RATING</TableColumn>
        <TableColumn>COMMENT</TableColumn>
        <TableColumn>DATE</TableColumn>
      </TableHeader>
      <TableBody emptyContent="No negative reviews found">
        {reviews.map((review, idx) => (
          <TableRow key={idx}>
            <TableCell>
              <div className="flex flex-col">
                <span className="text-small font-bold truncate w-[200px]" title={review.dim_sku?.dim_product?.title}>
                    {review.dim_sku?.dim_product?.title || "Unknown Product"}
                </span>
                <span className="text-tiny text-default-400">{review.dim_shop?.shop_name}</span>
              </div>
            </TableCell>
            <TableCell>
                <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                        <StarIcon 
                            key={i} 
                            size={12} 
                            className={i < review.rating ? "text-danger fill-danger" : "text-default-200"} 
                        />
                    ))}
                </div>
            </TableCell>
            <TableCell>
                <div className="max-w-[300px] text-small italic text-default-500 truncate">
                    "{review.review_id}" (Content placeholder)
                </div>
            </TableCell>
            <TableCell>
                {review.review_timestamp ? new Date(review.review_timestamp).toLocaleDateString('vi-VN') : 'N/A'}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};