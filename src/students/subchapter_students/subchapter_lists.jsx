import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../../components/navBar";
import Footer from "../../components/footer";
import "../../style/show_chapter.css";
import image1 from "../../assets/Chapter.png";
import { getUserId } from "../../js/auth";
import Swal from "sweetalert2";
import { getSubchapters, getPretestData } from "../../api/students/subchapter";

const ShowSubchapter = () => {
    const location = useLocation();
    const initialName = location.state?.chapterName || "บทเรียนทั้งหมด";
    const subchapterId = location.state?.subchapterId;
    const studentId = getUserId();

    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [chapterName] = useState(initialName);
    const [subchapters, setSubchapters] = useState([]);
    const [pretestData, setPretestData] = useState({});

    const navigate = useNavigate();
    const toggleSidebar = () => setSidebarOpen((open) => !open);

    // ดึงข้อมูล subchapter ทั้งหมด
    useEffect(() => {
        const fetchData = async () => {
            const json = await getSubchapters(studentId);
            if (json.status === "success") {
                const subchapterData = Array.isArray(json.data)
                    ? json.data
                    : [json.data];
                setSubchapters(subchapterData.filter(Boolean));
            } else {
                console.error("ข้อมูลหัวข้อย่อยไม่ถูกต้อง:", json);
            }
        };
        fetchData();
    }, [subchapterId]);

    // ดึงข้อมูล pretest ของนักเรียน
    useEffect(() => {
        const fetchPretest = async () => {
            const data = await getPretestData(studentId);
            if (data.status === "success") {
                setPretestData(data.data);
            } else {
                console.error("ไม่สามารถดึงข้อมูล pretest:", data);
            }
        };
        fetchPretest();
    }, []);

    // คลิกบทเรียน
    const handleSubchapterClick = (sub, index) => {
        // เช็กว่าบทก่อนหน้าผ่าน pretest หรือยัง
        const previousSub = subchapters[index - 1];
        const prevInfo = previousSub
            ? pretestData[previousSub.subchapter_id]
            : null;

        // if (index > 0 && (!prevInfo || !prevInfo.has_pretest)) {
        //     Swal.fire({
        //         title: "🔒 ยังไม่สามารถเข้าเรียนได้",
        //         text: `กรุณาเรียนบทที่ ${index} ให้เสร็จก่อน`,
        //         icon: "warning",
        //         confirmButtonText: "ตกลง",
        //     });
        //     return;
        // }

        const info = pretestData[sub.subchapter_id] || {
            pretest_score: null,
            full_score: 0,
            has_pretest: false,
        };

        if (!info.has_pretest) {
            Swal.fire({
                title: "ยินดีต้อนรับ",
                html: `<p>เข้าสู่แบบทดสอบก่อนเรียนเรื่อง <b>${sub.subchapter_name}</b></p>`,
                icon: "info",
                confirmButtonText: "เริ่มทำแบบทดสอบก่อนเรียน",
            }).then((result) => {
                if (result.isConfirmed) {
                    navigate("/pretest", { state: { subchapterId: sub.subchapter_id } });
                }
            });
        } else {
            Swal.fire({
                title: "คะแนนก่อนเรียนของคุณ",
                html: `<p><b>${info.pretest_score}/${info.full_score}</b> คะแนน</p>
               <p>คุณสามารถเข้าสู่บทเรียนได้แล้ว</p>`,
                icon: "success",
                confirmButtonText: "เข้าสู่บทเรียน",
            }).then((result) => {
                if (result.isConfirmed) {
                    navigate("/lessons", { state: { subchapterId: sub.subchapter_id } });
                }
            });
        }
    };

    return (
        <section className="flex flex-col min-h-screen">
            <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

            <div className="flex-1 p-8 pt-32 w-full overflow-y-auto">
                <div className="m-6 flex flex-col md:flex-row justify-between md:items-center px-6 border border-gray-100 p-2 rounded-lg">
                    <div className="flex flex-col">
                        <div className="border-l-4 border-blue-500 pl-4">
                            <h1 className="md:text-3xl font-bold text-gray-700">
                                {chapterName}
                            </h1>
                            <div className="py-1 text-gray-600 md:text-md">
                                จำนวนบทเรียนทั้งหมด: {subchapters.length} บทเรียน
                            </div>
                        </div>
                    </div>
                </div>

                {/* แสดงบทเรียน */}
                <div id="subchapter_list" className="col">
                    <div className="m-5">
                        {subchapters.length > 0 ? (
                            subchapters.map((sub, index) => {
                                const info = pretestData[sub.subchapter_id];
                                const prevSub = subchapters[index - 1];
                                const prevInfo = prevSub
                                    ? pretestData[prevSub.subchapter_id]
                                    : null;

                                const isLocked = sub.is_locked === true || sub.is_locked === "1";

                                return (
                                    <div
                                        key={sub.subchapter_id}
                                        onClick={() =>
                                            !isLocked && handleSubchapterClick(sub, index)
                                        }
                                        className={`block bg-white p-4 m-4 rounded-xl border border-gray-200 ${isLocked
                                            ? "opacity-50 cursor-not-allowed"
                                            : "hover:shadow-lg hover:border-blue-400 cursor-pointer"
                                            }`}
                                    >
                                        <div className="flex items-center justify-between gap-4">
                                            {/* ชื่อบทเรียน */}
                                            <div className="flex items-center gap-2 w-full lg:w-auto">
                                                <img
                                                    src={image1}
                                                    alt={sub.subchapter_name}
                                                    className="w-8 h-10 object-contain"
                                                />
                                                <div>
                                                    <h2 className="md:text-2xl font-bold text-blue-800">
                                                        {sub.subchapter_name}
                                                    </h2>
                                                    <p className="text-gray-600 text-sm">{sub.subchapter_description}</p>
                                                </div>
                                            </div>

                                            {/* แสดงสถานะล็อก/ปลดล็อก */}
                                            {isLocked ? (
                                                <span className="text-sm text-red-600 font-semibold flex items-center gap-1">
                                                    🔒 Locked
                                                </span>
                                            ) : (
                                                <span className="text-sm text-green-600 font-semibold flex items-center gap-1">
                                                    🔓 Unlocked
                                                </span>
                                            )}
                                        </div>

                                        {/* แสดงเปอร์เซ็นต์ความคืบหน้า */}
                                        <div className="mt-2 text-sm text-gray-700 font-semibold">
                                            {sub.percent > 0 ? `${sub.percent}% เรียนแล้ว` : 'ยังไม่เริ่มเรียน'}
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2 overflow-hidden">
                                            <div
                                                className={`h-2 rounded-full transition-all duration-500 ${sub.percent >= 100
                                                    ? "bg-green-500"
                                                    : sub.percent >= 50
                                                        ? "bg-blue-500"
                                                        : "bg-green-400"
                                                    }`}
                                                style={{ width: `${sub.percent}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <p className="text-center">ไม่พบข้อมูลบทเรียน</p>
                        )}
                    </div>
                </div>
            </div>

            <Footer />
        </section>
    );
};

export default ShowSubchapter;
