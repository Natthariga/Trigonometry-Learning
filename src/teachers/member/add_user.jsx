import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { registerUser } from "../../api/teachers/member";
import { getAllClassrooms } from "../../api/teachers/classroom";

const AddUserPopup = ({ isOpen, onClose, onAddUser }) => {
    const [form, setForm] = useState({
        role: "student",
        student_code: "",
        password: "",
        first_name: "",
        last_name: "",
        username: "",
        classroom_id: "",
    });

    const [classroomOptions, setClassroomOptions] = useState([]);

    useEffect(() => {
        const fetchClassrooms = async () => {
            try {
                const res = await getAllClassrooms();
                if (res.status === "success" && Array.isArray(res.data)) {
                    setClassroomOptions(res.data);
                }
            } catch (err) {
                console.error("โหลดห้องเรียนไม่สำเร็จ:", err);
                setClassroomOptions([]);
            }
        };
        fetchClassrooms();
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation ตาม role
        if (form.role === "student") {
            if (!form.student_code || !form.password) {
                Swal.fire("ผิดพลาด", "กรุณากรอก รหัสนักเรียน และ รหัสผ่าน", "error");
                return;
            }
        } else if (form.role === "teacher") {
            if (!form.first_name || !form.last_name || !form.username || !form.password || !form.classroom_id) {
                Swal.fire("ผิดพลาด", "กรุณากรอกข้อมูลทั้งหมดและเลือกห้องเรียน", "error");
                return;
            }
        } else if (form.role === "admin") {
            if (!form.first_name || !form.last_name || !form.username || !form.password) {
                Swal.fire("ผิดพลาด", "กรุณากรอกข้อมูลทั้งหมด", "error");
                return;
            }
        }

        try {
            const data = await registerUser(form);

            if (data.status === "success") {
                if (onAddUser && data.user) onAddUser(data.user);
                Swal.fire({
                    icon: "success",
                    title: "สำเร็จ!",
                    text: data.message,
                    timer: 1500,
                    showConfirmButton: false,
                });
                onClose();
            } else {
                Swal.fire({
                    icon: "error",
                    title: "เกิดข้อผิดพลาด",
                    text: data.message,
                });
            }
        } catch (err) {
            Swal.fire({
                icon: "error",
                title: "เกิดข้อผิดพลาด",
                text: "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้",
            });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-md w-[400px] relative shadow-lg">
                <h2 className="text-xl font-semibold mb-4">เพิ่มผู้ใช้ใหม่</h2>
                <form onSubmit={handleSubmit} className="space-y-3">
                    <select
                        name="role"
                        className="w-full border border-gray-200 px-3 py-2 rounded"
                        value={form.role}
                        onChange={handleChange}
                    >
                        <option value="student">นักเรียน</option>
                        <option value="teacher">ครู</option>
                        <option value="admin">แอดมิน</option>
                    </select>

                    {/* นักเรียน */}
                    {form.role === "student" && (
                        <>
                            <input
                                type="text"
                                name="student_code"
                                placeholder="รหัสนักเรียน"
                                className="w-full border border-gray-200 px-3 py-2 rounded"
                                onChange={handleChange}
                                required
                            />
                            <input
                                type="password"
                                name="password"
                                placeholder="รหัสผ่าน"
                                className="w-full border border-gray-200 px-3 py-2 rounded"
                                onChange={handleChange}
                                required
                            />
                        </>
                    )}

                    {/* ครู */}
                    {form.role === "teacher" && (
                        <>
                            <select
                                name="classroom_id"
                                value={form.classroom_id}
                                onChange={handleChange}
                                className="w-full border border-gray-200 px-3 py-2 rounded"
                                required
                            >
                                <option value="">-- เลือกห้องเรียน --</option>
                                {classroomOptions.map((room) => (
                                    <option key={room.id} value={room.id}>
                                        {room.classroom_name}
                                    </option>
                                ))}
                            </select>
                            <input
                                type="text"
                                name="first_name"
                                placeholder="ชื่อ"
                                className="w-full border border-gray-200 px-3 py-2 rounded"
                                onChange={handleChange}
                                required
                            />
                            <input
                                type="text"
                                name="last_name"
                                placeholder="นามสกุล"
                                className="w-full border border-gray-200 px-3 py-2 rounded"
                                onChange={handleChange}
                                required
                            />
                            <input
                                type="text"
                                name="username"
                                placeholder="ชื่อผู้ใช้"
                                className="w-full border border-gray-200 px-3 py-2 rounded"
                                onChange={handleChange}
                                required
                            />
                            <input
                                type="password"
                                name="password"
                                placeholder="รหัสผ่าน"
                                className="w-full border border-gray-200 px-3 py-2 rounded"
                                onChange={handleChange}
                                required
                            />
                        </>
                    )}

                    {/* แอดมิน */}
                    {form.role === "admin" && (
                        <>
                            <input
                                type="text"
                                name="first_name"
                                placeholder="ชื่อ"
                                className="w-full border border-gray-200 px-3 py-2 rounded"
                                onChange={handleChange}
                                required
                            />
                            <input
                                type="text"
                                name="last_name"
                                placeholder="นามสกุล"
                                className="w-full border border-gray-200 px-3 py-2 rounded"
                                onChange={handleChange}
                                required
                            />
                            <input
                                type="text"
                                name="username"
                                placeholder="ชื่อผู้ใช้"
                                className="w-full border border-gray-200 px-3 py-2 rounded"
                                onChange={handleChange}
                                required
                            />
                            <input
                                type="password"
                                name="password"
                                placeholder="รหัสผ่าน"
                                className="w-full border border-gray-200 px-3 py-2 rounded"
                                onChange={handleChange}
                                required
                            />
                        </>
                    )}

                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-200 rounded">
                            ยกเลิก
                        </button>
                        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
                            บันทึก
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddUserPopup;
