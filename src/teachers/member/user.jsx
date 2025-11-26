import React, { useState, useEffect } from "react";
import Sidebar from "../../components/sidebarAdmin";
import SearchAndSort from "../../components/search";
import AddUserPopup from "./add_user";
import { FaCheckCircle, FaTimesCircle, FaPlus } from "react-icons/fa";
import { Pencil, Trash2 } from "lucide-react";
import EditProfileModal from "./edit_user";
import Swal from "sweetalert2";
import { getUsers, deleteUser } from "../../api/teachers/member";

const MemberList = () => {
    const [users, setUsers] = useState([]);
    const [filterRole, setFilterRole] = useState("student");
    const [openPopup, setOpenPopup] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);

    const [sortOption, setSortOption] = useState("desc");
    const sortOptions = [
        { value: "desc", label: "ลำดับ" },
        { value: "name", label: "เรียงตามชื่อ (ก-ฮ)" },
        { value: "classroom", label: "ห้องเรียน" },
    ];
    const showClassroom = filterRole === "all" || filterRole === "student";
    const showTeacher = filterRole === "all" || filterRole === "student";

    const openModal = (userId) => {
        setSelectedUserId(userId);
        setIsModalOpen(true);
    };

    // โหลด user
    useEffect(() => {
        getUsers()
            .then((data) => setUsers(data))
            .catch((error) => console.error("Error fetching students:", error));
    }, []);


    // ลบ user
    const handleDelete = async (id) => {
        const result = await Swal.fire({
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "ใช่ ลบเลย",
            cancelButtonText: "ยกเลิก",
            text: "คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้นี้?",
        });

        if (!result.isConfirmed) return;

        try {
            const data = await deleteUser(id);

            if (data.status === "success") {
                setUsers((prev) => prev.filter((user) => user.user_id !== id));
                Swal.fire({
                    icon: "success",
                    title: "ลบผู้ใช้สำเร็จ",
                    timer: 1500,
                    showConfirmButton: false,
                });
            } else {
                Swal.fire({
                    icon: "error",
                    title: "ลบผู้ใช้ไม่สำเร็จ",
                    text: data.message,
                });
            }
        } catch (error) {
            console.error("เกิดข้อผิดพลาดในการลบผู้ใช้:", error);
            Swal.fire({
                icon: "error",
                title: "เกิดข้อผิดพลาด",
                text: "เกิดข้อผิดพลาดในการลบผู้ใช้",
            });
        }
    };

    // ✅ รวม user_id ซ้ำ + รวม classroom_name เป็น array
    const mergedUsers = Object.values(
        users.reduce((acc, user) => {
            if (!acc[user.user_id]) {
                acc[user.user_id] = { ...user, classrooms: new Set() };
            }
            if (user.classroom_name) {
                acc[user.user_id].classrooms.add(user.classroom_name.replace(/^ห้อง\s*/, ""));
            }
            return acc;
        }, {})
    ).map((u) => ({ ...u, classrooms: Array.from(u.classrooms) }));


    const filteredUsers = mergedUsers
        .filter(
            (user) =>
                (filterRole === "all" ? true : user.role === filterRole) &&
                (user.name.toLowerCase().includes(searchTerm.toLowerCase()))
        )
        .sort((a, b) => {
            switch (sortOption) {
                case "name":
                    return a.name.localeCompare(b.name, "th");
                case "classroom":
                    return (a.classrooms.join(", ") || "").localeCompare(
                        b.classrooms.join(", ") || "",
                        "th",
                        { numeric: true }
                    );
                case "desc":
                    return parseInt(b.user_id) - parseInt(a.user_id);
                default:
                    return 0;
            }
        });

    return (
        <section className="flex min-h-screen">
            <Sidebar />
            <div className="p-8 w-full">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-4 mt-4 md:mt-0">
                    <div className="w-full mb-2">
                        <h2 className="text-[22px] font-semibold text-gray-800">
                            รายชื่อสมาชิกทั้งหมด
                        </h2>
                        <p className="text-[12px] text-gray-600 mt-1 pl-2">
                            จำนวนสมาชิก: {filteredUsers.length} คน
                        </p>
                    </div>

                    <div className="w-full sm:w-auto">
                        <SearchAndSort
                            searchTerm={searchTerm}
                            setSearchTerm={setSearchTerm}
                            sortValue={sortOption}
                            onSortChange={(v) => setSortOption(v)}
                            sortOptions={sortOptions}
                        />
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-100 p-6">
                    <div className="flex justify-between items-center mb-4">
                        <div className="space-x-2 bg-white p-2">
                            {/* <button
                                onClick={() => setFilterRole("all")}
                                className={`relative px-3 py-1 rounded  transition ${filterRole === "all"
                                    ? "text-blue-800 after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-full after:h-[2px] after:bg-blue-400"
                                    : "text-gray-700"
                                    }`}
                            >
                                ทั้งหมด
                            </button> */}
                            <button
                                onClick={() => setFilterRole("student")}
                                className={`relative px-3 py-1 rounded transition ${filterRole === "student"
                                    ? "text-blue-800 after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-full after:h-[2px] after:bg-blue-400"
                                    : "text-gray-700"
                                    }`}
                            >
                                นักเรียน
                            </button>
                            <button
                                onClick={() => setFilterRole("teacher")}
                                className={`relative px-3 py-1 rounded transition ${filterRole === "teacher"
                                    ? "text-blue-800 after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-full after:h-[2px] after:bg-blue-400"
                                    : "text-gray-700"
                                    }`}
                            >
                                ครู
                            </button>
                        </div>

                        <button
                            onClick={() => setOpenPopup(true)}
                            className="flex justify-center items-center w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow transition duration-200 transform hover:scale-105"
                        >
                            <FaPlus className="w-4 h-4" />
                        </button>
                    </div>
                    <hr className="pb-4 border-gray-200" />

                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm bg-white rounded-md">
                            <thead className="text-gray-700 text-center">
                                <tr className="">
                                    <th className="text-center px-4 py-2 whitespace-nowrap"></th>
                                    <th className="text-center px-4 py-2 whitespace-nowrap">ชื่อ</th>
                                    <th className="text-center px-4 py-2 whitespace-nowrap">บัญชีผู้ใช้</th>
                                    {showClassroom && (
                                        <th className="text-center px-4 py-2 whitespace-nowrap">ห้องเรียน</th>
                                    )}
                                    {showTeacher && (
                                        <th className="text-center px-4 py-2 whitespace-nowrap">ครูผู้สอน</th>
                                    )}
                                    <th className="">สถานะ</th>
                                    <th className=""></th>
                                </tr>
                            </thead>
                            <tbody className="text-left">
                                {filteredUsers.map((user, index) => (
                                    <tr key={user.user_id} className="text-gray-600 add:bg-white even:bg-gray-100">
                                        <td className="px-4 py-2 text-gray-500 text-center">{index + 1}</td>
                                        <td className="px-6 py-2 whitespace-nowrap">{user.name}</td>
                                        <td className="px-6 py-2 whitespace-nowrap text-center">{user.username}</td>
                                        {showClassroom && (
                                            <td className="px-4 py-2 text-center whitespace-nowrap">
                                                {user.classrooms.length > 0
                                                    ? user.classrooms.join(", ")
                                                    : "-"}
                                            </td>
                                        )}
                                        {showTeacher && (
                                            <td className="px-4 py-2 text-center whitespace-nowrap">
                                                {user.role === "teacher" ? "-" : user.teacher_name || "-"}
                                            </td>
                                        )}

                                        <td className="px-4 py-2 text-center whitespace-nowrap">
                                            {user.status === "active" ? (
                                                <span className="text-green-700 inline-flex items-center gap-1 px-1 py-1 text-[10px] rounded">
                                                    <FaCheckCircle className="w-3 h-3" /> กำลังใช้งาน
                                                </span>
                                            ) : (
                                                <span className="text-red-700 inline-flex items-center gap-1 px-2 py-1 text-[10px] rounded">
                                                    <FaTimesCircle className="w-3 h-3" /> ปิดการใช้งาน
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-2 flex gap-3 justify-center text-sm">
                                            <button
                                                className="text-blue-600 hover:text-blue-700"
                                                title="แก้ไข"
                                                onClick={() => openModal(user.user_id)}
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user.user_id)}
                                                className="text-red-500 hover:text-red-700"
                                                title="ลบ"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredUsers.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={showClassroom ? 7 : 5}
                                            className="text-center pt-12 text-gray-500"
                                        >
                                            ไม่พบผู้ใช้งาน
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <AddUserPopup
                    isOpen={openPopup}
                    onClose={() => setOpenPopup(false)}
                    onAddUser={(newUser) => {
                        setUsers(prev => [...prev, newUser]);
                    }} />

                <EditProfileModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    userId={selectedUserId}
                    onUpdateUser={(updatedUser) => {
                        setUsers((prev) =>
                            prev.map((user) =>
                                user.user_id === updatedUser.id
                                    ? { ...user, ...updatedUser }
                                    : user
                            )
                        );
                    }}
                />
            </div>
        </section>
    );
};

export default MemberList;