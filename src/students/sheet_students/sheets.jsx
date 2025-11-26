import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/navBar';
import Footer from '../../components/footer';
import { Heart, Download, Eye, Layers, User, X } from 'lucide-react';
import Swal from 'sweetalert2';
import { FaPlus } from "react-icons/fa";
import { getUserId } from '../../js/auth';
import AddSheet from "./add_sheet";
import EditSheet from './edit_sheet';
import { getSheets, getFavoriteSheets, toggleFavoriteSheet, deleteSheet, incrementViewCount } from "../../api/students/sheet";
import { getFileUrl } from '../../js/getFileUrl';


const Sheet = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [sheets, setSheets] = useState([]);
    const [filter, setFilter] = useState('all');
    const [favoriteSheetIds, setFavoriteSheetIds] = useState([]);
    const userId = getUserId();

    const [selectedPdf, setSelectedPdf] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [showEditPopup, setShowEditPopup] = useState(false);
    const [editingSheet, setEditingSheet] = useState(null);


    // โหลดชีท + favorite
    useEffect(() => {
        const fetchData = async () => {
            try {
                const sheetData = await getSheets();
                setSheets(sheetData);

                if (userId) {
                    const favData = await getFavoriteSheets(userId);
                    if (favData.success) {
                        setFavoriteSheetIds(favData.favorites);
                    }
                }
            } catch (err) {
                console.error("Error fetching sheets/favorites:", err);
            }
        };

        fetchData();
    }, [userId]);

    const handleAddSheet = (formData) => {
        console.log("ส่งข้อมูล:", formData);
    };

    const toggleSidebar = () => {
        setSidebarOpen(!isSidebarOpen);
    };

    // toggle favorite
    const toggleFavorite = async (sheetId) => {
        try {
            await toggleFavoriteSheet(userId, sheetId);
            const favData = await getFavoriteSheets(userId);
            if (favData.success) {
                setFavoriteSheetIds(favData.favorites);
            }
        } catch (err) {
            console.error("Error toggling favorite:", err);
        }
    };

    // ลบชีท
    const handleDeleteSheet = (sheetId) => {
        Swal.fire({
            title: 'คุณแน่ใจไหม?',
            text: "คุณจะไม่สามารถกู้ชีทนี้กลับมาได้!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'ใช่ ลบเลย',
            cancelButtonText: 'ยกเลิก'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await deleteSheet(sheetId);
                    setSheets(prev => prev.filter(sheet => sheet.sheet_id !== sheetId));
                    Swal.fire('ลบสำเร็จ!', 'ชีทถูกลบเรียบร้อยแล้ว.', 'success');
                } catch (err) {
                    console.error(err);
                    Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถลบชีทได้', 'error');
                }
            }
        });
    };

    // เพิ่มวิว
    const handleOpenPdf = async (sheet) => {
        setSelectedPdf(sheet.pdf_file);
        try {
            const res = await incrementViewCount(sheet.sheet_id);
            if (res.success) {
                setSheets(prev =>
                    prev.map(s =>
                        Number(s.sheet_id) === Number(sheet.sheet_id)
                            ? { ...s, view_count: res.view_count }
                            : s
                    )
                );
            }
        } catch (err) {
            console.error("Cannot increment view count:", err);
        }
    };

    const filteredSheets = sheets.filter(sheet => {
        if (filter === 'favorites') {
            return favoriteSheetIds.includes(Number(sheet.sheet_id));
        }
        if (filter === 'mine') {
            return Number(sheet.student_id) === Number(userId);
        }
        return true; // all
    });



    return (
        <section className="flex flex-col min-h-screen">
            <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
            <div className="flex-1 p-8 pt-32 w-full overflow-y-auto px-16 bg-gray-50 min-h-screen">

                <div className="flex justify-between items-center mb-6">
                    <div className='flex gap-3 overflow-x-auto flex-nowrap hide-scroller'>
                        <button
                            onClick={() => setFilter('all')}
                            className={`flex items-center gap-2 px-2 py-2 rounded-full ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-white shadow text-black'}`} title='ทั้งหมด'
                        >
                            <div className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                <Layers size={14} />
                            </div>
                            <p className={`${filter === 'all' ? '!text-white' : 'text-black'} px-2 ${filter === 'all' ? 'block' : 'hidden'} md:block`}>ทั้งหมด</p>
                        </button>

                        <button
                            onClick={() => setFilter('favorites')}
                            className={`flex items-center gap-2 px-2 py-2 rounded-full ${filter === 'favorites' ? 'bg-blue-600 text-white' : 'bg-white shadow text-black'}`} title='รายการโปรด'
                        >
                            <div className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                <Heart size={14} />
                            </div>
                            <p className={`${filter === 'favorites' ? '!text-white' : 'text-black'} px-2 ${filter === 'favorites' ? 'block' : 'hidden'} md:block`}>รายการโปรด</p>
                        </button>

                        <button
                            onClick={() => setFilter('mine')}
                            className={`flex items-center gap-2 px-2 py-2 rounded-full ${filter === 'mine' ? 'bg-blue-600 text-white' : 'bg-white shadow text-black'}`} title='รายการของฉัน'
                        >
                            <div className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                <User size={14} />
                            </div>
                            <p className={`${filter === 'mine' ? '!text-white' : 'text-black'} px-2 ${filter === 'mine' ? 'block' : 'hidden'} md:block`}>รายการของฉัน</p>
                        </button>

                    </div>

                    <div className='flex-shrink-0 mt-2 sm:mt-0'>
                        <button
                            onClick={() => setShowPopup(true)}
                            className="flex justify-center items-center w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow transition duration-200 transform hover:scale-105">
                            <FaPlus className="w-4 h-4" />
                        </button>
                    </div>
                    {showPopup && (
                        <AddSheet
                            onClose={() => setShowPopup(false)}
                            onSubmit={handleAddSheet}
                        />
                    )}

                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6">
                    {filteredSheets.map(sheet => (
                        <div key={sheet.sheet_id} className="relative max-w-sm bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-lg hover:scale-[1.02] hover:border-blue-100 transition-all duration-300 ease-in-out">
                            {/* sheet */}
                            <div>
                                {sheet.cover_image ? (
                                    <img
                                        className="rounded-t-lg w-full h-48 object-cover cursor-pointer"
                                        src={getFileUrl(sheet.cover_image)}
                                        alt={sheet.title}
                                        onClick={() => handleOpenPdf(sheet)}
                                    />
                                ) : (
                                    <img
                                        className="rounded-t-lg w-24 h-32 mx-auto my-4 cursor-pointer"
                                        src="https://cdn-icons-png.flaticon.com/512/337/337946.png"
                                        alt="default icon"
                                        onClick={() => handleOpenPdf(sheet)}
                                    />
                                )}
                            </div>

                            {/* ปุ่มแก้ไข/ลบ สำหรับเจ้าของ sheet */}
                            {sheet.student_id === userId && (
                                <div className="absolute top-2 right-2 flex gap-2">
                                    {/* <button
                                        onClick={() => {
                                            setEditingSheet(sheet);
                                            setShowEditPopup(true);
                                        }}
                                        className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                                    >
                                        แก้ไข
                                    </button> */}
                                    <button
                                        onClick={() => handleDeleteSheet(sheet.sheet_id)}
                                        className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                                    >
                                        ลบ
                                    </button>
                                </div>

                            )}

                            <div className="p-5">
                                <h5 className="mb-2 text-[18px] font-bold tracking-tight text-gray-900 break-words whitespace-normal">{sheet.title}</h5>
                                <div className="flex justify-between">
                                    <p className="mb-3 text-gray-700 text-[12px]">เพิ่มโดย: {sheet.student_name}</p>
                                    {/* <div className="flex items-center gap-1 text-gray-500 text-[12px]">
                                        <Eye size={14} />
                                        <span>{sheet.view_count}</span>
                                    </div> */}
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                    <button
                                        onClick={() => toggleFavorite(sheet.sheet_id)}
                                        className={`flex items-center gap-1 transition-colors duration-200 ${favoriteSheetIds.includes(Number(sheet.sheet_id)) ? 'text-pink-500' : 'text-gray-400 hover:text-pink-400'}`}
                                    >
                                        <Heart size={18} />
                                    </button>

                                    <div className="flex items-center gap-1 text-gray-500 text-[12px]">
                                        <Eye size={18} />
                                        <span>{sheet.view_count}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* แสดง pdf ถ้ามีการเลือก */}
                    {selectedPdf && (
                        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50">
                            <div className="relative w-4/5 h-4/5 bg-white rounded shadow-lg">
                                <button
                                    onClick={() => setSelectedPdf(null)}
                                    className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 text-xl font-bold z-10"
                                >
                                    ×
                                </button>
                                <embed
                                    src={getFileUrl(selectedPdf)}
                                    type="application/pdf"
                                    width="100%"
                                    height="100%"
                                />
                            </div>
                        </div>
                    )}

                    {/* Popup */}
                    {showEditPopup && editingSheet && (
                        <EditSheet
                            sheetData={editingSheet}
                            onClose={() => setShowEditPopup(false)}
                            onSubmit={(updatedSheet) => {
                                if (!updatedSheet || !updatedSheet.sheet_id) return;

                                setSheets(prev =>
                                    prev.map(s =>
                                        Number(s.sheet_id) === Number(updatedSheet.sheet_id)
                                            ? {
                                                ...s, // ข้อมูลเดิมทั้งหมด
                                                ...updatedSheet, // ข้อมูลที่แก้ไข
                                                student_id: s.student_id,      
                                                student_name: s.student_name,   
                                                view_count: s.view_count,      
                                            }
                                            : s
                                    )
                                );

                                setEditingSheet(null);
                                setShowEditPopup(false);
                            }}

                        />
                    )}


                </div>

            </div>
            <Footer />
        </section>
    );
};

export default Sheet;