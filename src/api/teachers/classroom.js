import http from "../http";

// ดึงห้องเรียนที่ครูสอน
export const getTeacherClassrooms = async (teacherId) => {
  const { data } = await http.get("/teachers/classroom/get_teacher_classroom.php", {
    params: { teacher_id: teacherId },
  });
  return data;
};

// ดึงห้องเรียนทั้งหมด
export const getAllClassrooms = async () => {
  const { data } = await http.get("/teachers/classroom/get_classroom.php");
  return data;
};

// เพิ่มห้องเรียนใหม่
export const createClassroom = async (classroomName) => {
  const { data } = await http.post("/teachers/classroom/add_classroom.php", {
    classroom_name: `${classroomName}`,
  });
  return data;
};

// ผูกห้องเรียนกับครู
export const assignClassroomToTeacher = async (teacherId, classroomId) => {
  const { data } = await http.post("/teachers/classroom/add_teacher_classroom.php", {
    teacher_id: teacherId,
    classroom_id: classroomId,
  });
  return data;
};

//student_list
// โหลดนักเรียนในห้องเรียน
export const getStudentsInClassroom = async (classroomId) => {
  const { data } = await http.get("/teachers/classroom/get_student_classroom.php", {
    params: { classroom_id: classroomId },
  });
  return data;
};

// โหลดนักเรียนที่ยังไม่ได้อยู่ในห้อง
export const getAvailableStudents = async () => {
  const { data } = await http.get("/teachers/classroom/get_available_student.php");
  return data;
};

// เพิ่มนักเรียนเข้าห้อง
export const addStudentToClassroom = async (classroomId, studentId) => {
  const { data } = await http.post("/teachers/classroom/add_student_classroom.php", {
    classroom_id: classroomId,
    student_id: studentId,
  });
  return data;
};

// ลบนักเรียน (delete_member.php ใช้ร่วมกับโปรไฟล์)
export const deleteStudent = async (userId) => {
  const formData = new FormData();
  formData.append("action", "delete");
  formData.append("user_id", userId);

  const { data } = await http.post("/profile/delete_member.php", formData);
  return data;
};
