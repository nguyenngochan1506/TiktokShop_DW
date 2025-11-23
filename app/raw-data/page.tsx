import { prisma } from "@/lib/prisma";
import { RawDataTable } from "@/components/raw-data-table";
import { serializeData } from "@/lib/utils";

const ITEMS_PER_PAGE = 10;

export default async function RawDataPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const page = Number(params?.page) || 1;
  const skip = (page - 1) * ITEMS_PER_PAGE;

  const [products, totalCount] = await prisma.$transaction([
    prisma.tbl_products_raw.findMany({
      skip,
      take: ITEMS_PER_PAGE,
      orderBy: { id: 'desc' },
      select: {
        id: true,
        product_id: true,
        source_file_name: true,
        load_timestamp: true,
        raw_data: true,
      }
    }),
    prisma.tbl_products_raw.count()
  ]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  
  const serializedProducts = serializeData(products);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dữ Liệu Sản Phẩm Thô (Raw Data)</h1>
        <div className="text-small text-default-500">
            Tổng cộng: {new Intl.NumberFormat('vi-VN').format(totalCount)} bản ghi
        </div>
      </div>
      <RawDataTable data={serializedProducts} totalPages={totalPages} />
    </div>
  );
}