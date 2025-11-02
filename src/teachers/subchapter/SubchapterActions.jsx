import { useState, useRef, useEffect } from "react";
import { Pencil, Trash2, MoreHorizontal } from "lucide-react";
import { FaChevronDown, FaPlus } from "react-icons/fa";
import { Link } from "react-router-dom";

const SubchapterActions = ({ sub, handleDelete, setSelectedSubchapter, setShowEditModal, setIsPopupOpen }) => {
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);
    // ปิด dropdown ถ้าคลิกรอบ ๆ
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative flex gap-2" ref={dropdownRef}>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setOpen(!open);
                }}
                className="flex items-center gap-1 p-2.5 py-1.5 rounded-lg bg-gray-100 text-blue-700 text-xs font-medium hover:bg-blue-700 hover:text-white transition duration-200 shadow-sm"
            >
                {/* <FaChevronDown className="w-3 h-3" /> */}
                {/* <span>จัดการ</span> */}
                <span><MoreHorizontal size={16} /></span>
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-50">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSubchapter(sub);
                            setShowEditModal(true);
                            setOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-blue-600"
                    >
                        <Pencil className="w-4 h-4" />
                        แก้ไข
                    </button>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(sub);
                            setOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-red-500"
                    >
                        <Trash2 className="w-4 h-4" />
                        ลบ
                    </button>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSubchapter(sub);
                            setIsPopupOpen(true);
                            setOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-green-600"
                    >
                        <FaPlus className="w-3 h-3" />
                        เพิ่มคำถามระหว่างบทเรียน
                    </button>
                    {sub.hasArticle ? (
                        <Link
                            to="/teacher/article/edit"
                            state={{ id: sub.articleId }}
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-yellow-600"
                            onClick={() => setOpen(false)}
                        >
                            <Pencil className="inline w-3 h-3" />
                            แก้ไขสรุปเนื้อหา
                        </Link>

                    )
                        : (
                            <Link
                                to="/teacher/article/insert"
                                state={{ subchapter_id: sub.subchapter_id }}
                                className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-purple-600"
                                onClick={() => setOpen(false)}
                            >
                                <FaPlus className="inline w-3 h-3" />
                                เพิ่มสรุปเนื้อหา
                            </Link>
                        )}
                </div>
            )}
        </div>
    );
};

export default SubchapterActions;
