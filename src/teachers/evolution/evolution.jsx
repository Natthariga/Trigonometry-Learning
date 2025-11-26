import React, { useEffect, useState, useMemo } from "react";
import Sidebar from "../../components/sidebarAdmin";
import SearchAndSort from "../../components/search";
import VideoChart from "./charts/VideoChart";
import QuizChart from "./charts/QuizChart";
import { getAllClassrooms, getStudentSummary } from "../../api/teachers/evolution";
import { getSubchapters } from "../../api/teachers/subchapter";

export default function ProgressDashboard() {
    const [students, setStudents] = useState([]);
    const [classrooms, setClassrooms] = useState([]);
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);

    const [room, setRoom] = useState("all");
    const [selectedStudent, setSelectedStudent] = useState("all");
    const [selectedLesson, setSelectedLesson] = useState("all");

    //ค้นหา
    const [searchTerm, setSearchTerm] = useState("");
    const [sortOption, setSortOption] = useState("desc");
    const sortOptions = [
        { value: "desc", label: "ลำดับ" },
        { value: "name", label: "เรียงตามชื่อ (ก-ฮ)" },
        { value: "pre", label: "คะแนน Pre" },
        { value: "post", label: "คะแนน Post" },
    ];

    // โหลดห้องเรียน
    useEffect(() => {
        getAllClassrooms()
            .then((res) => {
                if (res.status === "success") setClassrooms(res.data);
            })
            .catch((err) => console.error("Error fetching classrooms:", err));
    }, []);

    // โหลดบทเรียน
    useEffect(() => {
        getSubchapters()
            .then((res) => {
                if (res.status === "success") setLessons(res.data);
                window.allLessonsCount = res.data.length;
            })
            .catch((err) => console.error("Error fetching subchapters:", err));
    }, []);

    // โหลด summary
    useEffect(() => {
        setLoading(true);
        getStudentSummary(room)
            .then((res) => {
                if (res.status === "success") setStudents(res.data);
            })
            .catch((err) => console.error("Error fetching student summary:", err))
            .finally(() => setLoading(false));
    }, [room]);

    // Filter
    const filtered = useMemo(() => {
        let data = students;

        // ฟิลเตอร์นักเรียน
        if (selectedStudent !== "all") {
            data = data.filter((s) => s.student_id === parseInt(selectedStudent));
        }

        // ฟิลเตอร์บทเรียน
        if (selectedLesson !== "all") {
            const lessonId = parseInt(selectedLesson);
            data = data.filter((s) => {
                const subs = s.subchapters || {};
                return subs[lessonId] !== undefined;
            });
        }

        // ค้นหา
        if (searchTerm.trim() !== "") {
            const q = searchTerm.toLowerCase();
            data = data.filter(
                (s) =>
                    s.name.toLowerCase().includes(q) ||
                    (s.classroom && s.classroom.toLowerCase().includes(q))
            );
        }

        // เรียง
        data = [...data].sort((a, b) => {
            switch (sortOption) {
                case "desc":
                    return a.student_id - b.student_id;
                case "name":
                    return a.name.localeCompare(b.name, "th");
                case "pre":
                    return (b.pre_avg || 0) - (a.pre_avg || 0);
                case "post":
                    return (b.post_avg || 0) - (a.post_avg || 0);
                default:
                    return 0;
            }
        });

        return data;
    }, [students, searchTerm, sortOption, selectedStudent, selectedLesson]);

    if (loading) return <p>กำลังโหลด...</p>;

    return (
        <section className="flex min-h-screen">
            <Sidebar />
            <div className="flex-1 p-8 space-y-8 mt-5 md:mt-0">
                {/* Toolbar ฟิลเตอร์ */}
                <div className="bg-white rounded-xl shadow p-4 flex flex-wrap items-center gap-4">
                    {/* ห้องเรียน */}
                    <div>
                        <label className="text-sm text-gray-600 mr-2">ห้องเรียน</label>
                        <select
                            value={room}
                            onChange={(e) => {
                                setRoom(e.target.value);
                                setSelectedStudent("all");
                                setSelectedLesson("all");
                            }}
                            className="border border-gray-200 rounded px-3 py-1 text-sm"
                        >
                            <option value="all">ทั้งหมด</option>
                            {classrooms.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.classroom_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* นักเรียน */}
                    <div>
                        <label className="text-sm text-gray-600 mr-2">นักเรียน</label>
                        <select
                            value={selectedStudent}
                            onChange={(e) => setSelectedStudent(e.target.value)}
                            className="border border-gray-200 rounded px-3 py-1 text-sm"
                        >
                            <option value="all">ทั้งหมด</option>
                            {students.map((s) => (
                                <option key={s.student_id} value={s.student_id}>
                                    {s.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* บทเรียน */}
                    <div>
                        <label className="text-sm text-gray-600 mr-2">บทเรียน</label>
                        <select
                            value={selectedLesson}
                            onChange={(e) => setSelectedLesson(e.target.value)}
                            className="border border-gray-200 rounded px-3 py-1 text-sm"
                        >
                            <option value="all">ทุกบทเรียน</option>
                            {lessons.map((sc) => (
                                <option key={sc.subchapter_id} value={sc.subchapter_id}>
                                    {sc.subchapter_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Search + Sort */}
                    <div className="ml-auto">
                        <SearchAndSort
                            searchTerm={searchTerm}
                            setSearchTerm={setSearchTerm}
                            sortValue={sortOption}
                            onSortChange={setSortOption}
                            sortOptions={sortOptions}
                        />
                    </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <VideoChart students={filtered} selectedLesson={selectedLesson} />
                    <QuizChart students={filtered} selectedLesson={selectedLesson}  />
                </div>

                {/* ตารางสรุป */}
                <div className="bg-white rounded-xl shadow p-6">
                    <h3 className="font-semibold mb-4">รายชื่อนักเรียน</h3>
                    <table className="w-full text-sm">
                        <thead className="border-b border-gray-200">
                            <tr className="text-left">
                                <th className="py-2">ชื่อ</th>
                                <th className="py-2">ห้อง</th>
                                <th className="py-2 text-center">ดูคลิปวิดีโอ</th>
                                {/* <th className="py-2 text-center">คะแนนสอบก่อนเรียน</th>
                                <th className="py-2 text-center">คะแนนสอบหลังเรียน</th> */}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((s) => (
                                <tr
                                    key={s.student_id}
                                    className="border-b border-gray-100 hover:bg-gray-50"
                                >
                                    <td className="py-2">{s.name}</td>
                                    <td className="py-2">{s.classroom}</td>
                                    <td className="py-2 text-center">
                                        {selectedLesson !== "all" ? (
                                            // กรณีเลือกฟิลเตอร์บทเรียน
                                            <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
                                                {(() => {
                                                    const subs = Array.isArray(s.subchapters) ? {} : s.subchapters || {};
                                                    const lessonData = subs[String(selectedLesson)];
                                                    return lessonData?.watched_to_end === 1 ? "1/1 คลิป" : "0/1 คลิป";
                                                })()}
                                            </span>

                                        ) : (
                                            // กรณีรวมทุกบทเรียน
                                            <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded">
                                                {s.video_completed}/{s.video_total} คลิป
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-center text-gray-400 py-4">
                                        ไม่พบนักเรียน
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
}
