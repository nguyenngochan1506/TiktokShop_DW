"use client";

import { DateRangePicker } from "@heroui/date-picker";
import { parseDate, getLocalTimeZone, today, DateValue } from "@internationalized/date";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { RangeValue } from "@react-types/shared";

export const DateRangeFilter = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 1. Lấy giá trị từ URL hoặc mặc định
  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");

  // Helper để lấy ngày hôm nay
  const now = today(getLocalTimeZone());

  // Giá trị mặc định cho Picker
  const defaultValue = {
    start: fromParam ? parseDate(fromParam) : now.subtract({ days: 7 }),
    end: toParam ? parseDate(toParam) : now,
  };

  // 2. Xử lý khi chọn ngày
  // FIX: Thêm `| null` vào kiểu tham số để khớp với định nghĩa của HeroUI
  const handleDateChange = (range: RangeValue<DateValue> | null) => {
  const params = new URLSearchParams(searchParams);

  if (range) {
    // Trường hợp chọn ngày: Set params
    params.set("from", range.start.toString());
    params.set("to", range.end.toString());
  } else {
    // Trường hợp xóa chọn (null): Xóa params để reset về mặc định
    params.delete("from");
    params.delete("to");
  }

  router.replace(`${pathname}?${params.toString()}`);
};


  return (
    <div className="w-full sm:w-auto">
      <DateRangePicker
        label="Select Date Range"
        size="sm"
        variant="bordered"
        defaultValue={defaultValue}
        onChange={handleDateChange}
        className="max-w-xs"
        visibleMonths={2} 
      />
    </div>
  );
};