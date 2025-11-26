import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../../../components/sidebarAdmin';
import SearchAndSort from '../../../components/search';
import '../../../style/show_chapter.css';
import { Clock } from 'lucide-react';
import Swal from 'sweetalert2';
import { FaSearch, FaSort } from "react-icons/fa";
import DropdownMenu from './dropdown_menu';
import { getExams, deleteSubchapterExam } from "../../../api/teachers/exam";

const SubchapterExam = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const initialName = location.state?.chapterName || "แบบทดสอบทั้งหมด";
    const [chapterName, setChapterName] = useState(initialName);

    const [subchapters, setSubchapters] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    const [sortOption, setSortOption] = useState("name");
    const [sortOrder, setSortOrder] = useState("desc");
    const sortOptions = [
        { value: "name", label: "เรียงตามชื่อ (ก-ฮ)" },
        { value: "latest", label: "รายการล่าสุด" },
        { value: "oldest", label: "รายการเก่าที่สุด" },
    ];


    // โหลดข้อสอบ
    const fetchExamsData = async () => {
        try {
            const json = await getExams();
            if (json.status === "success" && json.data) {
                setSubchapters(json.data);
            } else {
                setSubchapters([]);
            }
        } catch (err) {
            console.error("ดึงข้อมูลแบบทดสอบล้มเหลว:", err);
            setSubchapters([]);
        }
    };

    useEffect(() => {
        fetchExamsData();
        if (location.state?.chapterName) {
            setChapterName(location.state.chapterName);
        }
    }, [location.state]);

    // ลบข้อสอบ
    const handleDelete = async (subchapter) => {
        if (!subchapter) return;

        const result = await Swal.fire({
            text: `ต้องการลบ "${subchapter.title}" ใช่หรือไม่?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "ลบ",
            cancelButtonText: "ยกเลิก",
        });

        if (!result.isConfirmed) return;

        try {
            const data = await deleteSubchapterExam(subchapter.subchapter_id);
            if (data.status === "success") {
                Swal.fire("ลบแล้ว!", "หัวข้อย่อยถูกลบเรียบร้อย", "success");
                setSubchapters((prev) =>
                    prev.filter((sub) => sub.subchapter_id !== subchapter.subchapter_id)
                );
            } else {
                Swal.fire("ผิดพลาด!", data.message || "ไม่สามารถลบหัวข้อย่อยได้", "error");
            }
        } catch (error) {
            Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์", "error");
        }
    };


    const toggleSortOrder = (option) => {
        if (sortOption === option) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortOption(option);
            setSortOrder("asc");
        }
    };

    const getFilteredAndSortedSubchapters = () => {
        const filtered = subchapters.filter(
            (sub) =>
                sub.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                sub.description?.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (sortOption === "questionCount") {
            return filtered.sort((a, b) => {
                return sortOrder === "desc"
                    ? b.question_count - a.question_count
                    : a.question_count - b.question_count;
            });
        }

        if (sortOption === "timeLimit") {
            return filtered.sort((a, b) => {
                return sortOrder === "asc"
                    ? (a.time_limit_minutes || 0) - (b.time_limit_minutes || 0)
                    : (b.time_limit_minutes || 0) - (a.time_limit_minutes || 0);
            });
        }

        return filtered.sort((a, b) => {
            switch (sortOption) {
                case "name":
                    return a.title.localeCompare(b.title, "th");
                case "latest":
                    return parseInt(a.subchapter_id) - parseInt(b.subchapter_id);
                case "oldest":
                    return parseInt(b.subchapter_id) - parseInt(a.subchapter_id);
                default: return 0;
            }
        });
    };

    return (
        <section className="flex h-screen overflow-hidden w-full">
            <Sidebar />

            {/* Main content */}
            <div className="p-6 md:p-8 flex-1 overflow-y-auto">
                {/* หัวข้อบนสุด */}
                <div className="flex flex-col md:flex-row items-start md:items-center mb-4 gap-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-700 bg-gray-50 px-4 py-2 rounded-full whitespace-nowrap">
                        <Clock size={16} className="text-blue-500" />
                        <span>
                            {new Date().toLocaleDateString('th-TH', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </span>
                    </div>

                    <div className="md:ml-auto">
                        <SearchAndSort
                            searchTerm={searchTerm}
                            setSearchTerm={setSearchTerm}
                            sortValue={sortOption}
                            onSortChange={(v) => setSortOption(v)}
                            sortOptions={sortOptions}
                        />
                    </div>

                </div>

                {/* ชื่อหัวข้อ + ปุ่มเพิ่ม */}
                <div id="topic" className="relative flex justify-between items-center mt-4 bg-white border border-gray-100 p-3 rounded">                    <div className="absolute left-0 top-0 h-full w-1 rounded-l-2xl bg-blue-500" />
                    <div className="pl-4">
                        <h1 className="text-lg md:text-2xl font-semibold text-gray-800">
                            <span className='text-blue-700'>{chapterName}</span>
                        </h1>
                    </div>
                </div>

                {/* ตาราง */}
                <div className="p-6 md:p-6 flex-grow overflow-x-auto">
                    <div className="w-full max-w-full text-sm md:text-base">
                        <table className="min-w-full divide-y divide-blue-200">
                            <thead>
                                <tr className="h-16">
                                    <th className="px-4 py-2 text-left text-xs md:text-sm font-medium text-gray-500 uppercase">ชื่อหัวข้อ</th>
                                    {/* <th className="px-4 py-2 text-left text-xs md:text-sm font-medium text-gray-500 uppercase w-[300px]">คำอธิบาย</th> */}
                                    <th
                                        className="px-4 py-2 text-center text-xs md:text-sm font-medium text-gray-500 uppercase cursor-pointer whitespace-nowrap"
                                        onClick={() => toggleSortOrder('questionCount')}
                                    >
                                        <div className="flex items-center justify-center gap-1">
                                            จำนวนข้อ
                                            <FaSort
                                                className={`w-3 h-3 transition-transform duration-300 ${sortOption === 'questionCount' && sortOrder === 'asc' ? 'rotate-180' : 'rotate-0'}`}
                                            />
                                        </div>
                                    </th>
                                    <th
                                        className="px-4 py-2 text-center text-xs md:text-sm font-medium text-gray-500 uppercase cursor-pointer select-none whitespace-nowrap"
                                        onClick={() => toggleSortOrder('timeLimit')}
                                    >
                                        <div className="flex items-center justify-center gap-1">
                                            เวลาทำข้อสอบ
                                            <FaSort
                                                className={`w-3 h-3 transition-transform duration-200 ${sortOption === 'timeLimit' && sortOrder === 'desc' ? 'rotate-180' : ''}`}
                                            />
                                        </div>
                                    </th>
                                    <th className="px-4 py-2 text-center text-xs md:text-sm font-medium text-gray-500 uppercase"></th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {getFilteredAndSortedSubchapters().map((sub, idx) => (
                                    <tr
                                        key={sub.subchapter_id || idx}
                                        className="hover:bg-gray-100 cursor-pointer h-16 odd:bg-white even:bg-gray-100"
                                        onClick={(e) => {
                                            const tag = e.target.tagName.toLowerCase();
                                            const classList = e.target.className;
                                            if (
                                                tag === "input" || tag === "label" || classList.includes("toggle-ignore")
                                            ) {
                                                return;
                                            }
                                        }}
                                    >

                                        <td className="px-4 text-sm md:text-base py-2 text-gray-800 max-w-[300px] truncate whitespace-nowrap overflow-hidden">{sub.title}</td>
                                        {/* 
                                        <td className="px-4 py-2 text-sm md:text-base text-gray-500 max-w-[300px] truncate whitespace-nowrap overflow-hidden" >
                                            {sub.description || "-"}
                                        </td> */}

                                        <td className="px-4 py-2 text-center text-[12px] md:text-sm text-gray-700">
                                            {sub.question_count ?? 0} ข้อ
                                        </td>

                                        <td className='px-4 py-2 text-center text-[12px] md:text-sm text-gray-700'>
                                            {sub.time_limit_minutes && sub.time_limit_minutes > 0
                                                ? `${sub.time_limit_minutes} นาที`
                                                : 'ไม่มีเวลาจำกัด'}
                                        </td>

                                        <td className="px-4 py-2 text-center" onClick={(e) => e.stopPropagation()}>
                                            <DropdownMenu
                                                sub={sub}
                                                chapterName={chapterName}
                                                handleDelete={handleDelete}
                                                // setSelectedSubchapter={setSelectedSubchapter}
                                                // setShowEditModal={setShowEditModal}
                                                navigate={navigate}
                                            />
                                        </td>

                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </section>
    );

};

export default SubchapterExam;
