import React, { useState, useEffect, useRef } from "react";
import { getUserProfile, uploadProfileImage, updateUserPassword } from "../../api/profile";
import { getFileUrl } from "../../js/getFileUrl";
import Swal from "sweetalert2";

const EditProfileModal = ({ isOpen, onClose, userId, onUpdateUser }) => {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    picture_profile: "",
  });
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const fileInputRef = useRef(null);

  // โหลดข้อมูลผู้ใช้
  useEffect(() => {
    if (!userId || !isOpen) return;

    setLoading(true);
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
      })
      .catch((err) => {
        console.error("Fetch error:", err);
      })
      .finally(() => setLoading(false));
  }, [userId, isOpen]);

  // เลือกรูปโปรไฟล์
  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const data = await uploadProfileImage(userId, file);

      if (data.status === "success") {
        const updatedUser = {
          ...form,
          picture_profile: data.image_url,
        };
        setForm(updatedUser);
        onUpdateUser?.(updatedUser);
        Swal.fire("สำเร็จ", "อัปโหลดรูปโปรไฟล์เรียบร้อย", "success");
        onClose();
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
      const data = await updateUserPassword(userId, password);
      if (data.status === "success") {
        Swal.fire("สำเร็จ", "รหัสผ่านถูกอัปเดตแล้ว", "success");
        setPassword("");
        setConfirmPassword("");
        onClose();
      } else {
        Swal.fire("ผิดพลาด", data.message, "error");
      }
    } catch (err) {
      console.error("Password update error:", err);
      Swal.fire("ผิดพลาด", "เกิดข้อผิดพลาดในฝั่งเซิร์ฟเวอร์", "error");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>

        {loading ? (
          <div className="flex justify-center items-center h-60">
            <span className="text-gray-500 text-lg animate-pulse">
              กำลังโหลดข้อมูล...
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6">
            {/* รูปโปรไฟล์ */}
            <div className="relative cursor-pointer" onClick={handleImageClick}>
              <img
                src={
                  form.picture_profile
                    ? getFileUrl(form.picture_profile)
                    : "https://avatar.iran.liara.run/public"
                }
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

            {/* ชื่อ - นามสกุล */}
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-800">
                {form.first_name} {form.last_name}
              </h2>
            </div>

            {/* เปลี่ยนรหัสผ่าน */}
            <div className="w-full space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  รหัสผ่านใหม่
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  ยืนยันรหัสผ่าน
                </label>
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
        )}
      </div>
    </div>
  );
};

export default EditProfileModal;