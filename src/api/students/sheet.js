import http from "../http";

// ดึงชีททั้งหมด
export const getSheets = async () => {
  const { data } = await http.get("/students/sheet/get_sheet.php");
  return data;
};

// ดึง favorite ของ user
export const getFavoriteSheets = async (userId) => {
  const { data } = await http.post("/students/sheet/check_favorite.php", {
    user_id: userId,
  });
  return data;
};

// เพิ่ม/ลบ favorite
export const toggleFavoriteSheet = async (userId, sheetId) => {
  const { data } = await http.post("/students/sheet/add_favorite.php", {
    user_id: userId,
    sheet_id: sheetId,
  });
  return data;
};

// เพิ่มชีทใหม่
export const addSheet = async (sheetData) => {
  const formData = new FormData();
  formData.append("student_id", sheetData.student_id);
  formData.append("title", sheetData.title);
  if (sheetData.coverImage) formData.append("coverImage", sheetData.coverImage);
  if (sheetData.contentFile) formData.append("contentFile", sheetData.contentFile);

  const { data } = await http.post("/students/sheet/insert_sheet.php", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data;
};

// ลบชีท
export const deleteSheet = async (sheetId) => {
  const { data } = await http.post("/students/sheet/delete_sheet.php", {
    sheet_id: sheetId,
  });
  return data;
};

// แก้ไขชีท
export const editSheet = async (sheetData) => {
  const formData = new FormData();
  formData.append("sheet_id", sheetData.sheet_id || "");
  formData.append("title", sheetData.title);
  if (sheetData.coverImage) formData.append("coverImage", sheetData.coverImage);
  if (sheetData.contentFile) formData.append("contentFile", sheetData.contentFile);

  const { data } = await http.post("/students/sheet/edit_sheet.php", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data;
};

// เพิ่ม view count
export const incrementViewCount = async (sheetId) => {
  const { data } = await http.post("/students/sheet/increment_view.php", {
    sheet_id: sheetId,
  });
  return data;
};