import { prisma } from "@/lib/prisma";
import { BaseProductsTable } from "@/components/base-products-table";
import SearchInput from "@/components/search-input";
import { serializeData } from "@/lib/utils";

const ITEMS_PER_PAGE = 10;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string; page?: string }>;
}) {
  const params = await searchParams;
  const query = params?.query || "";
  const page = Number(params?.page) || 1;
  const skip = (page - 1) * ITEMS_PER_PAGE;

  const whereCondition = query
    ? {
        OR: [
          { title: { contains: query, mode: "insensitive" as const } },
          { product_id: { contains: query, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [products, totalCount] = await prisma.$transaction([
    prisma.tbl_base_products.findMany({
      where: whereCondition,
      skip,
      take: ITEMS_PER_PAGE,
      orderBy: { load_timestamp: "desc" },
    }),
    prisma.tbl_base_products.count({ where: whereCondition }),
  ]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const serializedProducts = serializeData(products);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Cleaned Products (Staging)</h1>
        <SearchInput placeholder="Search by name or ID..." />
      </div>
      <BaseProductsTable products={serializedProducts} totalPages={totalPages} />
    </div>
  );
}