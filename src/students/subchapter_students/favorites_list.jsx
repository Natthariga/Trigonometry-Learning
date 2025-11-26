import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/navBar";
import Footer from "../../components/footer";
import { getUserId } from "../../js/auth";
import Swal from "sweetalert2";
import { FaTrashAlt, FaHeart } from "react-icons/fa";
import { getFavorites, deleteFavorite } from "../../api/students/subchapter";

const FavoriteLessons = () => {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const studentId = getUserId();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchFavorites = async () => {
            try {
                const data = await getFavorites(studentId);
                if (data.status === "success") {
                    setFavorites(data.favorites);
                } else {
                    setFavorites([]);
                }
            } catch (error) {
                console.error("Error fetching favorites:", error);
                setFavorites([]);
            }
            setLoading(false);
        };

        if (studentId) fetchFavorites();
    }, [studentId]);

    const handleDeleteFavorite = async (fav) => {
        Swal.fire({
            title: "ยืนยันการลบ?",
            text: `คุณต้องการลบ "${fav.subchapter_name}" ออกจากบทเรียนที่ชอบหรือไม่?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "ใช่, ลบออก",
            cancelButtonText: "ยกเลิก",
            confirmButtonColor: "#d33",
            cancelButtonColor: "#6c757d",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const data = await deleteFavorite({ id: fav.id, user_id: fav.user_id });
                    if (data.status === "success") {
                        Swal.fire("ลบแล้ว!", "เนื้อหานี้ถูกลบออกจากบทเรียนที่ชอบ", "success");
                        setFavorites((prev) => prev.filter((f) => f.id !== fav.id));
                    } else {
                        Swal.fire("ผิดพลาด", data.message || "ไม่สามารถลบได้", "error");
                    }
                } catch (err) {
                    console.error(err);
                    Swal.fire("ผิดพลาด", "เกิดข้อผิดพลาดในการลบ", "error");
                }
            }
        });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <span className="text-gray-500 text-lg animate-pulse">
                    กำลังโหลดข้อมูล...
                </span>
            </div>
        );
    }

    return (
        <section className="flex flex-col min-h-screen">
            <Sidebar />
            <div className="flex-1 p-8 pt-32 w-full overflow-y-auto max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                        บทเรียนที่ชอบ
                    </h1>
                    <span className="text-gray-500 text-lg">
                        รวมทั้งหมด {favorites.length} รายการ
                    </span>
                </div>

                {/* Content */}
                {favorites.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <FaHeart className="text-gray-300 text-6xl mb-4" />
                        <p className="text-gray-500 text-lg">
                            คุณยังไม่มีบทเรียนที่ชอบ
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {favorites.map((fav) => (
                            <div
                                key={fav.id}
                                className="bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-200 p-5 flex flex-col sm:flex-row justify-between items-center gap-4 transition"
                            >
                                <div
                                    className="flex flex-col sm:flex-row items-center gap-4 cursor-pointer flex-1"
                                    onClick={() =>
                                        navigate("/lessons", {
                                            state: { subchapterId: fav.subchapter_id },
                                        })
                                    }
                                >
                                    <div className="flex flex-col text-center sm:text-left">
                                        <h2 className="text-lg font-semibold text-gray-800 hover:text-blue-600 transition">
                                            {fav.subchapter_name}
                                        </h2>
                                        {fav.subchapter_description && (
                                            <p className="text-gray-500 text-sm mt-1 line-clamp-2">
                                                {fav.subchapter_description}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <button
                                    className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-full text-sm whitespace-nowrap"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteFavorite(fav);
                                    }}
                                >
                                    <FaTrashAlt /> ลบออกจากรายการ
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <Footer />
        </section>
    );
};

export default FavoriteLessons;
