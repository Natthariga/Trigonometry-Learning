import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function LearningStatsGraph({ stats }) {
  const data = [
    { name: "ห้องเรียน", value: stats.classroom_count },
    { name: "นักเรียน", value: stats.student_count },
    { name: "บทเรียน", value: stats.lesson_count },
  ];

  return (
    <ResponsiveContainer className={"pr-16"} width="100%" height={300}>
      <LineChart data={data}>
        <XAxis dataKey="name" />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Line type="monotone" dataKey="value" stroke="#6366F1" strokeWidth={3} />
      </LineChart>
    </ResponsiveContainer>
  );
}
