import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import Swal from "sweetalert2";
import Sidebar from "../components/sidebarAdmin";
import StudentForm from "./student-form";
import { FaPlus } from "react-icons/fa";
import { Plus } from "lucide-react";
import { getStudentListApi, saveStudentListApi } from "../api/teachers/student-data";

const StudentListPage = () => {
  const [students, setStudents] = useState([]);
  const [sheetName, setSheetName] = useState("");
  const [excelData, setExcelData] = useState([]);
  const [showForm, setShowForm] = useState(false);

  // โหลดข้อมูล student_list จาก server
  const fetchStudents = async () => {
    try {
      const res = await getStudentListApi(); // เรียก API
      if (res.status === "success") {
        setStudents(res.data); // ต้องใช้ res.data ไม่ใช่ res
      } else {
        setStudents([]);
        Swal.fire({
          icon: "error",
          title: "เกิดข้อผิดพลาด",
          text: res.message || "ไม่สามารถดึงข้อมูลนักเรียนได้",
        });
      }
    } catch (err) {
      console.error(err);
      setStudents([]);
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถเชื่อมต่อ server ได้",
      });
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Upload Excel
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const data = event.target.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const lastSheetName = workbook.SheetNames[workbook.SheetNames.length - 1];
      const worksheet = workbook.Sheets[lastSheetName];

      // แปลง JSON เริ่ม header row 3
      const sheetData = XLSX.utils.sheet_to_json(worksheet, { range: 3, defval: "" });

      // ตรวจสอบหัวคอลัมน์เฉพาะต้นฉบับ
      const requiredHeaders = ["ชั้น/ห้อง", "เลขที่", "เลขประจำตัว", "ชื่อ - นามสกุล"];
      const firstRow = Object.keys(sheetData[0] || {});
      const hasRequiredHeaders = requiredHeaders.every((h) => firstRow.includes(h));

      if (!hasRequiredHeaders) {
        Swal.fire({
          icon: "error",
          title: "ข้อมูลไม่ถูกต้อง",
          text: `ชีท "${lastSheetName}" ไม่มีหัวคอลัมน์ที่ถูกต้อง`,
        });
        return;
      }

      // แปลงเฉพาะ column ที่ต้องการ
      const highSchoolGrades = ["ม.4", "ม.5", "ม.6"];
      const finalData = sheetData
        .map((row) => ({
          classroom_name: row["ชั้น/ห้อง"],
          student_number: row["เลขที่"],
          student_id: row["เลขประจำตัว"],
          fullname: row["ชื่อ - นามสกุล"],
        }))
        .filter((row) => {
          const grade = row.classroom_name.split("/")[0].trim();
          return highSchoolGrades.includes(grade);
        });

      setExcelData(finalData);
      setSheetName(lastSheetName);

      Swal.fire({
        icon: "success",
        title: "อัปโหลดเรียบร้อย",
      });
    };
    reader.readAsBinaryString(file);
  };

  // บันทึก Excel ลง server
  const handleSaveToServer = async () => {
    if (excelData.length === 0) return;

    // แสดง popup ว่ากำลังบันทึก
    Swal.fire({
      title: "กำลังบันทึกข้อมูล...",
      text: "กรุณารอสักครู่ เนื่องจากข้อมูลอาจมีจำนวนมาก",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const data = await saveStudentListApi(excelData);

      if (data.status === "success") {
        Swal.fire({
          icon: "success",
          title: "บันทึกข้อมูลเรียบร้อย",
          showConfirmButton: false,
          timer: 1500,
        });
        fetchStudents(); // reload table
      } else {
        Swal.fire({
          icon: "error",
          title: "ไม่สามารถบันทึกข้อมูลได้",
          text: data.message || "เกิดข้อผิดพลาดจาก server",
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "การเชื่อมต่อล้มเหลว",
        text: "ไม่สามารถเชื่อมต่อกับ server ได้",
      });
    }
  };


  // Export Excel
  const handleExport = () => {
    if (students.length === 0) return;
    const ws = XLSX.utils.json_to_sheet(
      students.map((s) => ({
        "ชั้น/ห้อง": s.classroom_name,
        "เลขที่": s.student_number,
        "เลขประจำตัว": s.student_id,
        "ชื่อ - นามสกุล": s.fullname,
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "StudentList");
    XLSX.writeFile(wb, "student_list.xlsx");
  };

  // แสดง preview ก่อนบันทึก
  const showPreviewBeforeSave = () => {
    if (!excelData || excelData.length === 0) {
      Swal.fire("ไม่มีข้อมูล", "กรุณาอัปโหลดไฟล์ก่อน", "info");
      return;
    }

    // สร้าง HTML table เป็น string
    const tableHtml = `
    <table style="width:100%; border-collapse: collapse; text-align:left;">
      <thead>
        <tr>
          <th style="border:1px solid #ccc; padding:4px;">ลำดับ</th>
          <th style="border:1px solid #ccc; padding:4px;">ชั้น/ห้อง</th>
          <th style="border:1px solid #ccc; padding:4px;">เลขที่</th>
          <th style="border:1px solid #ccc; padding:4px;">เลขประจำตัว</th>
          <th style="border:1px solid #ccc; padding:4px;">ชื่อ - นามสกุล</th>
        </tr>
      </thead>
      <tbody>
        ${excelData
        .map(
          (s, idx) => `
          <tr>
            <td style="border:1px solid #ccc; padding:4px;">${idx + 1}</td>
            <td style="border:1px solid #ccc; padding:4px;">${s.classroom_name}</td>
            <td style="border:1px solid #ccc; padding:4px;">${s.student_number}</td>
            <td style="border:1px solid #ccc; padding:4px;">${s.student_id}</td>
            <td style="border:1px solid #ccc; padding:4px;">${s.fullname}</td>
          </tr>`
        )
        .join("")}
      </tbody>
    </table>
  `;

    Swal.fire({
      title: "Preview ข้อมูลที่จะบันทึก",
      html: `<div style="max-height:300px; overflow:auto;">${tableHtml}</div>`,
      showCancelButton: true,
      confirmButtonText: "บันทึกลงระบบ",
      cancelButtonText: "ยกเลิก",
      width: "800px",
      scrollbarPadding: false,
    }).then((result) => {
      if (result.isConfirmed) {
        handleSaveToServer();
      }
    });
  };

  return (
    <section className="flex h-screen overflow-hidden w-full">
      <Sidebar />
      <div className="flex-1 p-12 overflow-auto">
        <div className="flex items-center justify-between mt-5 mb-5 md:mt-0">
          <h2 className="text-2xl font-bold text-blue-900">
            รายชื่อนักเรียน
          </h2>

          <div
            className="flex items-center gap-2 cursor-pointer px-2 py-1 rounded-lg bg-blue-600 hover:bg-blue-700"
            onClick={() => setShowForm(true)} title="เพิ่มนักเรียน"
          >
            <div className="flex items-center justify-center  text-white rounded-full py-2 px-1">
              <Plus size={17} />
            </div>
            <span className="text-white font-medium hidden md:inline">เพิ่มนักเรียน</span>
          </div>

        </div>


        <div className="flex flex-wrap gap-2 mb-8 items-start">

          <div className="flex flex-col w-full sm:w-auto">
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileUpload}
              className="border border-gray-300 px-3 py-2 rounded w-full"
            />
            <label className="text-sm text-red-500 mt-1 font-semibold">
              ** ไฟล์นามสกุล xlsx, xls **
            </label>
          </div>

          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={showPreviewBeforeSave}
          >
            บันทึกลงระบบ
          </button>

          <button
            className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
            onClick={handleExport}
          >
            Export Excel
          </button>
        </div>


        <div className="overflow-x-auto max-h-[500px] rounded border border-gray-300">
          <table className="min-w-full border-collapse border border-gray-200">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                <th className="border border-gray-200 px-4 py-2 ">ลำดับ</th>
                <th className="border border-gray-200 px-4 py-2 whitespace-nowrap">ชั้น/ห้อง</th>
                <th className="border border-gray-200 px-4 py-2 whitespace-nowrap">เลขที่</th>
                <th className="border border-gray-200 px-4 py-2 whitespace-nowrap">เลขประจำตัว</th>
                <th className="border border-gray-200 px-4 py-2 whitespace-nowrap">ชื่อ - นามสกุล</th>
              </tr>
            </thead>
            <tbody>
              {students && students.length > 0 ? (
                students.map((s, idx) => (
                  <tr key={s.student_id} className={idx % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                    <td className="border border-gray-200 px-4 py-2">{idx + 1}</td>
                    <td className="border border-gray-200 px-4 py-2 whitespace-nowrap text-center">{s.classroom_name}</td>
                    <td className="border border-gray-200 px-4 py-2 whitespace-nowrap text-center">{s.student_number}</td>
                    <td className="border border-gray-200 px-4 py-2 whitespace-nowrap">{s.student_id}</td>
                    <td className="border border-gray-200 px-4 py-2 whitespace-nowrap">{s.fullname}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-4">
                    ไม่มีข้อมูล
                  </td>
                </tr>
              )}
            </tbody>

          </table>
        </div>

        {/* Popup form */}
        {showForm && <StudentForm onClose={() => setShowForm(false)} onSave={fetchStudents} />}
      </div>
    </section>
  );
};

export default StudentListPage;
