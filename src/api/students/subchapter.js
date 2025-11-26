import http from "../http";

// subchapter_list
// ดึงข้อมูล subchapters
export const getSubchapters = async (studentId) => {
    const { data } = await http.get(`/students/subchapter/get_subchapter.php?student_id=${studentId}`);
    return data;
};

// ดึง pretest data
export const getPretestData = async (studentId) => {
    const { data } = await http.get(`/students/exams/get_score.php?student_id=${studentId}`);
    return data;
};

// lesson
// ดึงข้อมูล popup ของ subchapter
export const getPopups = async (subchapterId, studentId) => {
    const { data } = await http.get(
        `/students/subchapter/popup/popup_detail.php`,
        { params: { subchapter_id: subchapterId, student_id: studentId } }
    );
    return data;
};

// ดึงข้อมูล subchapter detail
export const getSubchapterDetail = async (subchapterId) => {
    const { data } = await http.get(
        `/students/subchapter/get_subchapter.php`,
        { params: { subchapter_id: subchapterId } }
    );
    return data;
};

// เพิ่ม/ลบบทเรียนที่ชอบ
export const toggleFavorite = async (subchapterId) => {
    const { data } = await http.post(
        `/students/subchapter/favorite/add_favorite.php`,
        { subchapter_id: subchapterId },
        { withCredentials: true }
    );
    return data;
};

// เช็ค favorite
export const checkFavorite = async (subchapterId) => {
  const { data } = await http.get(
    "/students/subchapter/favorite/check_favorite.php",
    { params: { subchapter_id: subchapterId }, withCredentials: true }
  );
  return data;
};

// ดึง progress ของนักเรียนใน subchapter
export const getProgress = async (studentId, subchapterId) => {
  try {
    const { data } = await http.get(
      "/students/subchapter/progress/get_progress.php",
      { params: { student_id: studentId, subchapter_id: subchapterId } }
    );
    return data;
  } catch (err) {
    console.error("❌ Error fetching progress:", err);
    return null;
  }
};

// อัปเดต progress
export const updateProgress = async ({
  student_id,
  subchapter_id,
  current_time,
  max_time,
  watched_to_end = 0,
  is_completed = 0,
}) => {
  try {
    const formData = new FormData();
    formData.append("student_id", student_id);
    formData.append("subchapter_id", subchapter_id);
    formData.append("current_time", current_time);
    formData.append("max_time", max_time);
    formData.append("watched_to_end", watched_to_end);
    formData.append("is_completed", is_completed);

    console.log("ส่งไปที่ PHP:", Object.fromEntries(formData.entries()));

    const res = await http.post(
      "/students/subchapter/progress/update_progress.php",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    console.log("Progress saved:", res.data);
    return res.data;
  } catch (err) {
    console.error("Error updating progress:", err);
    return null;
  }
};


// favorite_list
// ดึงรายการ favorite
export const getFavorites = async (userId) => {
  const { data } = await http.get(
    `/students/subchapter/favorite/get_favorite.php`,
    { params: { user_id: userId } }
  );
  return data;
};

// ลบ favorite
export const deleteFavorite = async ({ id, user_id }) => {
  const { data } = await http.post(
    `/students/subchapter/favorite/delete_favorite.php`,
    { id, user_id },
    { headers: { "Content-Type": "application/json" } }
  );
  return data;
};

