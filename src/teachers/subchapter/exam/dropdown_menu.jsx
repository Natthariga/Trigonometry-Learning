import { useState } from "react";
import { Pencil, Trash2, Settings } from "lucide-react";
import { FaPlus, FaChevronDown, FaPenAlt, FaListUl } from "react-icons/fa";
import { Link } from "react-router-dom";

const DropdownMenu = ({ sub, handleDelete, setSelectedSubchapter, setShowEditModal }) => {
    const [open, setOpen] = useState(false);

    return (
        <div className="relative inline-flex gap-2 items-center">
            <div className="relative">
                <button
                    onClick={() => setOpen(!open)}
                    className="flex items-center gap-1 p-1 text-gray-500 hover:text-gray-700"
                    title="เมนูเพิ่มเติม"
                >
                    <Settings className="w-4 h-4" />
                    <FaChevronDown
                        className={`w-2 h-3 text-gray-400 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
                    />
                </button>

                {open && (
                    <div className="absolute top-full right-0 mt-2 w-52 bg-white border border-gray-200 rounded-lg shadow-lg z-50">

                        {/* ✅ ถ้าไม่มีข้อสอบ -> แสดงเฉพาะปุ่มเพิ่ม */}
                        {sub.question_count === 0 ? (
                            <Link
                                to={`/teacher/addExam/${sub.subchapter_id}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setOpen(false);
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                                <FaListUl className="w-3 h-3 mr-2" /> เพิ่มแบบทดสอบ
                            </Link>
                        ) : (
                            <>
                                {/* มีข้อสอบแล้ว -> แก้ไข + ลบ */}
                                <Link
                                    to={`/teacher/editExam/${sub.subchapter_id}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setOpen(false);
                                    }}
                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    <Pencil className="w-3 h-3 mr-2" /> แก้ไขแบบทดสอบ
                                </Link>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(sub);
                                        setOpen(false);
                                    }}
                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    <Trash2 className="w-3 h-3 mr-2" /> ลบแบบทดสอบ
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};


export default DropdownMenu;
