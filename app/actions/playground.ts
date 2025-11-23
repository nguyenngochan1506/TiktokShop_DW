"use server";

import { prisma } from "@/lib/prisma";
import { serializeData } from "@/lib/utils";

export async function executeRawQuery(query: string) {
    const forbiddenKeywords = ["INSERT", "UPDATE", "DELETE", "DROP", "ALTER", "TRUNCATE", "GRANT", "REVOKE"];
    const upperQuery = query.trim().toUpperCase();

    if (!upperQuery.startsWith("SELECT") && !upperQuery.startsWith("WITH")) {
        const hasForbidden = forbiddenKeywords.some(keyword => upperQuery.includes(keyword));
        if (hasForbidden) {
            return { error: "Security Alert: Only SELECT queries are allowed in Playground mode." };
        }
    }

    try {
        const result: any[] = await prisma.$queryRawUnsafe(query);

        return { success: true, data: serializeData(result) };
    } catch (error: any) {
        return { error: error.message || "Query execution failed" };
    }
}

export async function getDatabaseMetadata() {
  try {
    const rawData: any[] = await prisma.$queryRaw`
      SELECT 
        table_schema, 
        table_name, 
        column_name, 
        data_type 
      FROM information_schema.columns 
      WHERE table_schema IN ('staging', 'warehouse', 'controller')
      ORDER BY table_schema, table_name, ordinal_position;
    `;

    type ColumnInfo = { name: string; type: string };
    
    const schemaTree: Record<string, Record<string, ColumnInfo[]>> = {};

    rawData.forEach((row) => {
      const schema = row.table_schema;
      const table = row.table_name;
      
      if (!schemaTree[schema]) {
        schemaTree[schema] = {};
      }
      if (!schemaTree[schema][table]) {
        schemaTree[schema][table] = [];
      }
      
      schemaTree[schema][table].push({
        name: row.column_name,
        type: row.data_type
      });
    });

    return { success: true, data: schemaTree };
  } catch (error: any) {
    console.error("Metadata fetch error:", error);
    return { error: "Failed to fetch database metadata" };
  }
}