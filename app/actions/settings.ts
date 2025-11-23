"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Định nghĩa các cài đặt mặc định của hệ thống
const DEFAULT_SETTINGS = [
  { key: "DQ_PENALTY_WEIGHT", value: "0.5", type: "number", group: "DATA_QUALITY", description: "Điểm trừ cho mỗi lỗi (Severity Low/Medium)" },
  { key: "DQ_CRITICAL_WEIGHT", value: "2.0", type: "number", group: "DATA_QUALITY", description: "Hệ số nhân điểm trừ cho lỗi nghiêm trọng (Critical)" },
  { key: "DQ_STALE_HOURS", value: "24", type: "number", group: "DATA_QUALITY", description: "Số giờ tối đa chấp nhận dữ liệu cũ trước khi báo lỗi Stale Data" },
  { key: "DASHBOARD_DAYS_LOOKBACK", value: "7", type: "number", group: "GENERAL", description: "Số ngày mặc định hiển thị trên biểu đồ Dashboard" },
  { 
    key: "JOB_STUCK_THRESHOLD_MINUTES", 
    value: "60", 
    type: "number", 
    group: "CRAWLER", 
    description: "Nếu Job chạy quá số phút này mà chưa xong, coi như bị treo (Stuck) để cho phép chạy lại." 
  },
  { key: "MAINTENANCE_MODE", value: "false", type: "boolean", group: "GENERAL", description: "Bật chế độ bảo trì hệ thống" },
];

// 1. Lấy tất cả settings (Kèm logic tự động Seed nếu chưa có)
export async function getAllSettings() {
  try {
    let settings = await prisma.system_settings.findMany({
      orderBy: [{ group: 'asc' }, { key: 'asc' }]
    });

    // Nếu DB chưa có gì, tự động thêm Default vào
    if (settings.length === 0) {
      console.log("Seeding default settings...");
      await prisma.system_settings.createMany({
        data: DEFAULT_SETTINGS,
        skipDuplicates: true
      });
      settings = await prisma.system_settings.findMany({
        orderBy: [{ group: 'asc' }, { key: 'asc' }]
      });
    }

    return { success: true, data: settings };
  } catch (error) {
    console.error("Fetch settings error:", error);
    return { error: "Failed to fetch settings" };
  }
}

// 2. Cập nhật Setting
export async function updateSetting(key: string, value: string) {
  try {
    await prisma.system_settings.update({
      where: { key },
      data: { 
        value, 
        updated_at: new Date() 
      }
    });
    revalidatePath("/settings");
    revalidatePath("/data-quality"); // Refresh các trang có dùng config
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { error: "Failed to update setting" };
  }
}

// 3. Helper lấy config dùng trong code (Server-side only)
export async function getConfig<T>(key: string, defaultValue: T): Promise<T> {
  const setting = await prisma.system_settings.findUnique({
    where: { key }
  });

  if (!setting) return defaultValue;

  if (setting.type === 'number') return Number(setting.value) as T;
  if (setting.type === 'boolean') return (setting.value === 'true') as T;
  
  return setting.value as T;
}