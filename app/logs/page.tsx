"use client";

import {Chip} from "@heroui/chip";
import {Table, TableHeader, TableColumn, TableBody, TableRow, TableCell} from '@heroui/table';
import { CrawlLog } from "@/types/schema";

// Mock data
const logs: CrawlLog[] = [
  { id: 101, source_config_id: 1, file_name: "shopee_20231020.json", record_count: 500, status: "SUCCESS", created_at: "2023-10-20T10:05:00Z" },
  { id: 102, source_config_id: 2, file_name: "lazada_err.json", record_count: 0, status: "FAILED", error_message: "Timeout connection", created_at: "2023-10-19T14:35:00Z" },
];

export default function LogsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Crawl Logs</h1>
      <Table aria-label="Logs table">
        <TableHeader>
          <TableColumn>LOG ID</TableColumn>
          <TableColumn>FILE NAME</TableColumn>
          <TableColumn>RECORDS</TableColumn>
          <TableColumn>STATUS</TableColumn>
          <TableColumn>TIMESTAMP</TableColumn>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell>#{log.id}</TableCell>
              <TableCell>{log.file_name}</TableCell>
              <TableCell>{log.record_count}</TableCell>
              <TableCell>
                <Chip 
                  color={log.status === "SUCCESS" ? "success" : log.status === "FAILED" ? "danger" : "warning"} 
                  variant="flat"
                >
                  {log.status}
                </Chip>
                {log.error_message && (
                   <div className="text-tiny text-danger mt-1">{log.error_message}</div>
                )}
              </TableCell>
              <TableCell>{new Date(log.created_at).toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}