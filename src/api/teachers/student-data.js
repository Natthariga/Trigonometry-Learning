import http from "../http";

export const getStudentListApi = async () => {
  try {
    const response = await http.get("/teachers/get_student_list.php");
    return response.data;
  } catch (err) {
    console.error("Get Student List API error:", err);
    return { status: "error", message: "ไม่สามารถเชื่อมต่อ server ได้" };
  }
};


// ฟังก์ชันบันทึกรายชื่อนักเรียน จาก excel
export const saveStudentListApi = async (data) => {
  try {
    const response = await http.post("/teachers/save_student_list.php", data);
    return response.data;
  } catch (err) {
    console.error("Save Student List API error:", err);
    return { status: "error", message: "ไม่สามารถเชื่อมต่อ server ได้" };
  }
};


// เพิ่มนักเรียนลงตาราง
export const addStudentApi = async (studentData) => {
  try {
    const response = await http.post("/teachers/add_student.php", studentData);
    return response.data;
  } catch (err) {
    console.error("Add Student API error:", err);
    return { status: "error", message: "ไม่สามารถเชื่อมต่อ server ได้" };
  }
};


// เพิ่มปีการศึกษา
export const addYear = async (studentData) => {
  try {
    const response = await http.post("/teachers/add_year.php", studentData);
    return response.data;
  } catch (err) {
    console.error("Add Student error:", err);
    return { status: "error", message: "ไม่สามารถเชื่อมต่อ server ได้" };
  }
};