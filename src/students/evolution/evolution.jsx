import React, { useEffect, useState } from "react";
import Sidebar from "../../components/navBar";
import { getUserId } from "../../js/auth";
import ChartCard from './chart/student_chart';
import Footer from "../../components/footer";
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { getEvolution } from "../../api/students/evolution";

const Evolution = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [lessons, setLessons] = useState([]);
    const [selectedSubchapter, setSelectedSubchapter] = useState("");
    const [summary, setSummary] = useState([]);
    const [wrongQuestions, setWrongQuestions] = useState([]);

    const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

    // ---------- 1. ดึง summary และ summaryOverview จาก API ----------
    useEffect(() => {
        async function fetchEvolution() {
            try {
                const studentId = getUserId();
                if (!studentId) return;

                const json = await getEvolution(studentId);

                if (json.status === "success") {
                    setSummary(json.data.summary || []);
                    setLessons(json.data.summary || []);
                    setWrongQuestions(json.data?.wrong_questions?.posttest || []);

                    if (json.data.summary.length > 0) {
                        setSelectedSubchapter(json.data.summary[0].subchapter_id);
                    }
                }
            } catch (error) {
                console.error("Error fetching evolution data:", error);
            }
        }
        fetchEvolution();
    }, []);

    // ---------- 2. สร้างตารางคะแนนโดยใช้ progress_percent จาก PHP ----------
    const getAttemptRows = () => {
        const lesson = summary.find(item => item.subchapter_id === selectedSubchapter);
        if (!lesson || !lesson.attempts || lesson.attempts.length === 0) {
            return (
                <tr>
                    <td colSpan="4" className="text-center py-4 text-gray-500">ไม่มีข้อมูลคะแนน</td>
                </tr>
            );
        }

        return lesson.attempts.map((attempt, idx) => (
            <tr key={`${lesson.subchapter_id}-${idx}`}>
                <td className="py-4">{idx + 1}</td>
                <td className="py-4">{attempt.pretest_score !== "-" ? `${attempt.pretest_score}/${lesson.full_score}` : "-"}</td>
                <td className="py-4">{attempt.posttest_score !== "-" ? `${attempt.posttest_score}/${lesson.full_score}` : "-"}</td>
                <td className="py-4 font-bold">
                    {attempt.progress_percent !== "-" ? `${attempt.progress_percent}%` : "-"}
                </td>
            </tr>
        ));
    };

    const selectedLesson = lessons.find(l => l.subchapter_id === selectedSubchapter);

    // ---------- สรุปภาพรวม ----------
    const summaryOverview = React.useMemo(() => {
        if (!summary || summary.length === 0) return { total_lessons: 0, developed_count: 0, developed_percent: 0 };

        let developedCount = 0;
        summary.forEach(item => {
            const attempts = item.attempts || [];
            if (attempts.length > 0) {
                const last = attempts[attempts.length - 1];
                const pre = last.pretest_score !== "-" ? last.pretest_score : 0;
                const post = last.posttest_score !== "-" ? last.posttest_score : 0;
                if (post > pre) developedCount++;
            }
        });

        const totalLessons = summary.length;
        const developedPercent = totalLessons ? Math.round((developedCount / totalLessons) * 100) : 0;
        return { total_lessons: totalLessons, developed_count: developedCount, developed_percent: developedPercent };
    }, [summary]);

    // ---------- สรุปภาพรวมของบทเรียนที่เลือก ----------
    const selectedLessonOverview = React.useMemo(() => {
        const lesson = summary.find(item => item.subchapter_id === selectedSubchapter);
        if (!lesson || !lesson.attempts || lesson.attempts.length === 0) {
            return { progress_percent: 0 };
        }

        const lastAttempt = lesson.attempts[lesson.attempts.length - 1];
        return {
            pretest_score: lastAttempt.pretest_score !== "-" ? lastAttempt.pretest_score : 0,
            posttest_score: lastAttempt.posttest_score !== "-" ? lastAttempt.posttest_score : 0,
            progress_percent: lastAttempt.progress_percent !== "-" ? lastAttempt.progress_percent : 0
        };
    }, [summary, selectedSubchapter]);

    // ---------- กรองข้อผิด ----------
    const filteredWrongQuestions = (wrongQuestions || []).filter(
        q => String(q.subchapter_id) === String(selectedSubchapter)
    );

    // ---------- แปลง summary สำหรับ ChartCard ----------
    const summaryBySubchapter = summary.reduce((acc, item) => {
        const key = item.subchapter_id;
        if (!acc[key]) acc[key] = [];
        if (item.attempts && item.attempts.length > 0) acc[key].push(...item.attempts);
        return acc;
    }, {});

    return (
        <section className="flex flex-col min-h-screen">
            <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

            <div className="bg-gray-100 flex-1 p-8 pt-32 w-full overflow-y-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-gray-200">
                    <div className="border-l-4 border-blue-800 pl-4">
                        <h2 className="text-3xl font-bold text-blue-800">บทเรียนของคุณ</h2>
                    </div>

                    <select
                        value={selectedSubchapter}
                        onChange={(e) => setSelectedSubchapter(e.target.value)}
                        className="border border-gray-300 bg-white text-blue-800 font-bold text-md rounded-md px-3 py-2 w-full md:w-64"
                    >
                        {lessons.map((lesson) => (
                            <option key={lesson.subchapter_id} value={lesson.subchapter_id}>
                                {lesson.subchapter_name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* กราฟ */}
                <div>
                    <div className="md:col-span-2 h-full">
                        <ChartCard summaryBySubchapter={summaryBySubchapter} selectedSubchapter={selectedSubchapter} />
                    </div>
                </div>

                {/* ตารางคะแนน */}
                <div className="min-h-[300px] overflow-auto">
                    {/* Header */}
                    <div className="bg-white rounded-xl shadow mb-4 overflow-x-auto">
                        <table className="w-full text-center border-collapse">
                            <thead className="border-b-5 border-gray-100 text-gray-700 font-semibold md:text-lg">
                                <tr>
                                    <th className="py-3 w-[15%]"></th>
                                    <th className="py-3 w-[23%]">คะแนนก่อนเรียน</th>
                                    <th className="py-3 w-[32%]">คะแนนหลังเรียน</th>
                                    <th className="py-3 w-[28%]">พัฒนาแล้ว (%)</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-700 md:text-lg">
                                {/* แสดงข้อมูลการลองทำ */}
                                {getAttemptRows()}

                                {/* Summary Row */}
                                <tr className="font-semibold border-t border-gray-100">
                                    <td colSpan={3} className="py-4 pl-16 text-left md:text-xl">
                                        สรุปภาพรวม
                                    </td>
                                    <td
                                        className={`px-3 py-4 text-center font-bold ${selectedLessonOverview.progress_percent > 0
                                                ? "text-green-600"
                                                : "text-red-600"
                                            }`}
                                    >
                                        {selectedLessonOverview.progress_percent}%
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            <Footer />
        </section>
    );
};

export default Evolution;
