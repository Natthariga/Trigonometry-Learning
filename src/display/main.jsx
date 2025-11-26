import { Link, useNavigate } from "react-router-dom";
import React, { useEffect, useState } from 'react';
import { Button, Modal } from "react-bootstrap";
import mainBg from "../assets/main.png";
import logo from "../assets/logo.png";
import vdo from "../assets/vdo_icon.png";
import quiz from "../assets/quiz_icon.png";
import graph from "../assets/graph_icon.png";
import key from "../assets/key_icon.png";
import studentImg from "../assets/students.png";
import teacherImg from "../assets/teachers.png";
import '../style/main.css';
import { X } from 'lucide-react';

const MainScreen = () => {
    const [show, setShow] = useState(false);
    const [userType, setUserType] = useState("");
    const navigate = useNavigate();
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const handleSelect = (role) => {
        if (role === 'teacher') {
            navigate('/loginteacher');
        } else if (role === 'student') {
            navigate('/login');
        }
    };

    return (
        <div
            className="min-h-screen bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${mainBg})` }}
        >
            <nav className="flex justify-between p-5 pl-12">
                <div className="flex items-center">
                    <img src={logo} alt="Easy Math Logo" className="h-32 w-auto" />
                </div>
            </nav>
            <div className="flex justify-center flex-col items-center font-bold px-12">
                <p className="text-4xl mb-4">เรียนเมื่อไหร่ก็ได้ ที่ไหนก็ได้ แค่เปิดวิดีโอและลองทำแบบทดสอบ</p>
                <p className="text-3xl">ให้คณิตศาสตร์เป็นเรื่องง่าย...ในสไตล์ของคุณเอง</p>
                <div className="menu flex gap-6 my-12">
                    <button className="start border items-center p-6 px-12 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                        <Link to={'/login'}>
                            เริ่มต้นใช้งาน
                        </Link>
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div className="flex items-center gap-4">
                        <img src={vdo} alt="icon" className="h-16 w-auto rounded" />
                        <p className="text-xl font-bold">เรียนผ่านคลิปเข้าใจง่าย</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <img src={quiz} alt="icon" className="h-16 w-auto rounded bg-white border border-blue-300" />
                        <p className="text-xl font-bold">ทำแบบทดสอบก่อน/หลังเรียน</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <img src={graph} alt="icon" className="h-16 w-auto rounded" />
                        <p className="text-xl font-bold">ดูกราฟพัฒนาการได้ทันที</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <img src={key} alt="icon" className="h-16 w-auto rounded bg-white border border-blue-300" />
                        <p className="text-xl font-bold">เรียนฟรี ไม่มีโฆษณาเนื้อหาครบถ้วน</p>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default MainScreen;
