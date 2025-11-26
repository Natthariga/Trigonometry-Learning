import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { addStudentApi } from "../api/teachers/student-data";
import { getAllClassrooms } from "../api/teachers/classroom";

const AddStudentForm = ({ onClose, refreshList }) => {
  const [prefix, setPrefix] = useState("เด็กชาย");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [classroom, setClassroom] = useState("");
  const [studentNumber, setStudentNumber] = useState("");
  const [studentId, setStudentId] = useState("");
  const [classroomOptions, setClassroomOptions] = useState([]);

  // ดึงชั้น/ห้อง
  useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        const res = await getAllClassrooms();
        if (res.status === "success" && Array.isArray(res.data)) {
          setClassroomOptions(res.data);
          if (res.data.length > 0) setClassroom(res.data[0].classroom_name); 
        }
      } catch (err) {
        console.error("โหลดห้องเรียนไม่สำเร็จ:", err);
        setClassroomOptions([]);
      }
    };
    fetchClassrooms();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ข้อมูลไม่ครบ
    if (!firstName.trim() || !lastName.trim() || !classroom.trim() || !studentNumber.trim() || !studentId.trim()) {
      Swal.fire({ icon: "warning", title: "ข้อมูลไม่ครบ", text: "กรุณากรอกข้อมูลทั้งหมดก่อนบันทึก" });
      return;
    }

    // เลขที่ต้องเป็นตัวเลขบวก 
    if (isNaN(studentNumber) || Number(studentNumber) <= 0) {
      Swal.fire({ icon: "warning", title: "เลขที่ไม่ถูกต้อง", text: "เลขที่ต้องเป็นตัวเลขบวก" });
      return;
    }

    // เลขประจำตัวนักเรียนต้องเป็นตัวเลขเท่านั้น
    if (!/^\d+$/.test(studentId) || studentId.length !== 5) {
      Swal.fire({
        icon: "warning",
        title: "เลขประจำตัวนักเรียนไม่ถูกต้อง",
        text: "เลขประจำตัวนักเรียนต้องเป็นตัวเลข 5 หลัก",
      });
      return;
    }

    try {
      const res = await addStudentApi({
        prefix,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        classroom,
        studentNumber: Number(studentNumber),
        studentId: studentId.trim(),
      });

      if (res.status === "success") {
        Swal.fire({
          icon: "success",
          title: "เพิ่มนักเรียนเรียบร้อย",
        });
        if (refreshList) refreshList();
        onClose();
      } else {
        Swal.fire({
          icon: "error",
          title: "เกิดข้อผิดพลาด",
          text: res.message || "ไม่สามารถเพิ่มนักเรียนได้",
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถเชื่อมต่อ server ได้",
      });
    }
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center z-50 px-2">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-md border border-gray-100">
        <h2 className="text-xl font-bold mb-4 text-center text-blue-900">เพิ่มนักเรียน</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* คำนำหน้า */}
          <div>
            <label className="block mb-1">คำนำหน้า <span className="text-red-400">*</span></label>
            <select value={prefix} onChange={(e) => setPrefix(e.target.value)} className="w-full border border-gray-200 px-2 py-1 rounded">
              <option>เด็กชาย</option>
              <option>เด็กหญิง</option>
              <option>นาย</option>
              <option>นางสาว</option>
            </select>
          </div>

          {/* ชื่อ */}
          <div>
            <label className="block mb-1">ชื่อ <span className="text-red-400">*</span></label>
            <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full border border-gray-200 px-2 py-1 rounded" />
          </div>

          {/* นามสกุล */}
          <div>
            <label className="block mb-1">นามสกุล <span className="text-red-400">*</span></label>
            <input value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full border border-gray-200 px-2 py-1 rounded" />
          </div>

          {/* ชั้น/ห้อง */}
          <div>
            <label className="block mb-1">ชั้น/ห้อง <span className="text-red-400">*</span></label>
            <select value={classroom} onChange={(e) => setClassroom(e.target.value)} className="w-full border border-gray-200 px-2 py-1 rounded">
              {classroomOptions.map((room) => (
                <option key={room.id} value={room.classroom_name}>
                  {room.classroom_name}
                </option>
              ))}
            </select>
          </div>

          {/* เลขที่ */}
          <div>
            <label className="block mb-1">เลขที่ <span className="text-red-400">*</span></label>
            <input value={studentNumber} onChange={(e) => setStudentNumber(e.target.value)} className="w-full border border-gray-200 px-2 py-1 rounded" />
          </div>

          {/* เลขประจำตัว */}
          <div>
            <label className="block mb-1">เลขประจำตัวนักเรียน <span className="text-red-400">*</span></label>
            <input value={studentId} onChange={(e) => setStudentId(e.target.value)} className="w-full border border-gray-200 px-2 py-1 rounded" />
          </div>

          <div className="flex justify-end gap-2 mt-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400">ยกเลิก</button>
            <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">เพิ่มนักเรียน</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStudentForm;