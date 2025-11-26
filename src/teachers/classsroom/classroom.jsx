import React, { useEffect, useState } from "react";
import Sidebar from "../../components/sidebarAdmin";
import { getUserId } from "../../js/auth";
import { useNavigate } from "react-router-dom";
import { FaUserGraduate, FaChalkboardTeacher, FaPlus, FaSchool } from "react-icons/fa";
import Swal from "sweetalert2";
import {
    getTeacherClassrooms,
    getAllClassrooms,
    createClassroom,
    assignClassroomToTeacher,
} from "../../api/teachers/classroom";

const ClassroomList = () => {
    const navigate = useNavigate();
    const [classrooms, setClassrooms] = useState([]);
    const [showCreatePopup, setShowCreatePopup] = useState(false);
    const [showAssignPopup, setShowAssignPopup] = useState(false);

    const [newClassroomName, setNewClassroomName] = useState("");
    const [allClassrooms, setAllClassrooms] = useState([]);
    const [selectedClassroom, setSelectedClassroom] = useState("");

    const fetchClassrooms = async () => {
        const teacherId = getUserId();
        if (!teacherId) return;

        try {
            const res = await getTeacherClassrooms(teacherId);
            if (res.status === "success") {
                setClassrooms(res.data);
            }
        } catch (err) {
            console.error("Error fetching teacher classrooms:", err);
        }
    };

    useEffect(() => {
        fetchClassrooms();
    }, []);

    // โหลดห้องเรียนทั้งหมด
    useEffect(() => {
        if (showAssignPopup) {
            getAllClassrooms()
                .then((res) => {
                    if (res.status === "success") {
                        setAllClassrooms(res.data);
                    }
                })
                .catch((err) => console.error("Error fetching all classrooms:", err));
        }
    }, [showAssignPopup]);

    // เพิ่มห้องเรียนใหม่
    const handleCreateClassroom = async () => {
        try {
            const res = await createClassroom(newClassroomName);
            if (res.status === "success") {
                Swal.fire({
                    icon: "success",
                    title: "สำเร็จ",
                    text: res.message,
                    timer: 1500,
                    showConfirmButton: false,
                });
                setShowCreatePopup(false);
                setNewClassroomName("");
                fetchClassrooms();
            } else if (res.status === "duplicate") {
                Swal.fire({
                    icon: "warning",
                    title: "ซ้ำ!",
                    text: res.message,
                });
            } else {
                Swal.fire({
                    icon: "error",
                    title: "ผิดพลาด",
                    text: res.message || "ไม่สามารถเพิ่มห้องเรียนได้",
                });
            }
        } catch (err) {
            console.error("Axios Error:", err.message);
            Swal.fire({
                icon: "error",
                title: "ผิดพลาด",
                text: "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้",
            });
        }
    };

    // ผูกห้องกับครู
    const handleAssignClassroom = async () => {
        const teacherId = getUserId();
        try {
            const res = await assignClassroomToTeacher(teacherId, selectedClassroom);
            if (res.status === "success") {
                Swal.fire({
                    icon: "success",
                    title: "สำเร็จ",
                    text: "เพิ่มห้องเรียนที่สอนเรียบร้อยแล้ว",
                    timer: 1500,
                    showConfirmButton: false,
                });
                setShowAssignPopup(false);
                setSelectedClassroom("");
                fetchClassrooms();
            } else {
                Swal.fire({
                    icon: "warning",
                    title: "แจ้งเตือน",
                    text: res.message || "ไม่สามารถเพิ่มห้องเรียนที่สอนได้",
                });
            }
        } catch (err) {
            Swal.fire({
                icon: "error",
                title: "ผิดพลาด",
                text: "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้",
            });
        }
    };


    return (
        <section className="flex h-screen w-full">
            <Sidebar />
            <div className="p-8 w-full">
                <div className="flex flex-col md:flex-row items-center justify-between mb-6 mt-6 md:mt-0">
                    <h1 className="text-2xl font-bold text-blue-800 mb-2 inline-flex gap-1"><FaSchool className="text-blue-950 md:hidden" />ห้องเรียนที่ฉันสอน</h1>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowCreatePopup(true)}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                        >
                            <FaPlus /> เพิ่มห้องเรียนใหม่
                        </button>
                        <button
                            onClick={() => setShowAssignPopup(true)}
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
                        >
                            <FaPlus /> เพิ่มห้องที่ฉันสอน
                        </button>
                    </div>
                </div>

                {/* ห้องเรียน */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {classrooms.map((room) => (
                        <div
                            key={room.id}
                            className="relative bg-white p-6 rounded-2xl shadow-lg  hover:shadow-xl transition-transform transform hover:scale-105"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <FaChalkboardTeacher className="text-blue-500 text-2xl" />
                                <h2 className="text-xl font-semibold text-gray-800">
                                    {room.classroom_name}
                                </h2>
                            </div>
                            <div className="flex flex-col items-center py-4">
                                <FaUserGraduate className="text-blue-500 text-4xl mb-2" />
                                <p className="text-gray-600 text-sm">นักเรียนทั้งหมด</p>
                                <p className="text-lg font-bold text-gray-800">
                                    {room.student_count || 0} คน
                                </p>
                            </div>
                            <button
                                className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition"
                                onClick={() =>
                                    navigate("/teacher/classroom/member", {
                                        state: { classroomId: room.id },
                                    })
                                }
                            >
                                ดูสมาชิกทั้งหมด
                            </button>
                        </div>
                    ))}
                </div>

                {/* Popup สร้างห้อง */}
                {showCreatePopup && (
                    <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 z-50">
                        <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-lg">
                            <h2 className="text-xl font-bold mb-4 text-gray-800">เพิ่มห้องเรียนใหม่</h2>

                            {/* เลือก ม. และกรอกเลขห้อง */}
                            <div className="flex items-center gap-2 mb-4">
                                <select
                                    onChange={(e) => {
                                        const level = e.target.value;
                                        const current = newClassroomName.split("/")[1] || "";
                                        setNewClassroomName(level ? `ม.${level}${current ? `/${current}` : ""}` : "");
                                    }}
                                    className="border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">เลือกชั้น</option>
                                    <option value="4">ม.4</option>
                                    <option value="5">ม.5</option>
                                    <option value="6">ม.6</option>
                                </select>

                                <span className="text-gray-600">/</span>

                                <input
                                    type="number"
                                    min="1"
                                    onChange={(e) => {
                                        const room = e.target.value;
                                        const levelPart = newClassroomName.split("/")[0] || "";
                                        setNewClassroomName(levelPart ? `${levelPart}/${room}` : room ? `ม./${room}` : "");
                                    }}
                                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="เลขห้อง เช่น 2"
                                />
                            </div>

                            {/* แสดงชื่อห้องที่กำลังจะสร้าง */}
                            <p className="text-sm text-gray-500 mb-4">
                                ระบบจะสร้างชื่อห้องเรียนเป็น <b>{newClassroomName || "ม.../..."}</b>
                            </p>

                            <div className="flex justify-end gap-3">
                                <button
                                    className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
                                    onClick={() => setShowCreatePopup(false)}
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                                    onClick={handleCreateClassroom}
                                    disabled={!newClassroomName.includes("/")}
                                >
                                    บันทึก
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Popup เพิ่มห้องเรียนของครู */}
                {showAssignPopup && (
                    <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 z-50">
                        <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-lg">
                            <h2 className="text-xl font-bold mb-4 text-gray-800">เพิ่มห้องที่ฉันสอน</h2>
                            <select
                                value={selectedClassroom}
                                onChange={(e) => setSelectedClassroom(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                                <option value="">-- เลือกห้องเรียน --</option>
                                {allClassrooms.map((room) => (
                                    <option key={room.id} value={room.id}>
                                        {room.classroom_name}
                                    </option>
                                ))}
                            </select>
                            <div className="flex justify-end gap-3">
                                <button
                                    className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
                                    onClick={() => setShowAssignPopup(false)}
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white"
                                    onClick={handleAssignClassroom}
                                    disabled={!selectedClassroom}
                                >
                                    บันทึก
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default ClassroomList;