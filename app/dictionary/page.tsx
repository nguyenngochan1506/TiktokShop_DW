import { getDictionaryData } from "@/app/actions/dictionary";
import DictionaryEditor from "@/components/dictionary-editor";

export default async function DictionaryPage() {
  const result = await getDictionaryData();

  if (result.error || !result.data) {
    return <div>Error loading dictionary data.</div>;
  }

  return (
    <div className="h-full">
      <DictionaryEditor initialData={result.data} />
    </div>
  );
}