import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/sidebarAdmin';
import SearchAndSort from '../../components/search';
import axios from 'axios';
import { Heart, Download, Eye, BellIcon, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { getSheets, deleteSheet } from "../../api/teachers/sheet";
import { getFileUrl } from "../../js/getFileUrl";

const GetSheets = () => {
    const [sheets, setSheets] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortOption, setSortOption] = useState("name");
    const [pendingCount, setPendingCount] = useState(0);

    const sortOptions = [
        { value: "nameAsc", label: "ชื่อ (ก-ฮ)" },
        { value: "views", label: "จำนวนคนดู (มาก→น้อย)" },
        { value: "latest", label: "อัปเดตล่าสุด" },
    ];

    useEffect(() => {
        const fetchSheets = async () => {
            try {
                const data = await getSheets();

                // แปลง object เป็น array
                const sheetsArray = data && data.sheets ? Object.values(data.sheets) : [];

                setSheets(sheetsArray);

                // เก็บ pendingCount
                setPendingCount(data.pendingCount || 0);
            } catch (error) {
                console.error("Error fetching sheets:", error);
            }
        };
        fetchSheets();
    }, []);


    const handleDelete = (sheet_id) => {
        Swal.fire({
            text: "คุณแน่ใจหรือไม่ว่าต้องการลบชีทนี้!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "ใช่, ลบเลย!",
            cancelButtonText: "ยกเลิก",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await deleteSheet(sheet_id);
                    setSheets((prev) => prev.filter((sheet) => sheet.sheet_id !== sheet_id));
                    Swal.fire({
                        title: "ลบสำเร็จ!",
                        text: "ชีทถูกลบเรียบร้อยแล้ว",
                        icon: "success",
                        timer: 1500,
                        showConfirmButton: false,
                    });
                } catch (error) {
                    console.error("Error deleting sheet:", error);
                    Swal.fire({
                        title: "เกิดข้อผิดพลาด",
                        text: "ไม่สามารถลบชีทได้",
                        icon: "error",
                    });
                }
            }
        });
    };

    const filteredSheets = sheets
        .filter(sheet =>
            sheet.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sheet.student_name.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
            switch (sortOption) {
                case "latest":
                    return new Date(b.create_at) - new Date(a.create_at);
                case "views":
                    return parseInt(b.view_count) - parseInt(a.view_count);
                default: return 0;
            }
        });


    return (
        <section className="flex h-screen w-full bg-gray-50">
            <Sidebar />
               <div className="flex-1 overflow-auto p-8 mt-5 md:mt-0">
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 w-full">
                    <div className='flex flex-col w-full'>
                        <h2 className="text-[20px] font-semibold text-gray-800">รายการชีทที่อนุมัติ</h2>
                        <p className="text-[12px] text-gray-600 mt-1 pl-2">พบทั้งหมด: {filteredSheets.length} รายการ</p>
                    </div>

                    <div className="flex items-center gap-4 relative">

                        <Link to="/teacher/approved">
                            <div className="relative">
                                <button className="flex items-center justify-center text-gray-400 hover:text-blue-600 focus:outline-none mr-2">
                                    <BellIcon className="h-5 w-5" />
                                </button>
                                {pendingCount > 0 && (
                                    <span className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full mr-2">
                                        {pendingCount}
                                    </span>
                                )}
                            </div>
                        </Link>

                        <SearchAndSort
                            searchTerm={searchTerm}
                            setSearchTerm={setSearchTerm}
                            sortValue={sortOption}
                            onSortChange={setSortOption}
                            sortOptions={sortOptions}
                        />


                    </div>

                </header>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6">
                    {filteredSheets.map(sheet => (
                        <div
                            key={sheet.sheet_id}
                            className="relative max-w-sm bg-white border border-gray-200 shadow-sm hover:shadow-lg hover:scale-[1.02] hover:border-blue-200 hover:border-dotted transition-all duration-300 ease-in-out"
                        >

                            <button
                                onClick={() => handleDelete(sheet.sheet_id)}
                                className="absolute top-2 right-2 text-red-500 hover:text-red-700 z-10 bg-white rounded-full p-1 shadow"
                                title="ลบชีท"
                            >
                                <Trash2 size={14} />
                            </button>

                            <div>
                                {sheet.cover_image ? (
                                    <img
                                        className="w-full h-48 object-cover"
                                        src={getFileUrl(sheet.cover_image)}
                                        alt={sheet.title}
                                    />
                                ) : (
                                    <img
                                        className="w-24 h-32 mx-auto my-4"
                                        src="https://cdn-icons-png.flaticon.com/512/337/337946.png"
                                        alt="default icon"
                                    />
                                )}
                            </div>
                            <div className="p-5">
                                <h5 className="text-[18px] font-bold tracking-tight text-gray-900 break-words whitespace-normal">{sheet.title}</h5>
                                <div className='flex justify-between '>
                                    <p className="mb-3 text-gray-700 text-[11px]">เพิ่มโดย: {sheet.student_name}</p>

                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default GetSheets;
