import { prisma } from "@/lib/prisma";
import { CreateSourceModal } from "@/components/create-source-modal";
import { SourcesTable } from "@/components/sources-table";
import { ImportSourcesModal } from "@/components/import-sources-modal";

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
            orderBy: { created_at: 'desc' }
        }),
        prisma.source_config.count()
    ]);

    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Source Configurations</h1>
                <ImportSourcesModal />
                <CreateSourceModal />

            </div>

            <SourcesTable sources={sources} totalPages={totalPages} />
        </div>
    );
}