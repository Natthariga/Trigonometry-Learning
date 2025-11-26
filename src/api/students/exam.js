import http from "../http";

// ดึงคะแนน pretest/posttest
export const getStudentScores = async (studentId, subchapterId = null) => {
  const { data } = await http.get(`/students/exams/get_score.php`, {
    params: subchapterId ? { student_id: studentId, subchapter_id: subchapterId } : { student_id: studentId }
  });
  return data;
};

// โหลดคำถามข้อสอบ (pretest/posttest ใช้ endpoint เดียวกัน)
export const getExamQuestions = async (subchapterId) => {
  const { data } = await http.post(`/students/exams/question.php`, {
    subchapter_id: subchapterId,
  });
  return data;
};

// บันทึก pretest
export const submitPretest = async (payload) => {
  const { data } = await http.post(`/students/exams/insert_pretest.php`, payload);
  return data;
};

// บันทึก posttest
export const submitPosttest = async (payload) => {
  const { data } = await http.post(`/students/exams/insert_posttest.php`, payload);
  return data;
};
