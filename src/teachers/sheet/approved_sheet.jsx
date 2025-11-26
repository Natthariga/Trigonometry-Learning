import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../../components/sidebarAdmin';
import { CheckCircle, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FaSearch, FaSort } from 'react-icons/fa';
import Swal from "sweetalert2";
import { getApprovedSheets, approveOrRejectSheet } from "../../api/teachers/sheet";

const ApprovedSheets = () => {
    const [sheets, setSheets] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortOption, setSortOption] = useState("latest");
    const [showSortMenu, setShowSortMenu] = useState(false);

    // โหลดชีทอนุมัติแล้ว
    useEffect(() => {
        const fetchSheets = async () => {
            try {
                const data = await getApprovedSheets();
                setSheets(data);
            } catch (err) {
                console.error("Error fetching approved sheets:", err);
            }
        };
        fetchSheets();
    }, []);

    const toggleSortMenu = () => setShowSortMenu(!showSortMenu);

    const handleSortChange = (option) => {
        setSortOption(option);
        setShowSortMenu(false);
    };

    const handleApproveReject = (sheet_id, action) => {
        const confirmText =
            action === "approve"
                ? "คุณต้องการอนุมัติรายการนี้หรือไม่?"
                : "คุณต้องการปฏิเสธรายการนี้หรือไม่?";
        const confirmButtonText =
            action === "approve" ? "ใช่, อนุมัติ" : "ใช่, ปฏิเสธ";
        const successText =
            action === "approve" ? "อนุมัติเรียบร้อยแล้ว" : "ปฏิเสธเรียบร้อยแล้ว";

        Swal.fire({
            text: confirmText,
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: action === "approve" ? "#28a745" : "#d33",
            cancelButtonColor: "#6c757d",
            confirmButtonText,
            cancelButtonText: "ยกเลิก",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await approveOrRejectSheet(sheet_id, action);
                    setSheets((prev) => prev.filter((sheet) => sheet.sheet_id !== sheet_id));
                    Swal.fire({
                        icon: "success",
                        title: successText,
                        showConfirmButton: false,
                        timer: 1500,
                    });
                } catch (err) {
                    console.error("เกิดข้อผิดพลาด:", err);
                    Swal.fire({
                        icon: "error",
                        title: "เกิดข้อผิดพลาด",
                        text: "ไม่สามารถดำเนินการได้",
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
            if (sortOption === 'latest') {
                return new Date(b.create_at) - new Date(a.create_at);
            } else if (sortOption === 'views') {
                return parseInt(b.view_count) - parseInt(a.view_count);
            }
            return 0;
        });

    return (
        <section className="flex h-screen w-full bg-gray-50">
            <Sidebar />
            <div className="flex-1 overflow-auto p-8">
                <header className="flex justify-between items-center mb-4">
                    <div>
                        <h2 className="text-[20px] font-semibold text-gray-800">รายการชีทที่ยังไม่ได้อนุมัติ</h2>
                        <p className="text-[12px] text-gray-600 mt-1">พบทั้งหมด: {filteredSheets.length} รายการ</p>
                    </div>

                    <div className="flex items-center gap-3 relative">

                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                <FaSearch className="h-4 w-4" />
                            </span>
                            <input
                                type="text"
                                placeholder="ค้นหา"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 pr-3 py-1 border border-gray-300 rounded-md text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="relative">
                            <button
                                onClick={toggleSortMenu}
                                className="p-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none"
                                title="เรียงลำดับ"
                            >
                                <FaSort />
                            </button>


                            {showSortMenu && (
                                <div className="absolute z-10 right-0 mt-2 w-48 bg-white border rounded-md shadow-lg text-sm text-gray-700">
                                    <button
                                        onClick={() => handleSortChange("latest")}
                                        className={`w-full px-4 py-2 text-left hover:bg-gray-100 ${sortOption === "latest" ? "bg-gray-100" : ""}`}
                                    >
                                        รายการล่าสุด
                                    </button>

                                </div>
                            )}

                        </div>
                    </div>

                </header>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6">
                    {sheets.map(sheet => (
                        <div
                            key={sheet.sheet_id}
                            className="relative max-w-sm bg-white border border-gray-200  shadow-sm "
                        >
                            <div className="absolute right-0 z-10">
                                <div className="rounded-bl-xl bg-blue-600 shadow-lg p-3 flex gap-2 shadow">
                                    <button
                                        onClick={() => handleApproveReject(sheet.sheet_id, 'approve')}
                                        className="text-green-600 bg-white rounded-full p-1 hover:text-green-800"
                                        title="อนุมัติ"
                                    >
                                        <CheckCircle size={16} />
                                    </button>

                                    <button
                                        onClick={() => handleApproveReject(sheet.sheet_id, 'reject')}
                                        className="text-red-500 bg-white rounded-full p-1 hover:text-red-700"
                                        title="ปฏิเสธ"
                                    >
                                        <XCircle size={16} />
                                    </button>
                                </div>
                            </div>


                            <div>
                                {sheet.cover_image ? (
                                    <img
                                        className="w-full h-48 object-cover"
                                        src={`http://localhost/trigo/${sheet.cover_image}`}
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
                                    <p className="text-gray-700 text-[11px]">เพิ่มโดย: {sheet.student_name}</p>
                                </div>

                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ApprovedSheets;
