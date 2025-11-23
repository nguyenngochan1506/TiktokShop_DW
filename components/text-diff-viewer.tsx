"use client";

import { diffWords } from "diff";
import React from "react";

interface TextDiffProps {
    oldText?: string | null;
    newText?: string | null;
    label: string;
}

export const TextDiffViewer = ({ oldText, newText, label }: TextDiffProps) => {
    // Xử lý null/undefined
    const safeOld = oldText || "";
    const safeNew = newText || "";

    // Nếu không có thay đổi
    if (safeOld === safeNew) {
        return (
            <div className="mb-4">
                <h4 className="text-sm font-semibold text-default-500 mb-1">{label}</h4>
                <div className="p-3 bg-default-50 rounded-lg text-sm text-default-600 border border-default-200">
                    {safeNew || <span className="italic text-default-400">Empty</span>}
                </div>
            </div>
        );
    }

    // Tính toán sự khác biệt (theo từ)
    const diff = diffWords(safeOld, safeNew);

    return (
        <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
                <h4 className="text-sm font-semibold text-default-500">{label}</h4>
                <span className="text-xs px-2 py-0.5 rounded bg-warning-100 text-warning-700">Changed</span>
            </div>
            <div className="p-3 bg-default-50 rounded-lg text-sm leading-relaxed border border-default-200">
                {diff.map((part, index) => {
                    if (part.added) {
                        return (
                            <span key={index} className="bg-success-100 text-success-700 font-semibold px-0.5 rounded mx-0.5">
                                {part.value}
                            </span>
                        );
                    }
                    if (part.removed) {
                        return (
                            <span key={index} className="bg-danger-100 text-danger-700 line-through decoration-danger-700 px-0.5 rounded mx-0.5 opacity-80">
                                {part.value}
                            </span>
                        );
                    }
                    return <span key={index} className="text-default-700">{part.value}</span>;
                })}
            </div>
        </div>
    );
};