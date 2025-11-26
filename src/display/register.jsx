import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import '../style/register.css';
import mainBg from "../assets/main.png";
import { registerStudentApi } from "../api/auth";

const Register = () => {
    const [student_id, setStudentId] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        // ตรวจสอบรูปแบบรหัสนักเรียน
        const idPattern = /^[0-9]{5}$/;
        if (!idPattern.test(student_id)) {
            Swal.fire({
                icon: 'error',
                title: 'รหัสนักเรียนไม่ถูกต้อง',
                text: 'รหัสนักเรียนต้องเป็นตัวเลข 5 หลักเท่านั้น'
            });
            return;
        }

        try {
            const data = await registerStudentApi({ student_id, password });

            if (data.status === "success") {
                Swal.fire({
                    icon: 'success',
                    title: 'สมัครสมาชิกสำเร็จ',
                    text: 'คุณสามารถเข้าสู่ระบบเพื่อเริ่มเรียนได้',
                    confirmButtonText: 'ไปหน้าเข้าสู่ระบบ'
                }).then(() => {
                    navigate("/login");
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'สมัครไม่สำเร็จ',
                    text: data.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก'
                });
            }
        } catch (err) {
            console.error(err);
            Swal.fire({
                icon: 'error',
                title: 'เกิดข้อผิดพลาด',
                text: 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้'
            });
        }
    };

    return (
        <div
            style={{
                backgroundImage: `url(${mainBg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }}
            className="flex justify-center items-center min-h-screen p-4"
        >
            <div className="flex flex-col md:flex-row w-full max-w-4xl rounded-xl shadow-lg overflow-hidden bg-white/80 backdrop-blur-md">
                {/* ซ้าย */}
                <div className="w-full md:w-1/2 p-8 flex flex-col justify-center items-center text-center bg-blue-500">
                    <h2 className="text-4xl text-white font-bold mb-4">เริ่มต้นใช้งาน</h2>
                    <p className="!text-white text-md mb-6">
                        หากคุณมีบัญชีอยู่แล้ว<br />สามารถเข้าสู่ระบบเพื่อเริ่มต้นการเรียนรู้ได้ทันที
                    </p>
                    <Link to="/login">
                        <button
                            id='login'
                            className="bg-white hover:bg-blue-400 hover:text-white px-6 py-2 rounded"
                        >
                            เข้าสู่ระบบ
                        </button>
                    </Link>
                </div>

                {/* ขวา - ฟอร์มสมัคร */}
                <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
                    <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center md:text-center">
                        สมัครสมาชิก
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-lg">รหัสนักเรียน</label>
                            <input
                                type="text"
                                value={student_id}
                                onChange={(e) => setStudentId(e.target.value)}
                                maxLength={5}
                                className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-lg">รหัสผ่าน</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
                                required
                            />
                        </div>

                        <button
                            id="sign_up"
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg py-2 rounded"
                        >
                            สมัครสมาชิก
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;
