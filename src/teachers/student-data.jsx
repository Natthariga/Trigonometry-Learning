import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import Swal from "sweetalert2";
import Sidebar from "../components/sidebarAdmin";
import { FaPlus } from "react-icons/fa";
import { Pencil, Plus } from "lucide-react";
import { getStudentListApi, saveStudentListApi, addYear } from "../api/teachers/student-data";
import StudentForm from "./student-form";

const StudentListPage = () => {
  const [students, setStudents] = useState([]);
  const [excelData, setExcelData] = useState([]);
  const [selectedClassroom, setSelectedClassroom] = useState("ทั้งหมด");
  const [classroomOptions, setClassroomOptions] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [yearOptions, setYearOptions] = useState([]);
  const [selectedTerm, setSelectedTerm] = useState("");
  const [termOptions, setTermOptions] = useState(["1", "2"]);
  const [checkedStudents, setCheckedStudents] = useState([]);
  const [checkAll, setCheckAll] = useState(false);

  const [showForm, setShowForm] = useState(false);

  // Filtered students
  const filteredStudents = students.filter(s =>
    (selectedYear ? s.academic_year === selectedYear : true) &&
    (selectedTerm ? s.semester === selectedTerm : true) &&
    (selectedClassroom !== "ทั้งหมด" ? s.classroom_name === selectedClassroom : true)
  );

  // page
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20); //จำนวนแถวต่อหน้า
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredStudents.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(filteredStudents.length / rowsPerPage);


  // Load students
  const fetchStudents = async () => {
    try {
      const res = await getStudentListApi();
      if (res.status === "success") {
        setStudents(res.data);

        // set classrooms
        const rooms = [...new Set(res.data.map((s) => s.classroom_name))].sort((a, b) => a.localeCompare(b, "th"));
        setClassroomOptions(["ทั้งหมด", ...rooms]);

        // set years
        const years = [...new Set(res.data.map((s) => s.academic_year))].sort((a, b) => a - b);
        setYearOptions(years);

      } else {
        Swal.fire("เกิดข้อผิดพลาด", res.message || "ไม่สามารถดึงข้อมูลนักเรียนได้", "error");
      }
    } catch (err) {
      Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถเชื่อมต่อ server ได้", "error");
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // checkbox
  const handleCheckAll = (e) => {
    setCheckAll(e.target.checked);
    setCheckedStudents(e.target.checked ? filteredStudents.map(s => s.student_id) : []);
  };

  const handleCheckStudent = (studentId) => {
    if (checkedStudents.includes(studentId)) {
      setCheckedStudents(checkedStudents.filter(id => id !== studentId));
    } else {
      setCheckedStudents([...checkedStudents, studentId]);
    }
  };

  // เพิ่มชั้น
  const handlePromote = () => {
    if (!selectedYear || !selectedTerm) {
      Swal.fire("เลือกไม่ครบ", "กรุณาเลือกปีการศึกษาและเทอมก่อน", "warning");
      return;
    }

    const studentsToProcess = students.filter(
      (s) => s.academic_year === selectedYear && s.semester === selectedTerm
    );

    if (studentsToProcess.length === 0) {
      Swal.fire("ไม่มีข้อมูล", "ไม่พบนักเรียนในเทอม/ปีการศึกษานี้", "warning");
      return;
    }

    Swal.fire({
      title: "ยืนยันการเลื่อนชั้นและเปลี่ยนปีการศึกษา",
      text: "นักเรียนที่เลือกจะเลื่อนชั้น ส่วนคนที่ไม่ถูกเลือกจะเปลี่ยนแค่ปีการศึกษาและเทอม",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "ดำเนินการ",
      cancelButtonText: "ยกเลิก",
    }).then(async (result) => {
      if (!result.isConfirmed) return;

      const updatedStudents = studentsToProcess.map((s) => {
        const isPromoted = checkedStudents.includes(s.student_id);
        const nextAcademicYear = String(Number(s.academic_year) + 1);
        const nextSemester = selectedTerm === "1" ? "2" : "1";

        let nextClassroom = s.classroom_name;
        if (isPromoted) {
          const match = s.classroom_name.match(/^ม\.(\d)(\/\d+)?/);
          const currentLevel = Number(match?.[1] || 6);
          const room = match?.[2] || "";
          nextClassroom = currentLevel < 6 ? `ม.${currentLevel + 1}${room}` : s.classroom_name;
        }

        return {
          student_code: s.student_id,
          academic_year: nextAcademicYear,
          semester: nextSemester,
          classroom_name: nextClassroom,
        };
      });

      try {
        const res = await addYear({ students: updatedStudents });
        if (res.status === "success") {
          Swal.fire("สำเร็จ", "ประมวลผลเรียบร้อยแล้ว", "success");
          setCheckedStudents([]);
          setCheckAll(false);
          fetchStudents();
        } else {
          Swal.fire("เกิดข้อผิดพลาด", res.message || "ไม่สามารถประมวลผลได้", "error");
        }
      } catch (err) {
        console.error("ERROR PROMOTE:", err);
        Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถเชื่อมต่อ server ได้", "error");
      }
    });
  };

  // บันทึก
  const handleSaveToServer = async () => {
    if (excelData.length === 0) return;

    Swal.fire({
      title: "กำลังบันทึกข้อมูล...",
      text: "กรุณารอสักครู่",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const data = await saveStudentListApi({
        students: excelData,
        semester: excelData[0].semester,
        academic_year: excelData[0].academic_year,
      });

      if (data.status === "success") {
        Swal.fire({
          icon: "success",
          title: `บันทึกเรียบร้อย`,
          showConfirmButton: false,
          timer: 2000,
        });
        fetchStudents();
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

  // Preview ข้อมูล
  const showPreviewBeforeSave = () => {
    if (!excelData || excelData.length === 0) {
      Swal.fire("ไม่มีข้อมูล", "กรุณาอัปโหลดไฟล์ก่อน", "info");
      return;
    }

    const { semester, academic_year } = excelData[0];

    const tableHtml = `
    <div style="margin-bottom: 10px; font-weight: bold;">
      เทอม: ${semester} | ปีการศึกษา: ${academic_year}
    </div>
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
      if (result.isConfirmed) handleSaveToServer();
    });
  };

  // Excel upload/export
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const data = event.target.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const lastSheetName = workbook.SheetNames[workbook.SheetNames.length - 1];
      const worksheet = workbook.Sheets[lastSheetName];
      const match = lastSheetName.match(/(\d+)[^\d]*(\d{4})/);
      const semester = match ? match[1] : "-";
      const academic_year = match ? match[2] : "-";
      const sheetData = XLSX.utils.sheet_to_json(worksheet, { range: 3, defval: "" });
      const requiredHeaders = ["ชั้น/ห้อง", "เลขที่", "เลขประจำตัว", "ชื่อ - นามสกุล"];
      const firstRow = Object.keys(sheetData[0] || {});
      if (!requiredHeaders.every(h => firstRow.includes(h))) {
        Swal.fire("ข้อมูลไม่ถูกต้อง", `ชีท "${lastSheetName}" ไม่มีหัวคอลัมน์ที่ถูกต้อง`, "error");
        return;
      }
      const highSchoolGrades = ["ม.4", "ม.5", "ม.6"];
      const finalData = sheetData
        .map(row => ({
          classroom_name: row["ชั้น/ห้อง"],
          student_number: row["เลขที่"],
          student_id: row["เลขประจำตัว"],
          fullname: row["ชื่อ - นามสกุล"],
          semester,
          academic_year
        }))
        .filter(row => highSchoolGrades.includes(row.classroom_name.split("/")[0].trim()));
      setExcelData(finalData);
      Swal.fire("อัปโหลดเรียบร้อย", `เทอม ${semester} / ปี ${academic_year}`, "success");
    };
    reader.readAsBinaryString(file);
  };

  const handleExport = () => {
    if (students.length === 0) return;
    const ws = XLSX.utils.json_to_sheet(
      students.map(s => ({
        "ชั้น/ห้อง": s.classroom_name,
        "เลขที่": s.student_number,
        "เลขประจำตัว": s.student_id,
        "ชื่อ - นามสกุล": s.fullname
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "StudentList");
    XLSX.writeFile(wb, "student_list.xlsx");
  };

  return (
    <section className="flex h-screen overflow-hidden w-full">
      <Sidebar />
      <div className="flex-1 p-12 overflow-auto">
        <div className="flex items-center justify-between mt-5 mb-5 md:mt-0">
          <h2 className="text-2xl font-bold text-blue-900">
            รายชื่อนักเรียน {selectedYear ? `| ปี ${selectedYear}` : ""} {selectedTerm ? `| เทอม ${selectedTerm}` : ""}
          </h2>
          <div className="flex gap-3">
            <div className="flex items-center gap-2 cursor-pointer px-2 py-1 rounded-lg bg-blue-600 hover:bg-blue-700" onClick={() => setShowForm(true)}>
              <div className="flex items-center justify-center text-white rounded-full py-2 px-1"><Plus size={17} /></div>
              <span className="text-white font-medium hidden md:inline">เพิ่มนักเรียน</span>
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="flex flex-wrap gap-3 mb-4 items-center">
          <label>ปีการศึกษา:</label>
          <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="border px-2 py-1 rounded">
            <option value="">ทั้งหมด</option>
            {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <label>เทอม:</label>
          <select value={selectedTerm} onChange={(e) => setSelectedTerm(e.target.value)} className="border px-2 py-1 rounded">
            <option value="">ทั้งหมด</option>
            {termOptions.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <label>ห้อง:</label>
          <select value={selectedClassroom} onChange={(e) => setSelectedClassroom(e.target.value)} className="border px-2 py-1 rounded">
            {classroomOptions.map(r => <option key={r} value={r}>{r}</option>)}
          </select>

          <button className="bg-green-600 text-white px-3 py-1 rounded cursor-pointer" onClick={handlePromote}>เลื่อนชั้น</button>

          {/* <select
            value={rowsPerPage}
            onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
            className="border px-2 py-1 rounded ml-2"
          >
            {[10, 20, 50, 100].map(n => <option key={n} value={n}>{n} แถวต่อหน้า</option>)}
          </select> */}

        </div>

        {/* Table */}
        <div className="overflow-x-auto max-h-[500px] rounded border border-gray-300">
          <table className="min-w-full border-collapse border border-gray-200">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                <th className="border px-4 py-2"><input type="checkbox" checked={checkAll} onChange={handleCheckAll} /></th>
                <th className="border px-4 py-2">ลำดับ</th>
                <th className="border px-4 py-2">ชั้น/ห้อง</th>
                <th className="border px-4 py-2">เลขที่</th>
                <th className="border px-4 py-2">เลขประจำตัว</th>
                <th className="border px-4 py-2">ชื่อ - นามสกุล</th>
                <th className="border px-4 py-2">ปีการศึกษา</th>
                <th className="border px-4 py-2">เทอม</th>
              </tr>
            </thead>
            <tbody>
              {currentRows.map((s, idx) => (
                <tr key={s.student_id} className={idx % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                  <td className="border px-4 py-2 text-center">
                    <input type="checkbox" checked={checkedStudents.includes(s.student_id)} onChange={() => handleCheckStudent(s.student_id)} />
                  </td>
                  <td className="border px-4 py-2">{indexOfFirstRow + idx + 1}</td>
                  <td className="border px-4 py-2">{s.classroom_name}</td>
                  <td className="border px-4 py-2">{s.student_number}</td>
                  <td className="border px-4 py-2">{s.student_id}</td>
                  <td className="border px-4 py-2">{s.fullname}</td>
                  <td className="border px-4 py-2">{s.academic_year}</td>
                  <td className="border px-4 py-2">{s.semester}</td>
                </tr>
              ))}
              {currentRows.length === 0 && <tr><td colSpan={8} className="text-center py-4">ไม่มีข้อมูล</td></tr>}
            </tbody>

          </table>
        </div>

        <div className="flex justify-between items-center mt-2">
          <div>
            แสดง {indexOfFirstRow + 1} - {Math.min(indexOfLastRow, filteredStudents.length)} จาก {filteredStudents.length} รายการ
          </div>
          <div className="flex gap-2">
            <button
              className="px-2 py-1 border rounded disabled:opacity-50"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              ก่อนหน้า
            </button>
            <span className="px-2 py-1">{currentPage} / {totalPages}</span>
            <button
              className="px-2 py-1 border rounded disabled:opacity-50"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              ถัดไป
            </button>
          </div>
        </div>

        {/* Excel */}
        <div className="flex flex-wrap gap-3 mt-4">
          <input type="file" accept=".xlsx,.xls" onChange={handleFileUpload} className="border px-2 py-1 rounded" />
          <button className="bg-blue-600 text-white px-3 py-1 rounded" onClick={showPreviewBeforeSave}>Import Excel</button>
          <button className="bg-yellow-600 text-white px-3 py-1 rounded" onClick={handleExport}>Export Excel</button>
        </div>

        {showForm && <StudentForm onClose={() => setShowForm(false)} onSave={fetchStudents} />}
      </div>
    </section>
  );
};

export default StudentListPage;
