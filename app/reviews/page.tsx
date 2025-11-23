import { prisma } from "@/lib/prisma";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { serializeData } from "@/lib/utils";
import { MessageSquareWarningIcon } from "lucide-react";
import { RatingPieChart } from "@/components/rating-pie-chart";
import { NegativeReviewsTable } from "@/components/negative-reviews-table";

async function getReviewData() {
  // 1. Lấy phân bố rating (GROUP BY rating)
  const ratingDistributionRaw: any[] = await prisma.$queryRaw`
    SELECT 
      rating, 
      COUNT(*)::int as count 
    FROM "warehouse"."fact_reviews"
    WHERE rating IS NOT NULL
    GROUP BY rating
    ORDER BY rating ASC
  `;

  // Map lại dữ liệu cho biểu đồ (đảm bảo đủ 1-5 sao)
  const ratingMap = new Map(ratingDistributionRaw.map(r => [r.rating, r.count]));
  const chartData = [1, 2, 3, 4, 5].map(star => ({
    rating: `${star} Stars`,
    count: ratingMap.get(star) || 0
  }));

  // 2. Lấy 10 đánh giá tiêu cực gần nhất (1-2 sao)
  const negativeReviews = await prisma.fact_reviews.findMany({
    where: {
      rating: { lte: 2 } // Nhỏ hơn hoặc bằng 2 sao
    },
    take: 10,
    orderBy: { review_timestamp: 'desc' },
    include: {
      dim_shop: { select: { shop_name: true } },
      dim_sku: {
        include: {
            dim_product: { select: { title: true } }
        }
      }
    }
  });

  return {
    chartData,
    negativeReviews: serializeData(negativeReviews)
  };
}

export default async function ReviewsPage() {
  const data = await getReviewData();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Customer Voice & Reviews</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cột trái: Biểu đồ */}
        <div className="lg:col-span-1">
             <RatingPieChart data={data.chartData} />
        </div>

        {/* Cột phải: Danh sách cảnh báo */}
        <div className="lg:col-span-2">
            <Card className="h-full min-h-[350px]">
                <CardHeader className="flex gap-3">
                    <MessageSquareWarningIcon className="text-danger" />
                    <div className="flex flex-col">
                        <p className="text-md font-bold">Recent Negative Reviews</p>
                        <p className="text-small text-default-500">Alerts for 1-2 star ratings</p>
                    </div>
                </CardHeader>
                <CardBody>
                    <NegativeReviewsTable reviews={data.negativeReviews} />
                </CardBody>
            </Card>
        </div>
      </div>
    </div>
  );
}