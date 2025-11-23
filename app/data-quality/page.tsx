import { prisma } from "@/lib/prisma";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Progress } from "@heroui/progress";
import { CheckCircleIcon, XCircleIcon, ClockIcon, ActivityIcon } from "lucide-react";
import { DataQualityTable } from "@/components/data-quality-table";
import { getConfig } from "../actions/settings";

// Định nghĩa kiểu dữ liệu cho Check Result
interface DqCheckResult {
    scope: "Staging" | "Warehouse" | "System";
    table: string;
    rule: string;
    description: string;
    failed_count: number;
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
}

async function runDataQualityChecks() {
    // Sử dụng Promise.all để chạy song song các truy vấn, giảm thời gian chờ
    const [
        missingTitles,
        invalidPrices,
        negativeStock,
        missingRatings,
        shopsNoRegion,
        priceAnomalyRaw,
        latestRawData,
        penaltyWeight,
        criticalWeight,
        staleHoursLimit
    ] = await Promise.all([
        // 1. Check Missing Titles
        prisma.tbl_base_products.count({ where: { title: null } }),

        // 2. Check Invalid Price (<= 0)
        prisma.tbl_base_products.count({ where: { price_sale: { lte: 0 } } }),

        // 3. Check Negative Stock
        prisma.fact_inventory_snapshot.count({ where: { stock: { lt: 0 } } }),

        // 4. Check Missing Ratings
        prisma.fact_reviews.count({ where: { rating: null } }),

        // 5. Check Shops missing region info
        prisma.tbl_base_shop_info.count({ where: { region: null } }),

        // 6. Check Logic: Sale Price > Original Price (Bất thường)
        prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*) as count 
      FROM "staging"."tbl_base_products" 
      WHERE price_original IS NOT NULL 
      AND price_sale > price_original
    `,

        // 7. Check Data Freshness (Lần cuối crawl)
        prisma.tbl_products_raw.findFirst({
            orderBy: { load_timestamp: 'desc' },
            select: { load_timestamp: true }
        }),
        getConfig("DQ_PENALTY_WEIGHT", 0.5),
        getConfig("DQ_CRITICAL_WEIGHT", 2.0),
        getConfig("DQ_STALE_HOURS", 24)
    ]);

    const checks: DqCheckResult[] = [];

    // --- MAPPING RESULTS ---

    // Rule 1
    checks.push({
        scope: "Staging",
        table: "tbl_base_products",
        rule: "Completeness: Missing Titles",
        description: "Sản phẩm bị thiếu tên (title là NULL)",
        failed_count: missingTitles,
        severity: "HIGH"
    });

    // Rule 2
    checks.push({
        scope: "Staging",
        table: "tbl_base_products",
        rule: "Validity: Invalid Price",
        description: "Sản phẩm có giá bán (price_sale) <= 0",
        failed_count: invalidPrices,
        severity: "CRITICAL"
    });

    // Rule 3
    checks.push({
        scope: "Warehouse",
        table: "fact_inventory_snapshot",
        rule: "Consistency: Negative Stock",
        description: "Bản ghi tồn kho có số lượng stock < 0",
        failed_count: negativeStock,
        severity: "MEDIUM"
    });

    // Rule 4
    checks.push({
        scope: "Warehouse",
        table: "fact_reviews",
        rule: "Completeness: Missing Rating",
        description: "Đánh giá bị thiếu điểm số (rating là NULL)",
        failed_count: missingRatings,
        severity: "LOW"
    });

    // Rule 5
    checks.push({
        scope: "Staging",
        table: "tbl_base_shop_info",
        rule: "Completeness: Unknown Region",
        description: "Cửa hàng bị thiếu thông tin khu vực (region là NULL)",
        failed_count: shopsNoRegion,
        severity: "LOW"
    });

    // Rule 6 (Raw query returns BigInt, convert to Number)
    const priceAnomalyCount = Number(priceAnomalyRaw[0]?.count || 0);
    checks.push({
        scope: "Staging",
        table: "tbl_base_products",
        rule: "Logic: Sale > Original Price",
        description: "Giá bán khuyến mãi (price_sale) cao hơn giá gốc (original price)",
        failed_count: priceAnomalyCount,
        severity: "HIGH"
    });

    // Rule 7: Data Freshness (Kiểm tra nếu dữ liệu cũ hơn 24h)
    let isStale = false;
    let hoursDiff = 0;
    if (latestRawData?.load_timestamp) {
        const now = new Date();
        const lastLoad = new Date(latestRawData.load_timestamp);
        hoursDiff = Math.abs(now.getTime() - lastLoad.getTime()) / 36e5;

        if (hoursDiff > Number(staleHoursLimit)) isStale = true;
    }


    checks.push({
        scope: "System",
        table: "Pipeline",
        rule: "Timeliness: Stale Data",
        description: `Không có dữ liệu mới được nạp trong ${staleHoursLimit} giờ qua (Độ trễ: ${hoursDiff.toFixed(1)}h)`,
        failed_count: isStale ? 1 : 0, // 1 nghĩa là Fail
        severity: "MEDIUM"
    });

    // --- SCORING LOGIC ---
    const totalIssues = checks.reduce((acc, curr) => acc + curr.failed_count, 0);

    let penalty = 0;
    checks.forEach(c => {
        if (c.failed_count > 0) {
            // Dùng biến criticalWeight
            const weight = c.severity === "CRITICAL" ? Number(criticalWeight) : c.severity === "HIGH" ? 2 : 1;

            // Dùng biến penaltyWeight
            penalty += Math.log10(c.failed_count + 1) * weight * Number(penaltyWeight);
        }
    });

    const healthScore = Math.max(0, Math.min(100, 100 - penalty));

    const lastCheckTime = new Date().toLocaleString('vi-VN');

    return { checks, healthScore, totalIssues, lastCheckTime };
}

export default async function DataQualityPage() {
    const { checks, healthScore, totalIssues, lastCheckTime } = await runDataQualityChecks();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    Kiểm Tra Chất Lượng Dữ Liệu (Data Quality Health Check)
                </h1>
                <div className="flex items-center gap-2 text-default-500 text-sm bg-default-100 px-3 py-1 rounded-full">
                    <ActivityIcon size={14} />
                    <span>Lần Quét Cuối: <strong>{lastCheckTime}</strong></span>
                </div>
            </div>

            {/* Grid Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Health Score Card */}
                <Card className="md:col-span-2">
                    <CardHeader className="pb-0">
                        <h3 className="font-semibold text-lg">Điểm Số Sức Khỏe Dữ Liệu Tổng Thể</h3>
                    </CardHeader>
                    <CardBody className="gap-4">
                        <div className="flex items-center gap-4">
                            <span className={`text-4xl font-bold ${healthScore >= 80 ? 'text-success' : healthScore >= 50 ? 'text-warning' : 'text-danger'}`}>
                                {healthScore.toFixed(1)}%
                            </span>
                            <div className="flex-1">
                                <Progress
                                    aria-label="Điểm Sức Khỏe"
                                    value={healthScore}
                                    color={healthScore >= 80 ? "success" : healthScore >= 50 ? "warning" : "danger"}
                                    className="max-w-full"
                                    size="md"
                                    showValueLabel={true}
                                />
                            </div>
                        </div>
                        <p className="text-default-500 text-sm">
                            Đã phát hiện <strong>{new Intl.NumberFormat('vi-VN').format(totalIssues)}</strong> lỗi bất thường trên {checks.length} quy tắc kiểm tra.
                        </p>
                    </CardBody>
                </Card>

                {/* Quick Stats Card */}
                <Card>
                    <CardBody className="flex flex-col justify-center gap-4 h-full">
                        <div className="flex items-center justify-between p-2 bg-success-50 rounded-lg">
                            <div className="flex items-center gap-2">
                                <CheckCircleIcon size={18} className="text-success" />
                                <span className="text-sm font-medium">Đạt</span>
                            </div>
                            <span className="font-bold text-success text-lg">{checks.filter(c => c.failed_count === 0).length}</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-danger-50 rounded-lg">
                            <div className="flex items-center gap-2">
                                <XCircleIcon size={18} className="text-danger" />
                                <span className="text-sm font-medium">Lỗi</span>
                            </div>
                            <span className="font-bold text-danger text-lg">{checks.filter(c => c.failed_count > 0).length}</span>
                        </div>
                        <div className="flex items-center gap-2 text-default-400 text-xs px-2">
                            <ClockIcon size={12} />
                            <span>Tự động làm mới sau mỗi 24h</span>
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Rules Detail Table (Client Component) */}
            <Card>
                <CardHeader>
                    <h3 className="font-semibold text-lg">Báo Cáo Kiểm Tra Chi Tiết</h3>
                </CardHeader>
                <CardBody className="p-0">
                    <DataQualityTable checks={checks} />
                </CardBody>
            </Card>
        </div>
    );
}