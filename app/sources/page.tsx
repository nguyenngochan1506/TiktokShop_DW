import { prisma } from "@/lib/prisma";
import { Button } from "@heroui/button";
import { PlusIcon } from "lucide-react";
import { SourcesTable } from "./sources-table";

const ITEMS_PER_PAGE = 10;

export default async function SourcesPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const params = await searchParams;
    const page = Number(params?.page) || 1;
    const skip = (page - 1) * ITEMS_PER_PAGE;

    const [sources, totalCount] = await prisma.$transaction([
        prisma.source_config.findMany({
            skip: skip,
            take: ITEMS_PER_PAGE,
            orderBy: { id: 'desc' }
        }),
        prisma.source_config.count()
    ]);

    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Source Configurations</h1>
                <Button color="primary" startContent={<PlusIcon size={18} />}>
                    Add Source
                </Button>
            </div>

            <SourcesTable sources={sources} totalPages={totalPages} />
        </div>
    );
}