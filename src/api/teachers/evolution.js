import http from "../http";

// ดึงรายชื่อห้องเรียนทั้งหมด
export const getAllClassrooms = async () => {
  const { data } = await http.get("/teachers/classroom/get_classroom.php");
  return data;
};

// ดึง summary ของนักเรียน (option: room_id)
export const getStudentSummary = async (roomId = "all") => {
  const url =
    roomId !== "all"
      ? `/teachers/evolution/summary.php?room_id=${roomId}`
      : "/teachers/evolution/summary.php";
  const { data } = await http.get(url);
  return data;
};
