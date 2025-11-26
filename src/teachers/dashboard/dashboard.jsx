import React, { useState, useEffect } from 'react';
import { ChevronRight, Users, BookOpen, School, TrendingUp, Clock, Sun, Moon, CloudSun } from 'lucide-react';
import Sidebar from '../../components/sidebarAdmin';
import { getFullName, getUserRole } from '../../js/auth';
import StatGraph from './dashboard_stats';
import LearningStatsCard from './learning_stats';
import { getDashboardData } from '../../api/teachers/dashboard';
import { getFileUrl } from '../../js/getFileUrl';

export default function Dashboard() {
  const [stats, setStats] = useState({
    classroom_count: 0,
    student_count: 0,
    lesson_count: 0
  });
  const [recentLessons, setRecentLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profilePic, setProfilePic] = useState('');

  const hour = new Date().getHours();
  let GreetingIcon;
  let greetingText;
  //เช็คเวลา
  if (hour < 12) {
    GreetingIcon = Sun;
    greetingText = 'เช้า';
  } else if (hour < 18) {
    GreetingIcon = CloudSun;
    greetingText = 'บ่าย';
  } else {
    GreetingIcon = Moon;
    greetingText = 'เย็น';
  }

  //ข้อมูลทั่วไป
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const statItems = [
    { label: 'จำนวนห้องเรียน', value: stats.classroom_count, icon: School, color: 'from-blue-500 to-blue-600' },
    { label: 'จำนวนนักเรียน', value: stats.student_count, icon: Users, color: 'from-green-500 to-green-600' },
    { label: 'จำนวนบทเรียน', value: stats.lesson_count, icon: BookOpen, color: 'from-purple-500 to-purple-600' },
  ];

  const greetingPrefix = role === 'admin' ? 'คุณแอดมิน' : 'คุณครู';

  useEffect(() => {
    setName(getFullName());
    setRole(getUserRole());
  }, []);


  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await getDashboardData();

        if (res.status === 'success') {
          const { classroom_count, student_count, lesson_count, recent_lessons } = res.data;
          setStats({ classroom_count, student_count, lesson_count });
          setRecentLessons(recent_lessons);
        } else {
          setError('ไม่สามารถโหลดข้อมูลได้');
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <section className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-purple-50 to-[#F6F3FF]">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600"></div>
            <p className="mt-4 text-purple-600 animate-pulse">กำลังโหลดข้อมูล...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 overflow-hidden p-8">
        <div className="min-h-[calc(100vh-4rem)]">
          <div className="mx-auto space-y-8">

            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-800">
                    ยินดีต้อนรับ
                    <span className="text-blue-700">
                      {name ? ` ${greetingPrefix} ${name}` : greetingPrefix}
                    </span>
                  </h2>
                  {role === 'teacher' && (
                    <p className="mt-1 text-gray-600 text-sm tracking-wide">
                      สวัสดีค่ะ คุณครู พร้อมเริ่มต้นการสอนวันนี้แล้วหรือยัง?
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-2 bg-white p-2 ">
                  {profilePic ? (
                    <img
                      src={getFileUrl(profilePic)}
                      alt="Profile"
                      className="w-10 h-10 rounded-full object-cover border-2 border-blue-600 shadow-sm"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-lg select-none shadow-inner border-2 border-blue-300">
                      {name ? name.charAt(0).toUpperCase() : "ครู"}
                    </div>
                  )}
                  <div className="flex flex-col">
                    <p className="text-gray-800 font-medium leading-tight">{name || 'ครู'}</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 border-b border-gray-200" />
            </div>


            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Clock size={16} className="text-blue-500" />
                <span className="leading-none">{new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}</span>
                <span>|</span>
                <div className="flex items-center space-x-1">
                  <GreetingIcon size={14} className="text-gray-400" />
                  <span className="text-[14px] text-gray-400 leading-none">
                    สวัสดีตอน{greetingText}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-100 px-4 py-2 rounded-full">
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
            </div>


            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg shadow-sm">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {statItems.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="relative h-full bg-white rounded-2xl border border-gray-100 shadow-md overflow-hidden group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-gray-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0" />

                    <div className="relative z-10 p-6">
                      <div className="flex items-center justify-between">
                        <p className="text-gray-700 font-medium text-sm">{item.label}</p>
                        <div className={`p-2 rounded-xl bg-gradient-to-r ${item.color} shadow-md`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <p className="text-4xl font-extrabold text-gray-800 mt-4 tracking-tight">
                        {item.value}
                      </p>
                    </div>
                    <div className={`absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r ${item.color}`} />
                  </div>
                );
              })}
              <StatGraph stats={stats} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                  สถิติการเรียน
                </h3>
                <LearningStatsCard stats={stats} />
              </div>

              <div className="bg-gray-50 rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Users className="h-5 w-5 mr-2 text-blue-600" />
                  กิจกรรมล่าสุด
                </h3>
                <div className="space-y-4">
                  {recentLessons.slice(0, 5).map((lesson, idx) => (
                    <div key={idx} className="flex items-center space-x-4 p-3 rounded-lg bg-white hover:bg-gray-50 transition-colors duration-200">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <BookOpen className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {lesson.chapter_name}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {lesson.subchapter_name}
                        </p>
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(lesson.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
