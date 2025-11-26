import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import {
    HomeIcon,
    BarChart2Icon,
    FileTextIcon,
    BellIcon,
    BookOpenIcon,
    ChevronDownIcon,
    Edit3Icon,
    UsersIcon,
    SettingsIcon,
    MenuIcon,
    GitCommitVertical,
    Building,
    UserIcon,
    LogOut,
    Database,
    MessageCircleIcon
} from 'lucide-react';
import { logout } from '../js/auth';

const Sidebar = () => {
    const [open, setOpen] = useState(false);
    const [pendingCount, setPendingCount] = useState(0);
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path) => {
        return location.pathname === path || location.pathname.startsWith(`${path}/`);
    };

    const toggleSidebar = () => setOpen(!open);

    const handleLogout = () => {
        Swal.fire({
            text: "คุณต้องการออกจากระบบ?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "ออกจากระบบ",
            cancelButtonText: "ยกเลิก",
        }).then((result) => {
            if (result.isConfirmed) {
                logout();
                navigate('/login');
            }
        });
    };

    return (
        <div className='flex min-h-screen'>
            <button
                className="md:hidden fixed top-2 right-4 z-50 p-2 rounded-md bg-gray-200 text-black hover:bg-gray-400"
                onClick={toggleSidebar}
            >
                <MenuIcon />
            </button>

            {open && (
                <div
                    className="fixed inset-0 z-40 backdrop-blur-sm bg-white/10  md:hidden"
                    onClick={toggleSidebar}
                />
            )}

            <aside
                className={`fixed z-50 top-0 left-0  w-64 bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-2xl rounded-tr-3xl rounded-br-3xl h-full
                            transition-transform duration-300 md:relative md:translate-x-0 md:flex md:flex-col ${open ? 'translate-x-0' : '-translate-x-full'}`}
                style={{ borderTopRightRadius: '2rem', borderBottomRightRadius: '2rem' }}
            >

                <div className="h-16 flex flex-col justify-center items-start text-lg font-bold tracking-wide">
                    <span className="pl-16">TRIGO</span>
                    <hr className="w-full mt-2" />
                </div>


                <nav className="flex-1 overflow-y-auto text-white pl-2 pr-0 pb-4">
                    <ul className="space-y-2 overflow-hidden">
                        <li>
                            <Link
                                to="/teacher/dashboard"
                                className={`w-full flex items-center gap-3 px-4 py-3 transition-all ${isActive('/teacher/dashboard')
                                    ? 'bg-white text-blue-600 rounded-l-full shadow-md'
                                    : 'text-white hover:bg-white/10 rounded-lg'
                                    }`}
                            >
                                <HomeIcon className={`h-4 w-4 ${isActive('/teacher/dashboard') ? 'text-blue-600' : 'text-white'}`} />
                                <span>แดชบอร์ด</span>
                            </Link>

                        </li>

                        <li>
                            <Link
                                to="/teacher/member"
                                className={`w-full flex items-center gap-3 px-4 py-3 transition-all ${isActive('/teacher/member')
                                    ? 'bg-white text-blue-600 rounded-l-full shadow-md'
                                    : 'text-white hover:bg-white/10 rounded-lg'
                                    }`}
                            >
                                <UserIcon className={`h-4 w-4 ${isActive('/teacher/member') ? 'text-blue-600' : 'text-white'}`} />
                                <span>สมาชิก</span>
                            </Link>
                        </li>


                        <li>
                            <Link
                                to="/teacher/evolution"
                                className={`w-full flex items-center gap-3 px-4 py-3 transition-all ${isActive('/teacher/evolution')
                                    ? 'bg-white text-blue-600 rounded-l-full shadow-md'
                                    : 'text-white hover:bg-white/10 rounded-lg'
                                    }`}
                            >
                                <BarChart2Icon className={`h-4 w-4 ${isActive('/teacher/evolution') ? 'text-blue-600' : 'text-white'}`} />
                                <span>พัฒนาการ</span> </Link>
                        </li>
                        <li>
                            <Link
                                to="/teacher/sheet"
                                className={`w-full flex items-center gap-3 px-4 py-3 transition-all ${isActive('/teacher/sheet')
                                    ? 'bg-white text-blue-600 rounded-l-full shadow-md'
                                    : 'text-white hover:bg-white/10 rounded-lg'
                                    }`}
                            >
                                <FileTextIcon
                                    className={`h-4 w-4 ${isActive('/teacher/sheet') ? 'text-blue-600' : 'text-white'}`}
                                />
                                <span className="flex items-center">
                                    ชีทสรุป
                                    {pendingCount > 0 && (
                                        <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${isActive('/teacher/sheet')
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-white text-blue-900'
                                            }`}>
                                            {pendingCount}
                                        </span>
                                    )}
                                </span>
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/teacher/notification"
                                className={`w-full flex items-center gap-3 px-4 py-3 transition-all ${isActive('/teacher/notification')
                                    ? 'bg-white text-blue-600 rounded-l-full shadow-md'
                                    : 'text-white hover:bg-white/10 rounded-lg'
                                    }`}
                            >
                                <MessageCircleIcon
                                    className={`h-4 w-4 ${isActive('/teacher/notification') ? 'text-blue-600' : 'text-white'
                                        }`}
                                />
                                <span>ห้องแชท</span>
                            </Link>
                        </li>


                        <li>
                            <Link
                                to={'/teacher/subchapter'}
                                className={`w-full flex items-center gap-3 px-4 py-3 transition-all ${isActive('/teacher/subchapter')
                                    ? 'bg-white text-blue-600 rounded-l-full shadow-md'
                                    : 'text-white hover:bg-white/10 rounded-lg'
                                    }`}
                            >
                                <BookOpenIcon className={`h-4 w-4 ${isActive('/teacher/subchapter') ? 'text-blue-600' : 'text-white'}`} />
                                <span>บทเรียน</span>
                            </Link>

                        </li>

                        <li>
                            <Link
                                to={'/teacher/exams'}
                                className={`w-full flex items-center gap-3 px-4 py-3 transition-all ${isActive('/teacher/exams')
                                    ? 'bg-white text-blue-600 rounded-l-full shadow-md'
                                    : 'text-white hover:bg-white/10 rounded-lg'
                                    }`}
                            >
                                <BookOpenIcon className={`h-4 w-4 ${isActive('/teacher/exams') ? 'text-blue-600' : 'text-white'}`} />
                                <span>แบบทดสอบ</span>
                            </Link>

                        </li>

                        {/* <li>
                            <Link
                                to={'/teacher/article'}
                                className={`w-full flex items-center gap-3 px-4 py-3 transition-all ${isActive('/teacher/article')
                                    ? 'bg-white text-blue-600 rounded-l-full shadow-md'
                                    : 'text-white hover:bg-white/10 rounded-lg'
                                    }`}
                            >
                                <BookOpenIcon className={`h-4 w-4 ${isActive('/teacher/article') ? 'text-blue-600' : 'text-white'}`} />
                                <span>สรุปเนื้อหา</span>
                            </Link>

                        </li> */}

                        <li>
                            <Link
                                to="/teacher/student-data"
                                className={`w-full flex items-center gap-3 px-4 py-3 transition-all ${isActive('/teacher/student-data')
                                    ? 'bg-white text-blue-600 rounded-l-full shadow-md'
                                    : 'text-white hover:bg-white/10 rounded-lg'
                                    }`}
                            >
                                <Database className={`h-4 w-4 ${isActive('/teacher/student-data') ? 'text-blue-600' : 'text-white'}`} />
                                <span>ฐานข้อมูลนักเรียน</span> </Link>
                        </li>

                        <li>
                            <Link
                                to="/teacher/classroom"
                                className={`w-full flex items-center gap-3 px-4 py-3 transition-all ${isActive('/teacher/classroom')
                                    ? 'bg-white text-blue-600 rounded-l-full shadow-md'
                                    : 'text-white hover:bg-white/10 rounded-lg'
                                    }`}
                            >
                                <Building className={`h-4 w-4 ${isActive('/teacher/classroom') ? 'text-blue-600' : 'text-white'}`} />
                                <span>ห้องเรียน</span> </Link>
                        </li>


                        <li>
                            <button onClick={handleLogout} className="w-full text-left flex items-center gap-3 px-4 p-3 rounded-lg transition-all hover:bg-white/5">
                                <LogOut className="h-4 w-4" /> <span>ออกจากระบบ</span>
                            </button>
                        </li>
                    </ul>
                </nav>
            </aside>
        </div>
    );
};

export default Sidebar;