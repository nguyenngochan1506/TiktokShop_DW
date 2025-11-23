import { getDictionaryData } from "@/app/actions/dictionary";
import DictionaryEditor from "@/components/dictionary-editor";

export default async function DictionaryPage() {
  const result = await getDictionaryData();

  if (result.error || !result.data) {
    return (
      <div className="flex items-center justify-center h-full text-lg text-danger-600 font-semibold bg-danger-50 border border-danger-200 rounded-lg p-6">
        Lỗi khi tải dữ liệu từ điển.
      </div>
    );
  }

  return (
    <div className="h-full">
      <DictionaryEditor initialData={result.data} />
    </div>
  );
}