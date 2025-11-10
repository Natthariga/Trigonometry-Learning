import Swal from "sweetalert2";
import { banChats } from "../api/chats";

export const handleBan = async (student) => {
  const { value: reason } = await Swal.fire({
    title: `แบน ${student.student_name}`,
    input: "text",
    inputLabel: "เหตุผลการแบน",
    inputPlaceholder: "กรอกเหตุผล...",
    confirmButtonText: "แบน",
    cancelButtonText: "ยกเลิก",
    showCancelButton: true,
  });

  if (!reason) return;

  try {
    const res = await banChats({
      student_id: student.student_id,
      reason,
      duration_days: 3, 
    });

    if (res.status === "success") {
      Swal.fire("สำเร็จ", `แบน ${student.student_name} เรียบร้อย 3 วัน`, "success");
    } else {
      Swal.fire("ผิดพลาด", res.message || "ไม่สามารถแบนนักเรียนได้", "error");
    }
  } catch (err) {
    console.error(err);
    Swal.fire("ผิดพลาด", "ไม่สามารถเชื่อมต่อ server ได้", "error");
  }
};
