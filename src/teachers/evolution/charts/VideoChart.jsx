import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = ["#3B82F6", "#E5E7EB"];

export default function VideoChart({ students, selectedLesson }) {
  const hasData = students && students.length > 0;

  if (!hasData) {
    return (
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">สรุปการดูวิดีโอ</h3>
        <div className="flex items-center justify-center h-[220px]">
          <p className="text-gray-500">ไม่มีข้อมูลนักเรียน</p>
        </div>
      </div>
    );
  }

  let data = [];
  let footerText = "";

  if (selectedLesson && selectedLesson !== "all") {
    let completed = 0;
    let notCompleted = 0;
    const lessonKey = String(selectedLesson);

    students.forEach((s) => {
      let subs = s.subchapters || {};

      // รองรับกรณีที่เป็น array [] ด้วย
      if (Array.isArray(subs)) subs = {};

      // ปรับ key ให้เป็น string ทั้งหมด
      const normalizedSubs = Object.keys(subs).reduce((acc, key) => {
        acc[String(key)] = subs[key];
        return acc;
      }, {});

      const lessonData = normalizedSubs[lessonKey];
      const watched = lessonData?.watched_to_end === 1;

      if (watched) completed++;
      else notCompleted++;
    });

    data = [
      { name: "ดูจบแล้ว", value: completed },
      { name: "ยังไม่จบ", value: notCompleted },
    ];

    footerText = `นักเรียนที่ดูจบบทเรียนนี้ ${completed} / ${students.length} คน`;
  }


  else if (students.length === 1) {
    // กรณีเลือกนักเรียนเดียว
    const s = students[0];
    const completed = s.video_completed || 0;
    const total = s.video_total || 0;

    data = [
      { name: "ดูจบแล้ว", value: completed },
      { name: "ยังไม่จบ", value: Math.max(total - completed, 0) },
    ];
    footerText = `ดูจบแล้ว ${completed} / ${total} คลิป`;
  } else {
    // กรณีภาพรวม
    let completedStudents = 0;
    let notCompletedStudents = 0;

    students.forEach((s) => {
      if ((s.video_completed || 0) > 0) completedStudents++;
      else notCompletedStudents++;
    });

    data = [
      { name: "มีการดูจบ", value: completedStudents },
      { name: "ยังไม่มี", value: notCompletedStudents },
    ];
    footerText = `นักเรียนที่มีการดูคลิปแล้ว ${completedStudents} / ${students.length} คน`;
  }

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">สรุปการดูวิดีโอ</h3>

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
