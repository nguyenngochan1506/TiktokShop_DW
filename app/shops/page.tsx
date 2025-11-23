import { prisma } from "@/lib/prisma";
import { ShopsTable } from "@/components/shops-table";
import SearchInput from "@/components/search-input"; // Tái sử dụng component search cũ
import { serializeData } from "@/lib/utils";

const ITEMS_PER_PAGE = 10;

export default async function ShopsPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string; page?: string }>;
}) {
  const params = await searchParams;
  const query = params?.query || "";
  const page = Number(params?.page) || 1;
  const skip = (page - 1) * ITEMS_PER_PAGE;

  // Điều kiện lọc
  const whereCondition = query
    ? {
        OR: [
          { shop_name: { contains: query, mode: "insensitive" as const } },
          { seller_id: { contains: query, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [shops, totalCount] = await prisma.$transaction([
    prisma.tbl_base_shop_info.findMany({
      where: whereCondition,
      skip,
      take: ITEMS_PER_PAGE,
      orderBy: { followers_count: "desc" }, // Sắp xếp mặc định theo follower
    }),
    prisma.tbl_base_shop_info.count({ where: whereCondition }),
  ]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const serializedShops = serializeData(shops);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Danh Mục Cửa Hàng</h1>
        <SearchInput placeholder="Tìm kiếm tên cửa hàng..." />
      </div>
      <ShopsTable shops={serializedShops} totalPages={totalPages} />
    </div>
  );
}