
const API_URL = import.meta.env.VITE_API_URL;

export const getFileUrl = (filePath) => {
    if (!filePath) return '';

    // ถ้าเป็น URL เต็มอยู่แล้ว
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
        return filePath;
    }

    // ถ้าเป็น path relative
    return `${API_URL.replace(/\/$/, '')}/${filePath.replace(/^\/?/, '')}`;
};
