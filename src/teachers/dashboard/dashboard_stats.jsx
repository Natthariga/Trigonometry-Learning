import React from "react";
import {
    BarChart,
    Bar,
    ResponsiveContainer,
    XAxis,
    YAxis,
    Tooltip,
} from "recharts";
import { TrendingUp } from "lucide-react";

export default function StatGraph({ stats }) {
    const data = [
        { name: "ห้องเรียน", value: stats.classroom_count },
        { name: "นักเรียน", value: stats.student_count },
        { name: "บทเรียน", value: stats.lesson_count },
    ];

    return (
        <div
            className="relative h-full bg-white rounded-2xl border border-gray-100 shadow-md overflow-hidden group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
        >
            {/* hover background */}
            <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-gray-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0" />

            {/* content */}
            <div className="relative z-10 p-6">
                <div className="flex items-center justify-between">
                    <p className="text-gray-700 font-medium text-sm">ค่าสถิติ</p>
                    <div className="p-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 shadow-md">
                        <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                </div>

                <div className="h-24 mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <XAxis dataKey="name" />
                            <YAxis hide />
                            <Tooltip />
                            <Bar dataKey="value" fill="#F97316" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 to-orange-600" />
        </div>
    );
}
