"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getConfig } from "./settings";

export async function createSource(formData: FormData) {
  const source_name = "tiktok_shop"; 
  
  const base_url = formData.get("base_url") as string;
  const is_active = formData.get("is_active") !== null; 

  if (!base_url) {
    return { error: "URL is required" };
  }

  try {
    await prisma.source_config.create({
      data: {
        source_name, 
        base_url,
        is_active,
        last_crawl_status: "PENDING",
      },
    });

    revalidatePath("/sources");
    
    return { success: true };
  } catch (error) {
    console.error("Create source error:", error);
    return { error: "Failed to create source. URL might be duplicate." };
  }
}
export async function deleteSource(id: number) {
  try {
    await prisma.source_config.delete({
      where: { id },
    });
    revalidatePath("/sources");
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete source" };
  }
}

export async function updateSource(id: number, formData: FormData) {
  const source_name = formData.get("source_name") as string;
  const base_url = formData.get("base_url") as string;
  const is_active = formData.get("is_active") !== null;

  if (!source_name || !base_url) {
    return { error: "Name and URL are required" };
  }

  try {
    await prisma.source_config.update({
      where: { id },
      data: {
        source_name,
        base_url,
        is_active,
      },
    });

    revalidatePath("/sources");
    return { success: true };
  } catch (error) {
    console.error("Update source error:", error);
    return { error: "Failed to update source." };
  }
}
export async function triggerCrawl(sourceId: number) {
  try {
    const source = await prisma.source_config.findUnique({
      where: { id: sourceId }
    });

    if (source?.last_crawl_status === "PENDING" || source?.last_crawl_status === "PROCESSING") {
      const stuckThreshold = await getConfig("JOB_STUCK_THRESHOLD_MINUTES", 60);
      
      const lastUpdate = new Date(source.updated_at || source.last_crawl_timestamp || new Date());
      const now = new Date();
      const diffMinutes = (now.getTime() - lastUpdate.getTime()) / 60000;

      if (diffMinutes < stuckThreshold) {
        return { error: `Job is currently running (started ${Math.round(diffMinutes)} mins ago). Please wait or adjust JOB_STUCK_THRESHOLD.` };
      }
      
      // Nếu > threshold, coi như job cũ bị chết, cho phép chạy đè job mới
      console.log(`Job ${sourceId} seems stuck (${diffMinutes} mins). Forcing new trigger.`);
    }

    await prisma.source_config.update({
      where: { id: sourceId },
      data: {
        last_crawl_status: "PENDING",
        is_active: true,
        updated_at: new Date(), 
      },
    });


    revalidatePath("/sources");
    return { success: true };
  } catch (error) {
    console.error("Trigger crawl error:", error);
    return { error: "Failed to trigger crawl." };
  }
}

export async function importBulkSources(urls: string[]) {
  if (!urls || urls.length === 0) return { success: true, count: 0 };

  try {
    const cleanUrls = urls
      .map(u => u.trim())
      .filter(u => u.length > 0);

    if (cleanUrls.length === 0) return { success: true, count: 0 };

    const result = await prisma.source_config.createMany({
      data: cleanUrls.map(url => ({
        source_name: "tiktok_shop", // Mặc định như yêu cầu
        base_url: url,
        is_active: true,
        last_crawl_status: "PENDING"
      })),
      skipDuplicates: true,
    });

    revalidatePath("/sources");
    return { success: true, count: result.count, skipped: cleanUrls.length - result.count };
  } catch (error) {
    console.error("Bulk import error:", error);
    return { error: "Lỗi khi nhập dữ liệu." };
  }
}