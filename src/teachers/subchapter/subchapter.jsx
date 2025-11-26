import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/sidebarAdmin';
import SearchAndSort from '../../components/search';
import '../../style/show_chapter.css';
import Addsubchapter from './insert_subchapter';
import { Clock } from 'lucide-react';
import Swal from 'sweetalert2';
import EditSubchapterModal from './edit_subchapter';
import PopupModal from './popup/insert_popup';
import { getSubchapters, deleteSubchapter } from '../../api/teachers/subchapter';
import SubchapterActions from './SubchapterActions';
import { getArticles } from '../../api/teachers/article';
import { FaPlus } from 'react-icons/fa';

const Subchapter = () => {
    const { subchapter_id } = useParams();
    const location = useLocation();

    const [chapterName, setChapterName] = useState('บทเรียนทั้งหมด');
    const [subchapters, setSubchapters] = useState([]);

    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortOption, setSortOption] = useState("name");
    const sortOptions = [
        { value: "name", label: "เรียงตามชื่อ (ก-ฮ)" },
        { value: "latest", label: "รายการล่าสุด" },
        { value: "oldest", label: "รายการเก่าที่สุด" },
    ];

    const [selectedSubchapter, setSelectedSubchapter] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [isPopupOpen, setIsPopupOpen] = useState(false);

    // โหลด subchapters
    const fetchSubchapters = async () => {
        try {
            const resp = await getSubchapters();
            const articles = await getArticles();

            if (resp.status === 'success' && resp.data) {
                const subchapterData = Array.isArray(resp.data) ? resp.data : [resp.data];
                const validSubchapters = subchapterData
                    .filter(item => item && Object.keys(item).length > 0)
                    .map(sub => ({
                        ...sub,
                        hasArticle: articles.some(a => a.subchapter_id === sub.subchapter_id), // เช็กว่ามีบทความใน subchapter นี้ไหม
                        articleId: articles.find(a => a.subchapter_id === sub.subchapter_id)?.articles_id || null, // เก็บ id ของบทความนั้นไว้ด้วย
                    }));

                setSubchapters(validSubchapters);
            } else {
                setSubchapters([]);
            }
        } catch (err) {
            console.error('ดึงข้อมูลบทเรียนล้มเหลว:', err);
            setSubchapters([]);
        }
    };

    // ลบ subchapter
    const handleDelete = async (subchapter) => {
        if (!subchapter) return;

        const result = await Swal.fire({
            text: `ต้องการลบ "${subchapter.subchapter_name}" ใช่หรือไม่?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'ลบ',
            cancelButtonText: 'ยกเลิก',
        });

        if (result.isConfirmed) {
            try {
                const data = await deleteSubchapter(subchapter.subchapter_id);
                if (data.status === "success") {
                    Swal.fire('ลบแล้ว!', 'บทเรียนถูกลบเรียบร้อย', 'success');
                    setSubchapters(prev => prev.filter(sub => sub.subchapter_id !== subchapter.subchapter_id));
                } else {
                    Swal.fire('ผิดพลาด!', data.message || 'ไม่สามารถลบบทเรียนได้', 'error');
                }
            } catch (error) {
                Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์', 'error');
            }
        }
    };

    useEffect(() => {
        fetchSubchapters();
        if (location.state?.chapterName) {
            setChapterName(location.state.chapterName);
        }
    }, [subchapter_id, location.state]);

    const getFilteredAndSortedSubchapters = () => {
        return subchapters
            .filter(sub =>
                sub.subchapter_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (sub.subchapter_description && sub.subchapter_description.toLowerCase().includes(searchTerm.toLowerCase()))
            )
            .sort((a, b) => {
                switch (sortOption) {
                    case "name":
                        return a.subchapter_name.localeCompare(b.subchapter_name, 'th');
                    case "oldest":
                        return parseInt(a.subchapter_id) - parseInt(b.subchapter_id);
                    case "latest":
                        return parseInt(b.subchapter_id) - parseInt(a.subchapter_id);
                    default: return 0;
                }
            });
    };
    const [stats, setStats] = useState({ student_count: 0 });

    return (
        <section className="flex h-screen overflow-hidden w-full">
            <Sidebar />

            <div className=" p-8 w-full overflow-y-auto mt-4 md:mt-0">
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

                <div id="topic" className="relative flex justify-between items-center mt-4 bg-white border border-gray-100 p-3 rounded">                    <div className="absolute left-0 top-0 h-full w-1 rounded-l-2xl bg-blue-500" />

                    <div className="pl-4">
                        <h1 className="text-[22px] font-semibold text-blue-700">{chapterName}</h1>
                    </div>

                    <button
                        onClick={() => setShowModal(true)}
                        className="flex justify-center items-center w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow transition duration-200 transform hover:scale-105">
                        <FaPlus className="w-4 h-4" />
                    </button>
                </div>


                <div className="col bg-white mt-6">
                    <div>
                        {getFilteredAndSortedSubchapters().length > 0 ? (
                            getFilteredAndSortedSubchapters().map((sub, idx) => (
                                <div
                                    key={sub.subchapter_id || idx}
                                    className="cursor-pointer bg-white p-4 mb-2 mt-3 rounded-xl border border-gray-100 transition-all duration-300 transform hover:shadow-lg hover:bg-gray-50 w-full"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center m-2 gap-4">
                                            <div className="flex flex-col">
                                                <p className="text-gray-800 font-semibold">{sub.subchapter_name}</p>
                                                {sub.subchapter_description && (
                                                    <p className="text-[13px] text-gray-500 break-words whitespace-normal">
                                                        {sub.subchapter_description}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <SubchapterActions
                                            sub={sub}
                                            handleDelete={handleDelete}
                                            setSelectedSubchapter={setSelectedSubchapter}
                                            setShowEditModal={setShowEditModal}
                                            setIsPopupOpen={setIsPopupOpen}

                                        />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center">ไม่พบข้อมูลบทเรียน</p>
                        )}
                    </div>
                </div>
                {isPopupOpen && selectedSubchapter && (
                    <PopupModal
                        isOpen={isPopupOpen}
                        onClose={() => setIsPopupOpen(false)}
                        videoUrl={selectedSubchapter?.subchapter_link}
                        subchapterId={selectedSubchapter.subchapter_id}
                        videoDuration={selectedSubchapter.video_duration}
                        onSuccess={() => {
                            setIsPopupOpen(false);
                            console.log("เพิ่มป็อบอัพสำเร็จ");
                        }}
                    />
                )}


                {showModal && (
                    <Addsubchapter
                        chapterID={subchapter_id}
                        onClose={() => setShowModal(false)}
                        onAdded={fetchSubchapters}
                    />
                )}

                {showEditModal && selectedSubchapter && (
                    <EditSubchapterModal
                        isOpen={showEditModal}
                        onClose={() => setShowEditModal(false)}
                        subchapterData={selectedSubchapter}
                        onUpdated={fetchSubchapters}
                    />
                )}



            </div>

            <div className="w-[500px] bg-white p-5 shadow-md overflow-y-auto hidden md:block">
                <div className="grid gap-4 mb-6">
                    <div className="bg-blue-100 p-4 rounded text-center">
                        <p className="text-sm">จำนวนบทเรียนทั้งหมด</p>
                        <h3 className="text-xl font-bold text-blue-700">{getFilteredAndSortedSubchapters().length}</h3>
                    </div>
                    {/* <div className="bg-green-100 p-4 rounded text-center">
                        <p className="text-sm">จำนวนนักเรียนที่เข้าร่วม</p>
                        <h3 className="text-xl font-bold text-green-700">{stats.student_count}</h3>
                    </div> */}
                </div>

                <div className="max-w-md mx-auto p-4 bg-white">
                    <p className="text-[14px] font-semibold mb-4 text-gray-800 border-b border-gray-100 pb-2">
                        บทเรียน <span className="text-blue-600">{chapterName}</span> ล่าสุด
                    </p>

                    {subchapters.length === 0 && (
                        <p className="text-gray-500 italic text-center">ไม่มีบทเรียนล่าสุด</p>
                    )}

                    {subchapters.map(sub => (
                        <div
                            key={sub.subchapter_id}
                            className="mb-4 p-3 border border-gray-100 rounded-md hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                            title={sub.subchapter_description || 'ไม่มีคำอธิบาย'}
                        >
                            <h5 className="text-[12px] text-gray-900 truncate">{sub.subchapter_name}</h5>
                            <p className="flex items-center text-[12px] text-gray-600 mt-1">
                                <Clock className="w-4 h-4 mr-1 text-blue-400" />
                                วันที่:{" "}
                                <span className="font-medium text-blue-700 ml-1">
                                    {sub.create_at ? new Date(sub.create_at).toLocaleDateString("th-TH") : "ไม่ทราบวันที่"}
                                </span>
                            </p>
                        </div>

                    ))}
                </div>
            </div>
        </section>
    );
};

export default Subchapter;

