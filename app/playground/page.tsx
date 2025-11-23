"use client";

import { useEffect, useRef, useState } from "react";
import Editor, { Monaco } from "@monaco-editor/react";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { PlayIcon, EraserIcon, AlertTriangleIcon, DatabaseIcon, HistoryIcon, Trash2Icon, ClockIcon, TypeIcon, HashIcon, CalendarIcon, TableIcon } from "lucide-react";
import { executeRawQuery, getDatabaseMetadata } from "@/app/actions/playground";
import { Spinner } from "@heroui/spinner";
import { Tab, Tabs } from '@heroui/tabs'
import { ScrollShadow } from "@heroui/scroll-shadow";
import { Accordion, AccordionItem } from "@heroui/accordion";
import { Chip } from "@heroui/chip";

const SQL_KEYWORDS = [
    "SELECT", "FROM", "WHERE", "GROUP BY", "ORDER BY", "LIMIT", "JOIN", "LEFT JOIN",
    "INNER JOIN", "ON", "AND", "OR", "NOT", "NULL", "IN", "BETWEEN", "LIKE", "AS",
    "COUNT", "SUM", "AVG", "MAX", "MIN", "DISTINCT", "INSERT", "UPDATE", "DELETE", "WITH"
];

interface HistoryItem {
    query: string;
    timestamp: number;
    status: "success" | "error";
}

interface ColumnInfo {
    name: string;
    type: string;
}
interface SchemaStructure {
    [schema: string]: {
        [table: string]: ColumnInfo[];
    };
}

const getDataTypeIcon = (type: string) => {
    if (type.includes('int') || type.includes('numeric') || type.includes('double')) return <HashIcon size={12} className="text-blue-400" />;
    if (type.includes('char') || type.includes('text')) return <TypeIcon size={12} className="text-orange-400" />;
    if (type.includes('date') || type.includes('time')) return <CalendarIcon size={12} className="text-green-400" />;
    return <DatabaseIcon size={12} className="text-default-400" />;
}

export default function SqlPlaygroundPage() {
    const [query, setQuery] = useState("SELECT * FROM \"warehouse\".\"dim_product\" LIMIT 10;");
    const [result, setResult] = useState<any[]>([]);
    const [columns, setColumns] = useState<string[]>([]);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [schemaData, setSchemaData] = useState<SchemaStructure>({})
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const monacoRef = useRef<Monaco | null>(null);
    const editorRef = useRef<any>(null);
    const schemaDataRef = useRef<SchemaStructure>({});

    useEffect(() => {
        // Load Schema
        getDatabaseMetadata().then((res) => {
            if (res.success && res.data) {
                const data = res.data as SchemaStructure;
                setSchemaData(data);
                schemaDataRef.current = data;
            }
        });

        const savedHistory = localStorage.getItem("sql_history");
        if (savedHistory) {
            try {
                setHistory(JSON.parse(savedHistory));
            } catch (e) { console.error("History parse error", e); }
        }
    }, []);

    const insertToEditor = (text: string) => {
        if (editorRef.current) {
            const editor = editorRef.current;
            const position = editor.getPosition();
            editor.executeEdits("", [{
                range: {
                    startLineNumber: position.lineNumber,
                    startColumn: position.column,
                    endLineNumber: position.lineNumber,
                    endColumn: position.column
                },
                text: text,
                forceMoveMarkers: true
            }]);
            editor.focus();
        }
    };

    const handleEditorDidMount = (editor: any, monaco: Monaco) => {
        monacoRef.current = monaco;

        // Đăng ký Provider gợi ý code
        monaco.languages.registerCompletionItemProvider("sql", {
            triggerCharacters: ['.', ' '],
            provideCompletionItems: (model, position) => {
                const word = model.getWordUntilPosition(position);
                const range = {
                    startLineNumber: position.lineNumber,
                    endLineNumber: position.lineNumber,
                    startColumn: word.startColumn,
                    endColumn: word.endColumn,
                };

                const suggestions: any[] = [];

                SQL_KEYWORDS.forEach(kw => {
                    suggestions.push({
                        label: kw,
                        kind: monaco.languages.CompletionItemKind.Keyword,
                        insertText: kw,
                        range: range,
                    });
                });

                const currentSchema = schemaDataRef.current; // Lấy dữ liệu mới nhất từ Ref

                Object.keys(currentSchema).forEach(schema => {
                    Object.keys(currentSchema[schema]).forEach(table => {
                        // Suggest Table (Schema.Table)
                        suggestions.push({
                            label: `${schema}.${table}`, // Gợi ý full
                            kind: monaco.languages.CompletionItemKind.Class,
                            insertText: `"${schema}"."${table}"`, // Tự động quote
                            detail: "Table",
                            range: range,
                        });

                        // Suggest Table (Short name)
                        suggestions.push({
                            label: table,
                            kind: monaco.languages.CompletionItemKind.Class,
                            insertText: table,
                            detail: `Table (${schema})`,
                            range: range,
                        });

                        // Suggest Columns
                        currentSchema[schema][table].forEach(col => {
                            suggestions.push({
                                label: col.name,
                                kind: monaco.languages.CompletionItemKind.Field,
                                insertText: col.name,
                                detail: `${col.type} (${table})`,
                                range: range,
                            });
                        });
                    });
                });

                return { suggestions: suggestions };
            }
        });
    };

    const handleRunQuery = async () => {
        setIsLoading(true);
        setError("");
        setResult([]);

        const res = await executeRawQuery(query);

        const newHistoryItem: HistoryItem = {
            query: query,
            timestamp: Date.now(),
            status: res.error ? "error" : "success"
        };

        const updatedHistory = [newHistoryItem, ...history].slice(0, 50);
        setHistory(updatedHistory);
        localStorage.setItem("sql_history", JSON.stringify(updatedHistory));

        if (res.error) {
            setError(res.error);
        } else if (res.data && Array.isArray(res.data)) {
            setResult(res.data);
            if (res.data.length > 0) {
                setColumns(Object.keys(res.data[0]));
            }
        }
        setIsLoading(false);
    };

    const clearHistory = () => {
        setHistory([]);
        localStorage.removeItem("sql_history");
    }

    const loadQueryFromHistory = (q: string) => {
        setQuery(q);
    }

    return (
        <div className="flex h-[calc(100vh-100px)] gap-4">
            {/* --- LEFT SIDEBAR: SCHEMA & HISTORY --- */}
            <Card className="w-80 flex-none h-full flex flex-col">
                <Tabs aria-label="Playground Options" fullWidth size="sm" variant="underlined">

                    {/* TAB 1: DATABASE SCHEMA */}
                    <Tab key="schema" title={<div className="flex items-center gap-2"><DatabaseIcon size={14} /> Schema</div>}>
                        <ScrollShadow className="h-[calc(100vh-180px)] p-2">
                            {/* Level 1: SCHEMA */}
                            <Accordion selectionMode="multiple" isCompact itemClasses={{ title: "font-bold text-sm text-primary" }}>
                                {Object.keys(schemaData).map((schema) => (
                                    <AccordionItem key={schema} title={schema} aria-label={schema}>
                                        {/* Level 2: TABLES (Nested Accordion) */}
                                        <Accordion
                                            selectionMode="multiple"
                                            isCompact
                                            showDivider={false}
                                            itemClasses={{
                                                trigger: "py-1 px-0",
                                                title: "text-xs font-semibold text-default-700",
                                                content: "pb-2 pl-2"
                                            }}
                                        >
                                            {Object.keys(schemaData[schema]).map(table => (
                                                <AccordionItem
                                                    key={table}
                                                    title={
                                                        <div className="flex items-center gap-2">
                                                            <TableIcon size={14} className="text-default-400" />
                                                            <span>{table}</span>
                                                            <span className="text-[10px] text-default-400 font-normal">
                                                                ({schemaData[schema][table].length})
                                                            </span>
                                                        </div>
                                                    }
                                                    aria-label={table}
                                                >
                                                    {/* Level 3: COLUMNS LIST */}
                                                    <div className="flex flex-col border-l-2 border-default-100 ml-1 pl-2 gap-1">
                                                        {schemaData[schema][table].map((col) => (
                                                            <div
                                                                key={col.name}
                                                                className="group flex items-center justify-between text-xs py-1 px-2 rounded hover:bg-default-100 cursor-pointer transition-colors"
                                                                onClick={() => insertToEditor(col.name)}
                                                                title={`Click to insert: ${col.name}`}
                                                            >
                                                                <div className="flex items-center gap-2 overflow-hidden">
                                                                    {getDataTypeIcon(col.type)}
                                                                    <span className="truncate text-default-600 font-mono group-hover:text-primary">
                                                                        {col.name}
                                                                    </span>
                                                                </div>
                                                                <span className="text-[10px] text-default-300 ml-2 font-mono shrink-0">
                                                                    {col.type}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </AccordionItem>
                                            ))}
                                        </Accordion>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </ScrollShadow>
                    </Tab>
                    {/* TAB 2: QUERY HISTORY */}
                    <Tab key="history" title={<div className="flex items-center gap-2"><HistoryIcon size={14} /> History</div>}>
                        <div className="flex flex-col h-full">
                            <div className="flex justify-end p-2 border-b border-default-100">
                                <Button size="sm" color="danger" variant="light" startContent={<Trash2Icon size={14} />} onPress={clearHistory}>
                                    Clear All
                                </Button>
                            </div>
                            <ScrollShadow className="h-[calc(100vh-220px)]">
                                {history.map((item, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => loadQueryFromHistory(item.query)}
                                        className="p-3 border-b border-default-100 cursor-pointer hover:bg-default-100 transition-colors group"
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <Chip size="sm" variant="dot" color={item.status === 'success' ? 'success' : 'danger'} className="scale-75 origin-left">
                                                {item.status}
                                            </Chip>
                                            <span className="text-[10px] text-default-400 flex items-center gap-1">
                                                <ClockIcon size={10} />
                                                {new Date(item.timestamp).toLocaleTimeString()}
                                            </span>
                                        </div>
                                        <p className="text-xs font-mono text-default-600 line-clamp-3 group-hover:text-primary">
                                            {item.query}
                                        </p>
                                    </div>
                                ))}
                                {history.length === 0 && (
                                    <div className="text-center text-default-400 text-sm mt-10">No history yet.</div>
                                )}
                            </ScrollShadow>
                        </div>
                    </Tab>
                </Tabs>
            </Card>

            {/* --- RIGHT CONTENT: EDITOR & RESULT --- */}
            <div className="flex-1 flex flex-col gap-4 h-full min-w-0">

                {/* Toolbar */}
                <div className="flex justify-between items-center bg-content1 p-2 rounded-lg border border-default-200">
                    <h1 className="text-xl font-bold ml-2">SQL Editor</h1>
                    <div className="flex gap-2">
                        <Button
                            color="danger"
                            variant="flat"
                            size="sm"
                            onPress={() => setQuery("")}
                            startContent={<EraserIcon size={16} />}
                        >
                            Clear
                        </Button>
                        <Button
                            color="primary"
                            isLoading={isLoading}
                            onPress={handleRunQuery}
                            startContent={!isLoading && <PlayIcon size={16} />}
                            size="sm"
                        >
                            Run Query (Ctrl+Enter)
                        </Button>
                    </div>
                </div>

                {/* Editor */}
                <Card className="flex-none h-[350px] border border-default-200">
                    <Editor
                        height="100%"
                        defaultLanguage="sql"
                        theme="vs-dark"
                        value={query}
                        onChange={(value) => setQuery(value || "")}
                        onMount={handleEditorDidMount} // Đăng ký Autocomplete ở đây
                        options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                            suggestOnTriggerCharacters: true, // Kích hoạt gợi ý khi gõ
                        }}
                    />
                </Card>

                {/* Error Message */}
                {error && (
                    <div className="p-3 bg-danger-50 border border-danger-200 text-danger rounded-lg flex items-center gap-2 text-sm">
                        <AlertTriangleIcon size={18} />
                        <span className="font-mono">{error}</span>
                    </div>
                )}

                {/* Result Table */}
                <Card className="flex-1 overflow-hidden min-h-[100px]">
                    <CardBody className="p-0 h-full">
                        {result.length > 0 ? (
                            <Table
                                aria-label="Query Results"
                                isHeaderSticky
                                classNames={{ base: "h-full overflow-auto", table: "h-full" }}
                                removeWrapper
                            >
                                <TableHeader>
                                    {columns.map((col) => (
                                        <TableColumn key={col}>{col.toUpperCase()}</TableColumn>
                                    ))}
                                </TableHeader>
                                <TableBody>
                                    {result.map((row, idx) => (
                                        <TableRow key={idx}>
                                            {columns.map((col) => (
                                                <TableCell key={`${idx}-${col}`}>
                                                    <div className="max-w-[300px] truncate font-mono text-xs" title={String(row[col])}>
                                                        {typeof row[col] === 'object' && row[col] !== null
                                                            ? JSON.stringify(row[col])
                                                            : String(row[col])}
                                                    </div>
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-default-400">
                                {isLoading ? <Spinner label="Executing query..." /> : "No results. Run a query or select from history."}
                            </div>
                        )}
                    </CardBody>
                </Card>
            </div>
        </div>
    );
}