"use client";

import {Table, TableBody, TableCell, TableColumn, TableHeader, TableRow} from '@heroui/table';
import {Chip} from '@heroui/chip';
import {Tooltip} from '@heroui/tooltip'
import {Button} from '@heroui/button';
import { EditIcon, TrashIcon, PlusIcon, RefreshCwIcon } from "lucide-react";
import { SourceConfig } from "@/types/schema";

const sources: SourceConfig[] = [
  { id: 1, source_name: "Shopee Electronics", base_url: "https://shopee.vn/...", is_active: true, last_crawl_status: "SUCCESS", last_crawl_timestamp: "2023-10-20T10:00:00Z" },
  { id: 2, source_name: "Lazada Fashion", base_url: "https://lazada.vn/...", is_active: false, last_crawl_status: "FAILED", last_crawl_timestamp: "2023-10-19T14:30:00Z" },
];

const statusColorMap: Record<string, "success" | "danger" | "warning"> = {
  SUCCESS: "success",
  FAILED: "danger",
  PENDING: "warning",
};

export default function SourcesPage() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Source Configurations</h1>
        <Button color="primary" startContent={<PlusIcon size={18} />}>
          Add Source
        </Button>
      </div>

      <Table aria-label="Source configs table">
        <TableHeader>
          <TableColumn>ID</TableColumn>
          <TableColumn>SOURCE NAME</TableColumn>
          <TableColumn>STATUS</TableColumn>
          <TableColumn>LAST CRAWL</TableColumn>
          <TableColumn>ACTIONS</TableColumn>
        </TableHeader>
        <TableBody>
          {sources.map((source) => (
            <TableRow key={source.id}>
              <TableCell>#{source.id}</TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="text-bold text-sm">{source.source_name}</span>
                  <span className="text-tiny text-default-400 truncate max-w-[200px]">{source.base_url}</span>
                </div>
              </TableCell>
              <TableCell>
                <Chip className="capitalize" color={source.is_active ? "success" : "default"} size="sm" variant="flat">
                  {source.is_active ? "Active" : "Inactive"}
                </Chip>
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  <Chip size="sm" color={statusColorMap[source.last_crawl_status || "PENDING"]} variant="dot">
                    {source.last_crawl_status || "N/A"}
                  </Chip>
                  <span className="text-tiny text-default-400">
                    {source.last_crawl_timestamp ? new Date(source.last_crawl_timestamp).toLocaleString() : "-"}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Tooltip content="Edit source">
                    <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                      <EditIcon size={18} />
                    </span>
                  </Tooltip>
                  <Tooltip color="danger" content="Delete source">
                    <span className="text-lg text-danger cursor-pointer active:opacity-50">
                      <TrashIcon size={18} />
                    </span>
                  </Tooltip>
                  <Tooltip content="Trigger Crawl">
                    <span className="text-lg text-primary cursor-pointer active:opacity-50">
                      <RefreshCwIcon size={18} />
                    </span>
                  </Tooltip>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}