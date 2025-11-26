import http from "../http";

// ดึงข้อมูล evolution ของนักเรียน
export const getEvolution = async (studentId) => {
  const { data } = await http.get(`/students/get_evolution.php`, {
    params: { student_id: studentId }
  });
  return data;
};
