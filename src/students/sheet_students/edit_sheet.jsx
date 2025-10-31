import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { editSheet } from "../../api/students/sheet";

const EditSheet = ({ sheetData, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: "",
    coverImage: null,
    contentFile: null,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (sheetData) {
      setFormData({
        title: sheetData.title || "",
        coverImage: null,
        contentFile: null,
      });
    }
  }, [sheetData]);

  if (!sheetData) return null;

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title) newErrors.title = "กรุณากรอกชื่อบทความ";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const payload = {
        sheet_id: sheetData?.sheet_id,
        title: formData.title,
        coverImage: formData.coverImage,
        contentFile: formData.contentFile,
      };

      const result = await editSheet(payload);

      if (result.status === "success") {
        Swal.fire({
          icon: "success",
          title: "แก้ไขเรียบร้อย",
          text: "ข้อมูลชีทถูกอัปเดตแล้ว",
        });
        onSubmit(result.updatedSheet);
        onClose();
      } else {
        Swal.fire({
          icon: "error",
          title: "เกิดข้อผิดพลาด",
          text: result.message,
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "ข้อผิดพลาด",
        text: "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้",
      });
    }
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black/50 z-50">
      <div className="bg-white p-6 rounded-xl w-[90%] max-w-md shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-center">แก้ไขบทความ</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium mb-1">
              ชื่อบทความ <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg"
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title}</p>
            )}
          </div>

          <div>
            <label className="block font-medium mb-1">รูปภาพหน้าปก</label>
            <input
              type="file"
              name="coverImage"
              accept="image/*"
              onChange={handleChange}
              className="w-full"
            />
            {sheetData.cover_image && !formData.coverImage && (
              <p className="text-gray-500 text-sm mt-1">
                ใช้รูปเดิม: {sheetData.cover_image}
              </p>
            )}
          </div>

          <div>
            <label className="block font-medium mb-1">ไฟล์เนื้อหา</label>
            <input
              type="file"
              name="contentFile"
              accept=".pdf,.doc,.docx"
              onChange={handleChange}
              className="w-full"
            />
            {sheetData.pdf_file && !formData.contentFile && (
              <p className="text-gray-500 text-sm mt-1">
                ใช้ไฟล์เดิม: {sheetData.pdf_file}
              </p>
            )}
          </div>

          <div className="flex flex-col md:flex-row justify-center gap-3 w-full">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-400 w-full"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white w-full"
            >
              บันทึก
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSheet;
