"use client";

import { useState, useEffect } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { ScrollShadow } from "@heroui/scroll-shadow";
import { SearchIcon, SaveIcon, Edit3Icon, TableIcon, DatabaseIcon, BookOpenIcon } from "lucide-react";
import { Accordion, AccordionItem } from "@heroui/accordion";
import { Chip } from "@heroui/chip";
import { saveColumnNote } from "@/app/actions/dictionary";

interface ColumnDef {
  name: string;
  type: string;
  description: string;
}

export default function DictionaryEditor({ initialData }: { initialData: any }) {
  const [selectedSchema, setSelectedSchema] = useState<string>("");
  const [selectedTable, setSelectedTable] = useState<string>("");
  const [columns, setColumns] = useState<ColumnDef[]>([]);
  
  // State quản lý việc Edit: { "colName": "nội dung đang gõ" }
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [tempDesc, setTempDesc] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Chọn mặc định bảng đầu tiên khi load
  useEffect(() => {
    if (initialData) {
      const firstSchema = Object.keys(initialData)[0];
      if (firstSchema) {
        const firstTable = Object.keys(initialData[firstSchema])[0];
        handleSelectTable(firstSchema, firstTable);
      }
    }
  }, [initialData]);

  const handleSelectTable = (schema: string, table: string) => {
    setSelectedSchema(schema);
    setSelectedTable(table);
    setColumns(initialData[schema][table]);
    setEditingCell(null); // Reset edit mode
  };

  const startEdit = (colName: string, currentDesc: string) => {
    setEditingCell(colName);
    setTempDesc(currentDesc);
  };

  const saveEdit = async (colName: string) => {
    setIsSaving(true);
    const result = await saveColumnNote(selectedSchema, selectedTable, colName, tempDesc);
    
    if (result.success) {
      // Update UI state local để không cần reload trang
      const newCols = columns.map(c => c.name === colName ? { ...c, description: tempDesc } : c);
      setColumns(newCols);
      
      // Cập nhật lại cả initialData (để khi chuyển tab không bị mất)
      initialData[selectedSchema][selectedTable] = newCols;
      
      setEditingCell(null);
    } else {
      alert("Failed to save note");
    }
    setIsSaving(false);
  };

  return (
    <div className="flex h-[calc(100vh-100px)] gap-4">
      
      {/* SIDEBAR: Table List */}
      <Card className="w-80 flex-none h-full flex flex-col">
        <CardHeader className="pb-0 pt-4 px-4 flex-col items-start">
            <h4 className="font-bold text-large flex items-center gap-2">
                <BookOpenIcon size={20}/> Dictionary
            </h4>
            <p className="text-tiny text-default-500">Select a table to document</p>
        </CardHeader>
        <CardBody className="p-2">
            <ScrollShadow className="h-full">
                <Accordion selectionMode="multiple" isCompact itemClasses={{ title: "font-bold text-sm text-primary" }}>
                    {Object.keys(initialData).map((schema) => (
                        <AccordionItem key={schema} title={schema} startContent={<DatabaseIcon size={14}/>}>
                            <div className="flex flex-col gap-1 pl-2">
                                {Object.keys(initialData[schema]).map(table => (
                                    <Button
                                        key={table}
                                        variant={selectedTable === table && selectedSchema === schema ? "flat" : "light"}
                                        color="primary"
                                        className="justify-start h-8 text-sm"
                                        startContent={<TableIcon size={14} className="opacity-50"/>}
                                        onPress={() => handleSelectTable(schema, table)}
                                    >
                                        {table}
                                    </Button>
                                ))}
                            </div>
                        </AccordionItem>
                    ))}
                </Accordion>
            </ScrollShadow>
        </CardBody>
      </Card>

      {/* MAIN: Column Editor */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">
         <Card className="flex-1 h-full">
            <CardHeader className="flex justify-between items-center bg-default-50 border-b border-default-100 py-3">
                <div className="flex flex-col">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        {selectedTable}
                        <Chip size="sm" variant="flat" color="secondary">{selectedSchema}</Chip>
                    </h2>
                    <p className="text-small text-default-500">
                        {columns.length} columns available
                    </p>
                </div>
            </CardHeader>
            <CardBody className="p-0 overflow-hidden">
                <Table 
                    aria-label="Dictionary Table" 
                    removeWrapper 
                    isHeaderSticky
                    classNames={{ base: "h-full overflow-auto", table: "min-h-[300px]" }}
                >
                    <TableHeader>
                        <TableColumn width={200}>COLUMN NAME</TableColumn>
                        <TableColumn width={150}>DATA TYPE</TableColumn>
                        <TableColumn>BUSINESS DESCRIPTION (Click to Edit)</TableColumn>
                    </TableHeader>
                    <TableBody items={columns}>
                        {(item) => (
                            <TableRow key={item.name}>
                                <TableCell className="font-bold font-mono">{item.name}</TableCell>
                                <TableCell className="text-default-500 text-xs font-mono">{item.type}</TableCell>
                                <TableCell>
                                    {editingCell === item.name ? (
                                        <div className="flex gap-2 items-center">
                                            <Input
                                                autoFocus
                                                size="sm"
                                                value={tempDesc}
                                                onChange={(e) => setTempDesc(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') saveEdit(item.name);
                                                    if (e.key === 'Escape') setEditingCell(null);
                                                }}
                                                placeholder="Enter business meaning..."
                                                className="w-full"
                                            />
                                            <Button isIconOnly size="sm" color="success" variant="flat" onPress={() => saveEdit(item.name)} isLoading={isSaving}>
                                                <SaveIcon size={16}/>
                                            </Button>
                                        </div>
                                    ) : (
                                        <div 
                                            className="group flex justify-between items-center p-2 -ml-2 rounded-lg hover:bg-default-100 cursor-pointer transition-colors border border-transparent hover:border-default-200 min-h-[40px]"
                                            onClick={() => startEdit(item.name, item.description)}
                                        >
                                            <span className={item.description ? "text-default-700" : "text-default-300 italic"}>
                                                {item.description || "No description provided."}
                                            </span>
                                            <Edit3Icon size={14} className="opacity-0 group-hover:opacity-50 text-primary" />
                                        </div>
                                    )}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardBody>
         </Card>
      </div>
    </div>
  );
}