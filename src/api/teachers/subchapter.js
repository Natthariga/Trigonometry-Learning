import http from "../http";

// ดึง subchapter ทั้งหมด
export const getSubchapters = async () => {
    const { data } = await http.get("/teachers/subchapter/get_subchapter.php");
    return data;
};

// ลบ subchapter
export const deleteSubchapter = async (subchapter_id) => {
    const { data } = await http.post("/teachers/subchapter/delete_subchapter.php", {
        subchapter_id,
    });
    return data;
};


// เพิ่มหัวข้อย่อย
export const addSubchapter = async (formData) => {
    const { data } = await http.post(
        "/teachers/subchapter/add_subchapter.php",
        formData,
        {
            headers: { "Content-Type": "multipart/form-data" },
        }
    );
    return data;
};

// แก้ไขหัวข้อย่อย
export const editSubchapter = async (formData) => {
    const { data } = await http.post(
        "/teachers/subchapter/edit_subchapter.php",
        formData,
        {
            headers: { "Content-Type": "multipart/form-data" },
        }
    );
    return data;
};


//popup 
// เพิ่ม popup
export const insertPopup = async (payloads) => {
    const { data } = await http.post(
        "/teachers/popup/insert_popup.php",
        { popups: payloads }
    );
    return data;
};

// ดึง popup ตาม subchapter
export const getPopupsBySubchapter = async (subchapterId) => {
    const { data } = await http.get(
        `/teachers/subchapter/get_subchapter.php?subchapter_id=${subchapterId}`
    );
    return data;
};