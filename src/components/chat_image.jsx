import { useState } from "react";
import { getFileUrl } from "../js/getFileUrl";

export function ChatImage({ file_url }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* ภาพเล็ก */}
      <img
        src={getFileUrl(file_url)}
        alt="uploaded"
        className="max-w-[150px] rounded-lg inline-block cursor-pointer"
        onClick={() => setIsOpen(true)}
      />

      {/* แสดงภาพเต็ม */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 flex items-center justify-center z-50"
          onClick={() => setIsOpen(false)}
        >
          <img
            src={getFileUrl(file_url)}
            alt="full"
            className="max-h-[90%] max-w-[90%] rounded"
          />
        </div>
      )}
    </>
  );
}
