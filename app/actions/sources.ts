"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createSource(formData: FormData) {
  const source_name = formData.get("source_name") as string;
  const base_url = formData.get("base_url") as string;
  const is_active = formData.get("is_active") !== null; 

  if (!source_name || !base_url) {
    return { error: "Name and URL are required" };
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
    await prisma.source_config.update({
      where: { id: sourceId },
      data: {
        is_active: true,    
        last_crawl_status: null, 
        updated_at: new Date(), 
      },
    });

    revalidatePath("/sources");
    return { success: true };
  } catch (error) {
    console.error("Trigger crawl error:", error);
    return { error: "Failed to reset source status for crawling." };
  }
}