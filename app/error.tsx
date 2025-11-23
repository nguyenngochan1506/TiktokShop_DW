"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 p-8 bg-default-50 rounded-lg border border-danger-200">
      <h2 className="text-xl font-bold text-danger-600">Đã xảy ra lỗi!</h2>
      <p className="text-default-500 text-sm">Vui lòng thử tải lại trang.</p>
      <button
        className="px-4 py-2 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary-600 transition-colors"
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
      >
        Thử lại
      </button>
    </div>
  );
}