import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function PrePostChart({ students }) {
  const avgPre = students.reduce((sum, s) => sum + (s.pre_avg || 0), 0) / (students.length || 1);
  const avgPost = students.reduce((sum, s) => sum + (s.post_avg || 0), 0) / (students.length || 1);

  const data = [{ name: "ค่าเฉลี่ย", pre: avgPre, post: avgPost }];

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">คะแนน ก่อน/หลังเรียน</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="pre" fill="#3b82f6" name="ก่อนเรียน" />
          <Bar dataKey="post" fill="#f59e0b" name="หลังเรียน" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
