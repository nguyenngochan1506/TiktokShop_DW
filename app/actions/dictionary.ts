"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// 1. Lấy dữ liệu từ điển (Merge giữa Schema thực tế và Note đã lưu)
export async function getDictionaryData() {
  try {
    // A. Lấy Metadata kỹ thuật (Cột, Kiểu dữ liệu)
    const rawColumns: any[] = await prisma.$queryRaw`
      SELECT 
        table_schema, 
        table_name, 
        column_name, 
        data_type,
        ordinal_position
      FROM information_schema.columns 
      WHERE table_schema IN ('staging', 'warehouse')
      ORDER BY table_schema, table_name, ordinal_position;
    `;

    // B. Lấy Metadata nghiệp vụ (Ghi chú đã lưu)
    const savedNotes = await prisma.data_dictionary_notes.findMany();

    // C. Map ghi chú vào cột
    // Tạo Map để tra cứu cho nhanh: "schema.table.col" -> description
    const noteMap = new Map();
    savedNotes.forEach(note => {
      noteMap.set(`${note.schema_name}.${note.table_name}.${note.column_name}`, note.description);
    });

    const dictionaryTree: any = {};

    rawColumns.forEach((row) => {
      const { table_schema, table_name, column_name, data_type } = row;
      const key = `${table_schema}.${table_name}.${column_name}`;
      
      if (!dictionaryTree[table_schema]) dictionaryTree[table_schema] = {};
      if (!dictionaryTree[table_schema][table_name]) dictionaryTree[table_schema][table_name] = [];

      dictionaryTree[table_schema][table_name].push({
        name: column_name,
        type: data_type,
        description: noteMap.get(key) || ""
      });
    });

    return { success: true, data: dictionaryTree };

  } catch (error) {
    console.error("Dictionary fetch error:", error);
    return { error: "Failed to load dictionary" };
  }
}

export async function saveColumnNote(schema: string, table: string, col: string, desc: string) {
  try {
    await prisma.data_dictionary_notes.upsert({
      where: {
        schema_name_table_name_column_name: {
          schema_name: schema,
          table_name: table,
          column_name: col
        }
      },
      update: {
        description: desc,
        updated_at: new Date()
      },
      create: {
        schema_name: schema,
        table_name: table,
        column_name: col,
        description: desc
      }
    });
    
    revalidatePath("/dictionary");
    return { success: true };
  } catch (error) {
    console.error("Save note error:", error);
    return { error: "Failed to save note" };
  }
}