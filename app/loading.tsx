import { Spinner } from "@heroui/spinner";

export default function Loading() {
  return (
    <div className="flex h-[50vh] w-full items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="lg" color="primary" label="Loading data..." />
      </div>
    </div>
  );
}