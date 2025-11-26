import http from "../http";

// ดึงข้อมูล Dashboard (classroom / student / lesson / recent lessons)
export const getDashboardData = async () => {
  const { data } = await http.get("/teachers/get_dashboard.php");
  return data;
};
