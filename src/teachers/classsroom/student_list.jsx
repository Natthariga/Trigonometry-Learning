import React, { useState, useEffect } from "react";
import Sidebar from "../../components/sidebarAdmin";
import { FaCheckCircle, FaTimesCircle, FaSearch, FaSort, FaPlus } from "react-icons/fa";
import { Pencil, Trash2 } from "lucide-react";
import EditProfileModal from "../member/edit_user";
import Swal from "sweetalert2";
import { useLocation } from "react-router-dom";
import {
  getStudentsInClassroom,
  getAvailableStudents,
  addStudentToClassroom,
  deleteStudent,
} from "../../api/teachers/classroom";

const StudentList = () => {
  const location = useLocation();
  const classroomId = location.state?.classroomId;

  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [sortOption, setSortOption] = useState("name");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  // Popup state
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");

  // โหลดนักเรียนในห้อง
  useEffect(() => {
    if (!classroomId) return;
    getStudentsInClassroom(classroomId)
      .then((res) => {
        if (res.status === "success") {
          setUsers(res.data);
        }
      })
      .catch((err) => console.error("Error fetching students:", err));
  }, [classroomId]);

  // โหลดนักเรียนที่ยังไม่อยู่ในห้อง (ตอนเปิด popup)
  useEffect(() => {
    if (showAddPopup) {
      getAvailableStudents()
        .then((res) => {
          if (res.status === "success") {
            setAvailableStudents(res.data);
          }
        })
        .catch((err) => console.error("Error fetching available students:", err));
    }
  }, [showAddPopup]);

  // เปิด modal แก้ไข
  const openModal = (userId) => {
    setSelectedUserId(userId);
    setIsModalOpen(true);
  };

  // ลบนักเรียน
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "ใช่ ลบเลย",
      cancelButtonText: "ยกเลิก",
      text: "คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้นี้?",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await deleteStudent(id);
      if (res.status === "success") {
        setUsers((prev) => prev.filter((user) => user.user_id !== id));
        Swal.fire({ icon: "success", title: "ลบผู้ใช้สำเร็จ", timer: 1500, showConfirmButton: false });
      } else {
        Swal.fire({ icon: "error", title: "ลบผู้ใช้ไม่สำเร็จ", text: res.message });
      }
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการลบผู้ใช้:", error);
      Swal.fire({ icon: "error", title: "เกิดข้อผิดพลาด", text: "ไม่สามารถลบผู้ใช้ได้" });
    }
  };

  // เพิ่มนักเรียนเข้าห้อง
  const handleAddStudent = async () => {
    try {
      const res = await addStudentToClassroom(classroomId, selectedStudent);
      if (res.status === "success") {
        setUsers((prev) => [...prev, res.student]);
        setShowAddPopup(false);
        setSelectedStudent("");
        Swal.fire({ icon: "success", title: "เพิ่มนักเรียนสำเร็จ", timer: 1500, showConfirmButton: false });
      } else {
        Swal.fire({ icon: "error", title: "เพิ่มไม่สำเร็จ", text: res.message });
      }
    } catch (error) {
      console.error("เกิดข้อผิดพลาด:", error);
      Swal.fire({ icon: "error", title: "เกิดข้อผิดพลาด", text: "ไม่สามารถเพิ่มนักเรียนได้" });
    }
  };

  // filter + sort
  const filteredUsers = users
    .filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortOption === "name") {
        return a.name.localeCompare(b.name, "th");
      } else if (sortOption === "classroom") {
        return (a.classroom_name || "").localeCompare(b.classroom_name || "", "th", { numeric: true });
      }
      return 0;
    });

  return (
    <section className="flex min-h-screen">
      <Sidebar />
      <div className="p-8 w-full mt-5 md:mt-0">
        <div className="flex justify-between items-center mb-4 flex-col sm:flex-row">
          <div className="w-full mb-2">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
              <h2 className="text-[22px] font-semibold text-blue-900">
                รายชื่อนักเรียนห้อง {classroomId}
              </h2>
              {/* <button
                onClick={() => setShowAddPopup(true)}
                className="flex justify-center items-center w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow transition duration-200 transform hover:scale-105"
                title="เพิ่มสมาชิก"
              >
                <FaPlus className="w-4 h-4" />
              </button> */}
            </div>

            <p className="text-[16px] text-gray-600 mt-1">
              จำนวนสมาชิก: {filteredUsers.length} คน
            </p>
          </div>

          {/* Search + Sort */}
          <div className="flex gap-2 w-full justify-end">
            <div className="relative w-full sm:w-auto mb-2 sm:mb-0 flex gap-3">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <FaSearch className="h-4 w-4" />
              </span>
              <input
                type="text"
                placeholder="ค้นหา"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="relative self-start md:self-auto">
              <button
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="p-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none"
                title="เรียงลำดับ"
              >
                <FaSort />
              </button>

              {showSortMenu && (
                <div className="absolute z-10 right-0 mt-2 w-48 bg-white border rounded-md shadow-lg text-sm text-gray-700">
                  <button
                    onClick={() => { setSortOption("name"); setShowSortMenu(false); }}
                    className={`w-full px-4 py-2 text-left hover:bg-gray-100 ${sortOption === "name" ? "bg-gray-100" : ""}`}
                  >
                    เรียงตามชื่อ (ก-ฮ)
                  </button>
                  <button
                    onClick={() => { setSortOption("classroom"); setShowSortMenu(false); }}
                    className={`w-full px-4 py-2 text-left hover:bg-gray-100 ${sortOption === "classroom" ? "bg-gray-100" : ""}`}
                  >
                    เรียงตามห้องเรียน (1-11)
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 overflow-auto">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm bg-white rounded-md">
              <thead className="text-gray-700">
                <tr>
                  <th className="px-4 py-2 text-center w-12"></th>
                  <th className="px-4 py-2 text-center whitespace-nowrap">ชื่อ</th>
                  <th className="px-4 py-2 text-center whitespace-nowrap">รหัสประจำตัวนักเรียน</th>
                  <th className="px-4 py-2 text-center whitespace-nowrap">สถานะ</th>
                  {/* <th className="px-4 py-2 text-center"></th> */}
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, index) => (
                  <tr key={user.id} className="text-gray-600 text-center even:bg-white odd:bg-gray-100">
                    <td className="px-4 py-2 text-center text-gray-500">{index + 1}</td>
                    <td className="px-4 py-2 text-left whitespace-nowrap">{user.name}</td>
                    <td className="pl-4 py-2 whitespace-nowrap">{user.student_code}</td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {user.status === "active" ? (
                        <span className="text-green-700 inline-flex items-center gap-1 px-1 py-1 text-[10px] rounded">
                          <FaCheckCircle className="w-3 h-3" /> กำลังใช้งาน
                        </span>
                      ) : (
                        <span className="text-red-700 inline-flex items-center gap-1 px-2 py-1 text-[10px] rounded">
                          <FaTimesCircle className="w-3 h-3" /> ปิดการใช้งาน
                        </span>
                      )}
                    </td>
                    {/* <td className="px-4 py-2 flex gap-3 justify-center text-sm">
                      <button
                        className="text-blue-600 hover:text-blue-700"
                        title="แก้ไข"
                        onClick={() => openModal(user.user_id)}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(user.user_id)}
                        className="text-red-500 hover:text-red-700"
                        title="ลบ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td> */}
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center pt-12 text-gray-500">
                      ไม่พบผู้ใช้งาน
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Edit Modal */}
          <EditProfileModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            userId={selectedUserId}
          />
        </div>
      </div>

      {/* Add Student Popup */}
      {showAddPopup && (
        <div className="fixed inset-0 flex items-center justify-center  bg-opacity-50 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-gray-800">เพิ่มนักเรียนเข้าห้อง</h2>

            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- เลือกนักเรียน --</option>
              {availableStudents.map(stu => (
                <option key={stu.id} value={stu.id}>
                  {stu.name} ({stu.username})
                </option>
              ))}
            </select>

            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
                onClick={() => setShowAddPopup(false)}
              >
                ยกเลิก
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleAddStudent}
                disabled={!selectedStudent}
              >
                บันทึก
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default StudentList;