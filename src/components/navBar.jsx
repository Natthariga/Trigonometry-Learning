import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
    ChevronDownIcon,
    UserCircle,
    Bell,
    Heart,
    LogOut,
    Menu,
    X,
} from "lucide-react";
import Swal from "sweetalert2";
import logo from "../assets/logo-light.png";
import { logout, getUserId } from "../js/auth";
import { getFileUrl } from '../js/getFileUrl';

const Sidebar = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [profilePic, setProfilePic] = useState("");
    const [classroomName, setClassroomName] = useState("");
    const [openMenu, setOpenMenu] = useState(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const userId = getUserId();
    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem("username"));
        if (userData) {
            setName(`${userData.first_name} ${userData.last_name}`);
            setEmail(userData.email);
            setProfilePic(userData.picture_profile);
            setClassroomName(userData.classroom || "ยังไม่ได้เข้าห้องเรียน");
        }
    }, []);

    const handleLogout = () => {
        Swal.fire({
            text: "คุณต้องการออกจากระบบหรือไม่?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "ออกจากระบบ",
            cancelButtonText: "ยกเลิก",
        }).then((result) => {
            if (result.isConfirmed) {
                logout();
                navigate("/login");
            }
        });
    };

    const isActive = (path) => location.pathname === path;

    return (
        <div className="fixed top-0 left-0 w-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-md z-50 p-6">
            <div className="max-w-screen-xl mx-auto flex justify-between items-center">
                <div className="flex items-center justify-between gap-6 w-full">
                    <Link to="/">
                        <img src={logo} alt="Logo" className="h-12 w-auto" />
                    </Link>
                    <div className="hidden lg:flex gap-10 items-center text-lg font-bold pr-6">
                        <Link
                            to="/home"
                            className={`relative px-2 py-1 transition-colors duration-200 hover:text-yellow-300 ${isActive("/home")
                                ? "after:absolute after:left-0 after:right-0 after:-bottom-0.5 after:h-[2px] after:bg-blue-400 content-['']"
                                : ""
                                }`}
                        >
                            หน้าหลัก
                        </Link>

                        {/* บทเรียน */}
                        <Link
                            to={`/subchapter`}
                            className={`flex items-center gap-1 hover:text-yellow-300 relative px-2 py-1 transition-colors duration-200 ${isActive("/subchapter")
                                ? "after:absolute after:left-0 after:right-0 after:-bottom-0.5 after:h-[2px] after:bg-blue-400 content-['']"
                                : ''
                                }`}
                        >
                            บทเรียน
                        </Link>

                        {/* แบบทดสอบ */}
                        <Link
                            to={`/exams`}
                            className={`flex items-center gap-1 hover:text-yellow-300 transition-colors duration-200 ${isActive(`/exams`)
                                ? "text-yellow-300 font-bold border-b-2 border-yellow-300"
                                : "text-white"
                                }`}
                        >
                            แบบทดสอบ
                        </Link>


                        <Link
                            to="/sheet"
                            className={`relative px-2 py-1 transition-colors duration-200 hover:text-yellow-300 ${isActive("/sheet")
                                ? "after:absolute after:left-0 after:right-0 after:-bottom-0.5 after:h-[2px] after:bg-blue-400 content-['']"
                                : ""
                                }`}
                        >
                            ชีทสรุป
                        </Link>

                        {/* <Link to="" className="hover:text-yellow-300">
                            เกมตรีโกณมิติ
                        </Link> */}
                        <Link
                            to={`/evolution/`}
                            className={`relative px-2 py-1 transition-colors duration-200 hover:text-yellow-300 ${isActive("/evolution/")
                                ? "after:absolute after:left-0 after:right-0 after:-bottom-0.5 after:h-[2px] after:bg-blue-400 content-['']"
                                : ""
                                }`} >
                            พัฒนาการ
                        </Link>
                    </div>
                </div>

                {/* User Info Dropdown */}
                <div className="relative hidden lg:block">
                    <button onClick={() => setOpenMenu(openMenu === "user" ? null : "user")} className="flex items-center gap-2 focus:outline-none">
                        {profilePic ? (
                            <img
                                src={getFileUrl(profilePic)}
                                alt="Profile"
                                className="w-8 h-8 rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-300" />
                        )}
                        <ChevronDownIcon className="w-4 h-4 text-white" />
                    </button>

                    {openMenu === "user" && (
                        <div className="absolute right-0 mt-2 w-60 bg-white text-black rounded shadow-lg z-50">
                            <div className="px-4 py-3 border-b border-gray-200">
                                <p className="text-sm font-medium">{name}</p>
                                <p className="text-xs text-gray-500">{email}</p>
                                <p className="text-xs text-gray-500 mt-1">{classroomName}</p>
                            </div>
                            <ul>
                                <li>
                                    <Link to="/editprofile"
                                        className={`flex items-center gap-2 px-4 py-2 hover:bg-gray-100 ${isActive(`/editprofile/`) ? "text-blue-500" : ""}`}>
                                        <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center text-white">
                                            <UserCircle className="w-4 h-4" />
                                        </div>
                                        แก้ไขโปรไฟล์
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/notifications"
                                        className={`flex items-center gap-2 px-4 py-2 hover:bg-gray-100 ${isActive(`/notifications/`) ? "text-blue-500" : ""}`}>
                                        <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center text-white">
                                            <Bell className="w-4 h-4" />
                                        </div>
                                        การแจ้งเตือน
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/favorites"
                                        className={`flex items-center gap-2 px-4 py-2 hover:bg-gray-100 ${isActive(`/favorites/`) ? "text-blue-500" : ""}`}>
                                        <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center text-white">
                                            <Heart className="w-4 h-4" />
                                        </div>
                                        บทเรียนที่ชอบ
                                    </Link>
                                </li>

                                <li>
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-gray-100"
                                    >
                                        <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center text-white">
                                            <LogOut className="w-4 h-4" />
                                        </div>
                                        ออกจากระบบ
                                    </button>
                                </li>
                            </ul>
                        </div>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="lg:hidden flex items-center text-white"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
                </button>
            </div>

            {/* ===== Overlay ===== */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-opacity-30 z-40"
                    onClick={() => setIsMobileMenuOpen(false)}
                ></div>
            )}

            {/* ===== Mobile Slide-in Menu ===== */}
            <div
                className={`fixed top-24 right-0 w-full h-[calc(100vh-4rem)] bg-black/80 text-white shadow-lg transform transition-transform duration-300 ease-in-out z-50
                    ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"}`}
            >
                <div className="flex flex-col p-6 gap-3">
                    <Link
                        to="/home"
                        onClick={toggleMobileMenu}
                        className={`w-full text-center py-3 font-semibold rounded-lg  transition-colors duration-200 ${isActive("/home") ? "bg-blue-700 text-yellow-300" : "text-white hover:bg-blue-700"
                            }`}
                    >
                        หน้าหลัก
                    </Link>

                    <Link
                        to="/subchapter"
                        onClick={toggleMobileMenu}
                        className={`w-full text-center py-3 font-semibold rounded-lg shadow transition-colors duration-200 ${isActive("/subchapter") ? "bg-blue-700 text-yellow-300" : "text-white hover:bg-blue-700"
                            }`}
                    >
                        บทเรียน
                    </Link>

                    <Link
                        to="/exams"
                        onClick={toggleMobileMenu}
                        className={`w-full text-center py-3 font-semibold rounded-lg shadow transition-colors duration-200 ${isActive("/exams") ? "bg-blue-700 text-yellow-300" : "text-white hover:bg-blue-700"
                            }`}
                    >
                        แบบทดสอบ
                    </Link>

                    <Link
                        to="/sheet"
                        onClick={toggleMobileMenu}
                        className={`w-full text-center py-3 font-semibold rounded-lg shadow transition-colors duration-200 ${isActive("/sheet") ? "bg-blue-700 text-yellow-300" : "text-white hover:bg-blue-700"
                            }`}
                    >
                        ชีทสรุป
                    </Link>

                    <Link
                        to="/evolution"
                        onClick={toggleMobileMenu}
                        className={`w-full text-center py-3 font-semibold rounded-lg shadow transition-colors duration-200 ${isActive("/evolution") ? "bg-blue-700 text-yellow-300" : "text-white hover:bg-blue-700"
                            }`}
                    >
                        พัฒนาการ
                    </Link>

                    <hr className="my-3 border-gray-300" />

                    <Link
                        to="/editprofile"
                        onClick={toggleMobileMenu}
                        className={`w-full text-center py-3 font-semibold rounded-lg shadow transition-colors duration-200 ${isActive("/editprofile") ? "bg-gray-300 text-blue-700" : "text-white hover:bg-gray-400"
                            }`}
                    >
                        แก้ไขโปรไฟล์
                    </Link>

                    <Link
                        to="/notifications"
                        onClick={toggleMobileMenu}
                        className={`w-full text-center py-3 font-semibold rounded-lg shadow transition-colors duration-200 ${isActive("/notifications") ? "bg-gray-300 text-blue-700" : "text-white hover:bg-gray-400"
                            }`}
                    >
                        การแจ้งเตือน
                    </Link>

                    <Link
                        to="/favorites"
                        onClick={toggleMobileMenu}
                        className={`w-full text-center py-3 font-semibold rounded-lg shadow transition-colors duration-200 ${isActive("/favorites") ? "bg-gray-300 text-blue-700" : "text-white hover:bg-gray-400"
                            }`}
                    >
                        บทเรียนที่ชอบ
                    </Link>

                    <button
                        onClick={() => {
                            handleLogout()
                            toggleMobileMenu();
                        }}
                        className="w-full text-center py-3 text-white font-semibold rounded-lg shadow hover:bg-red-500 transition-colors duration-200"
                    >
                        ออกจากระบบ
                    </button>
                </div>

            </div>
        </div>
    );
};
export default Sidebar;
