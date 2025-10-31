import http from "../http";

// ดึงรายการข้อสอบทั้งหมด
export const getExams = async () => {
  const { data } = await http.get("/teachers/exams/get_exams.php");
  return data;
};

// ลบข้อสอบ / subchapter
export const deleteSubchapterExam = async (subchapterId) => {
  const { data } = await http.post(
    "/teachers/subchapter/delete_subchapter.php",
    { subchapter_id: subchapterId }
  );
  return data;
};

// เพิ่มข้อสอบใหม่
export const addExamQuestions = async (formData) => {
  const { data } = await http.post(
    "/teachers/exams/add_question.php",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return data;
};

// edit
// ดึงข้อสอบจาก subchapter
export const getExamDetail = async (subchapterId) => {
  const { data } = await http.get(
    `/teachers/exams/get_exam_detail.php?subchapter_id=${subchapterId}`
  );
  return data;
};

// อัปเดตข้อสอบ
export const updateExam = async (payload, files = []) => {
  const formData = new FormData();
  formData.append("data", JSON.stringify(payload));

  files.forEach(({ key, file }) => {
    if (file instanceof File) {
      formData.append(key, file);
    }
  });

  const { data } = await http.post(
    "/teachers/exams/update_exam.php",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return data;
};
