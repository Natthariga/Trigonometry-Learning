import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
const ChartCard = ({ summaryBySubchapter, selectedSubchapter }) => {
  const filteredData = summaryBySubchapter[selectedSubchapter] || [];

  const data = filteredData.map((item, idx) => ({
    name: `ครั้งที่ ${idx + 1}`,
    'ก่อนเรียน': item.pretest_score ?? 0,
    'หลังเรียน': item.posttest_score ?? 0,
  }));

  return (
    <div className="bg-white p-7 rounded-xl shadow min-h-[350px]">
      <h3 className="mb-4 text-2xl text-blue-800 font-medium">การวิเคราะห์แผนภูมิ</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} barCategoryGap="20%">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend />
          <Bar dataKey="ก่อนเรียน" fill="#0ea5e9" />
          <Bar dataKey="หลังเรียน" fill="#0c4a6e" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ChartCard;
