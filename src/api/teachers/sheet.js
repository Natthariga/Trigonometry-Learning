import http from "../http";

// ดึงชีททั้งหมด
export const getSheets = async () => {
  const { data } = await http.get("/teachers/sheet/get_sheet.php");
  return data;
};

// ลบชีท
export const deleteSheet = async (sheet_id) => {
  const { data } = await http.put("/teachers/sheet/delete_sheet.php", {
    sheet_id,
  });
  return data;
};


// approve
// ดึงชีทที่อนุมัติแล้ว
export const getApprovedSheets = async () => {
  const { data } = await http.get("/teachers/sheet/get_approved.php");
  return data;
};

// อนุมัติหรือปฏิเสธชีท
export const approveOrRejectSheet = async (sheet_id, action) => {
  const { data } = await http.post("/teachers/sheet/is_approved.php", {
    sheet_id,
    action,
  });
  return data;
};
