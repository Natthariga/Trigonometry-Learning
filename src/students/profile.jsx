import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../components/navBar";
import Footer from "../components/footer";
import { getUserId } from "../js/auth";
import { getUserProfile, uploadProfileImage, updateUserPassword } from "../api/profile";
import { getFileUrl } from "../js/getFileUrl";
import Swal from "sweetalert2";

const EditProfile = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    picture_profile: "",
  });
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const fileInputRef = useRef(null);

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  // โหลดข้อมูลผู้ใช้
  useEffect(() => {
    const userId = getUserId();
    if (!userId) return;

    getUserProfile(userId)
      .then((data) => {
        if (data.status === "success") {
          setForm({
            first_name: data.data.first_name || "",
            last_name: data.data.last_name || "",
            picture_profile: data.data.picture_profile || "",
          });
        } else {
          Swal.fire("ผิดพลาด", "โหลดข้อมูลผู้ใช้ไม่สำเร็จ", "error");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setLoading(false);
      });
  }, []);

  // เลือกรูปโปรไฟล์
  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const userId = getUserId();
      const data = await uploadProfileImage(userId, file);

      if (data.status === "success") {
        setForm((prev) => ({ ...prev, picture_profile: data.image_url }));
        Swal.fire("สำเร็จ", "อัปโหลดรูปโปรไฟล์เรียบร้อย", "success");
      } else {
        Swal.fire("ผิดพลาด", data.message, "error");
      }
    } catch (err) {
      console.error("Upload error:", err);
      Swal.fire("ผิดพลาด", "ไม่สามารถอัปโหลดรูปได้", "error");
    }
  };

  // เปลี่ยนรหัสผ่าน
  const handlePasswordChange = async () => {
    if (!password || !confirmPassword) {
      Swal.fire("ผิดพลาด", "กรุณากรอกรหัสผ่านให้ครบ", "warning");
      return;
    }
    if (password !== confirmPassword) {
      Swal.fire("ผิดพลาด", "รหัสผ่านไม่ตรงกัน", "error");
      return;
    }

    try {
      const userId = getUserId();
      const data = await updateUserPassword(userId, password);

      if (data.status === "success") {
        Swal.fire("สำเร็จ", "รหัสผ่านถูกอัปเดตแล้ว", "success");
        setPassword("");
        setConfirmPassword("");
      } else {
        Swal.fire("ผิดพลาด", data.message, "error");
      }
    } catch (err) {
      console.error("Password update error:", err);
      Swal.fire("ผิดพลาด", "เกิดข้อผิดพลาดในฝั่งเซิร์ฟเวอร์", "error");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="text-gray-500 text-lg animate-pulse">
          กำลังโหลดข้อมูลผู้ใช้...
        </span>
      </div>
    );
  }

  return (
    <section className="flex flex-col min-h-screen bg-gray-50">
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      <div className="flex-1 p-8 pt-32 w-full overflow-y-auto max-w-3xl mx-auto">
        <div className="bg-white shadow-sm rounded-xl p-8 flex flex-col items-center gap-6">
          {/* รูปโปรไฟล์ */}
          <div className="relative cursor-pointer" onClick={handleImageClick}>
            <img
              src={form.picture_profile ? getFileUrl(form.picture_profile) : "https://avatar.iran.liara.run/public"}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover border-4 border-blue-500 shadow-md"
            />
            <span className="absolute bottom-2 right-2 bg-blue-600 text-white rounded-full p-1 text-sm">
              ✎
            </span>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* ชื่อ-นามสกุล */}
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-800">
              {form.first_name} {form.last_name}
            </h2>
          </div>

          {/* รหัสผ่าน */}
          <div className="w-full mt-3 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">รหัสผ่านใหม่</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">ยืนยันรหัสผ่าน</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <button
              onClick={handlePasswordChange}
              className="w-full py-3 rounded-lg bg-blue-600 text-white font-semibold shadow-md hover:bg-blue-700 transition"
            >
              เปลี่ยนรหัสผ่าน
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </section>
  );
};

export default EditProfile;
