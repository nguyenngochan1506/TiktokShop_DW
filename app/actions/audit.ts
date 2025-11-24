"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function recordActivity(
  action: "CREATE" | "UPDATE" | "DELETE" | "LOGIN" | "TRIGGER" | "IMPORT" | "OTHER",
  entity: string,
  entity_id: string | null, 
  details: string,
  metadata?: any
) {
  try {
    const session = await auth();
    if (!session?.user) return;

    await prisma.system_audit_logs.create({
      data: {
        user_id: parseInt(session.user.id),
        user_email: session.user.email || "unknown",
        action,
        entity,
        entity_id: entity_id || "N/A",
        details,
        metadata: (metadata as any) ?? undefined 
      }
    });
  } catch (error) {
    console.error("Audit Log Error:", error);
  }
}

export async function getAuditLogs(
  page: number = 1,
  limit: number = 20,
  userId?: string // ID của user cần lọc (nếu có)
) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return { data: [], total: 0 };

  const skip = (page - 1) * limit;

  const whereCondition: Prisma.system_audit_logsWhereInput = userId 
    ? { user_id: parseInt(userId) } 
    : {};

  try {
    const [data, total] = await prisma.$transaction([
      prisma.system_audit_logs.findMany({
        where: whereCondition,
        skip,
        take: limit,
        orderBy: { created_at: "desc" },
        include: {
          user: { select: { name: true, email: true, role: true } }
        }
      }),
      prisma.system_audit_logs.count({ where: whereCondition })
    ]);

    return { data, total };
  } catch (error) {
    console.error("Get logs error:", error);
    return { data: [], total: 0 };
  }
}