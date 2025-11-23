"use server";

import { prisma } from "@/lib/prisma";

export async function getDatabaseHealth() {
  try {
    // 1. Lấy size của từng bảng (Top 10 bảng nặng nhất)
    const tableStats: any[] = await prisma.$queryRaw`
      SELECT
        relname as table_name,
        n_live_tup as row_count,
        pg_size_pretty(pg_total_relation_size(relid)) as total_size,
        pg_total_relation_size(relid) as total_bytes
      FROM pg_stat_user_tables
      ORDER BY pg_total_relation_size(relid) DESC
      LIMIT 10;
    `;

    // 2. Lấy tổng size Database
    const dbSize: any[] = await prisma.$queryRaw`
      SELECT pg_size_pretty(pg_database_size(current_database())) as size;
    `;

    // 3. Lấy thông tin Cache Hit Ratio (Hiệu suất DB)
    // Nếu > 99% là tốt, thấp hơn nghĩa là thiếu RAM hoặc Index kém
    const cacheHit: any[] = await prisma.$queryRaw`
      SELECT 
        sum(heap_blks_hit) / (sum(heap_blks_hit) + sum(heap_blks_read)) * 100 as ratio
      FROM pg_statio_user_tables;
    `;

    // 4. Kiểm tra Index Usage (Bảng nào đang bị quét full table scan nhiều)
    const indexUsage: any[] = await prisma.$queryRaw`
      SELECT 
        relname as table_name,
        seq_scan as full_scans,
        idx_scan as index_scans
      FROM pg_stat_user_tables
      WHERE seq_scan > 1000
      ORDER BY seq_scan DESC
      LIMIT 5;
    `;

    return {
      tableStats: tableStats.map(t => ({...t, row_count: Number(t.row_count), total_bytes: Number(t.total_bytes)})),
      dbSize: dbSize[0]?.size || "Unknown",
      cacheHitRatio: Number(cacheHit[0]?.ratio || 0),
      indexUsage: indexUsage.map(t => ({...t, full_scans: Number(t.full_scans), index_scans: Number(t.index_scans)}))
    };
  } catch (error) {
    console.error("DB Health Check Error:", error);
    return null;
  }
}