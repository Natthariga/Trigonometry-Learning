import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = ["#22c55e", "#E5E7EB"]; // เขียว = ทำแล้ว, เทา = ยังไม่ทำ

export default function QuizChart({ students, selectedLesson }) {
  const hasData = students && students.length > 0;

  if (!hasData) {
    return (
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">สรุปการทำแบบทดสอบ</h3>
        <div className="flex items-center justify-center h-[220px]">
          <p className="text-gray-500">ไม่มีข้อมูลนักเรียน</p>
        </div>
      </div>
    );
  }

  let data = [];
  let footerText = "";

  if (selectedLesson && selectedLesson !== "all") {
    // กรณีเลือกบทเรียนเฉพาะ
    let done = 0;
    let notDone = 0;

    students.forEach((s) => {
      // แปลง [] เป็น object
      const subs = Array.isArray(s.subchapters) ? {} : s.subchapters || {};
      const quizDone = subs[String(selectedLesson)]?.quiz_done ?? 0;

      if (quizDone === 1) done++;
      else notDone++;
    });

    data = [
      { name: "ทำแล้ว", value: done },
      { name: "ยังไม่ทำ", value: notDone },
    ];

    footerText = `นักเรียนที่ทำแบบทดสอบบทเรียนนี้ ${done} / ${students.length} คน`;
  } else if (students.length === 1) {
    // โหมดนักเรียนคนเดียว
    const s = students[0];
    const subs = Array.isArray(s.subchapters) ? {} : s.subchapters || {};

    const totalLessons = window.allLessonsCount || Object.keys(subs).length || 0;
    const doneCount = Object.values(subs).filter((x) => x.quiz_done === 1).length;

    data = [
      { name: "ทำแล้ว", value: doneCount },
      { name: "ยังไม่ทำ", value: Math.max(totalLessons - doneCount, 0) },
    ];

    footerText = `ทำแล้ว ${doneCount} / ${totalLessons} บทเรียน`;
  } else {
    // โหมดรวมหลายคน
    let doneStudents = 0;
    let notDoneStudents = 0;

    students.forEach((s) => {
      const subs = Array.isArray(s.subchapters) ? {} : s.subchapters || {};
      const doneCount = Object.values(subs).filter((x) => x.quiz_done === 1).length;

      if (doneCount > 0) doneStudents++;
      else notDoneStudents++;
    });

    data = [
      { name: "มีการทำ", value: doneStudents },
      { name: "ยังไม่มี", value: notDoneStudents },
    ];

    footerText = `นักเรียนที่ทำแล้ว ${doneStudents} / ${students.length} คน`;
  }

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">สรุปการทำแบบทดสอบ</h3>

      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            dataKey="value"
            innerRadius={40}
            outerRadius={90}
            paddingAngle={3}
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>

      <p className="text-center text-sm text-gray-600 mt-2">{footerText}</p>
    </div>
  );
}
