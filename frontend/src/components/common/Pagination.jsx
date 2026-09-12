import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Reusable Table Pagination Bar
 * @param {number} currentPage
 * @param {number} totalItems
 * @param {number} rowsPerPage
 * @param {Function} onPageChange
 */
export default function Pagination({ currentPage, totalItems, rowsPerPage, onPageChange }) {
  const totalPages = Math.ceil(totalItems / rowsPerPage) || 1;
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalItems);

  if (totalItems <= rowsPerPage) return null;

  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-white/5 bg-white/[0.02]">
      <p className="text-xs text-gray-400">
        Showing <span className="text-white font-medium">{totalItems > 0 ? startIndex + 1 : 0}</span> to{" "}
        <span className="text-white font-medium">{endIndex}</span> of{" "}
        <span className="text-white font-medium">{totalItems}</span> results
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
          className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-xs text-gray-300 font-medium px-2">
          Page {currentPage} of {totalPages}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
