import { useState } from "react";
import { FaSearch, FaSort } from "react-icons/fa";

export default function SearchAndSort({
  searchTerm,
  setSearchTerm,
  sortValue,          
  onSortChange,      
  sortOptions = [],  
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center gap-2 w-full">
      {/* Search */}
      <div className="relative w-full sm:w-auto mb-2 sm:mb-0">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
          <FaSearch className="h-4 w-4" />
        </span>
        <input
          type="text"
          placeholder="ค้นหา"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Sort menu (ถ้ามีตัวเลือก) */}
      {sortOptions.length > 0 && (
        <div className="relative self-start md:self-auto">
          <button
            onClick={() => setOpen((v) => !v)}
            className="p-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none"
            title="เรียงลำดับ"
          >
            <FaSort />
          </button>

          {open && (
            <div className="absolute z-10 right-0 mt-2 w-48 bg-white border border-gray-300 rounded-md shadow-lg text-sm text-gray-700">
              {sortOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { onSortChange?.(opt.value); setOpen(false); }}
                  className={`w-full px-4 py-2 text-left hover:bg-gray-100 ${
                    sortValue === opt.value ? "bg-gray-100" : ""
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}