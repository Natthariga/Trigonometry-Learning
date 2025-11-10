import React, { useState } from "react";
import Swal from "sweetalert2";
import { addYear } from "../api/teachers/student-data";

const YearForm = ({ onClose, onSave }) => {
    const [grade, setGrade] = useState("ม.4"); // ชั้น
    const [term, setTerm] = useState("1"); // เทอม
    const [academicYear, setAcademicYear] = useState(new Date().getFullYear() + 543); // ปีการศึกษา

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const data = await addYear({
                grade, 
                semester: term,
                academic_year: academicYear,
            });

            if (data.status === "success") {
                Swal.fire("บันทึกเรียบร้อย", "", "success");
                onSave();
                onClose();
            } else {
                Swal.fire("เกิดข้อผิดพลาด", data.message || "", "error");
            }
        } catch (err) {
            Swal.fire("การเชื่อมต่อผิดพลาด", "", "error");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-md">
                <h2 className="text-xl font-bold mb-4 text-center text-blue-900">เพิ่มปีการศึกษา</h2>
                <form onSubmit={handleSubmit} className="space-y-3">
                    {/* เลือกชั้น */}
                    <label>ชั้น</label>
                    <select
                        value={grade}
                        onChange={(e) => setGrade(e.target.value)}
                        className="w-full border border-gray-300 px-3 py-2 rounded"
                    >
                        <option value="ม.4">ม.4</option>
                        <option value="ม.5">ม.5</option>
                        <option value="ม.6">ม.6</option>
                    </select>

                    {/* เลือกเทอม */}
                    <label>เทอม</label>
                    <select
                        value={term}
                        onChange={(e) => setTerm(e.target.value)}
                        className="w-full border border-gray-300 px-3 py-2 rounded mt-2"
                    >
                        <option value="1">เทอม 1</option>
                        <option value="2">เทอม 2</option>
                    </select>

                    {/* ปีการศึกษา */}
                    <label>ปีการศึกษา</label>
                    <input
                        type="number"
                        value={academicYear}
                        onChange={(e) => setAcademicYear(e.target.value)}
                        className="w-full border border-gray-300 px-3 py-2 rounded mt-2"
                        placeholder="ปีการศึกษา"
                        required
                    />

                    <div className="flex justify-end gap-2 mt-4">
                        <button
                            type="button"
                            className="px-4 py-2 bg-gray-300 rounded"
                            onClick={onClose}
                        >
                            ยกเลิก
                        </button>
                        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
                            บันทึก
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default YearForm;
