import { useEffect, useState } from "react";
import { getArticles , deleteArticle} from "../../api/teachers/article";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { Plus, Trash2, Pencil } from "lucide-react";

const ArticlesList = () => {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const fetchArticles = async () => {
        setLoading(true);
        try {
            const result = await getArticles();
            setArticles(result);
        } catch (err) {
            console.error("Failed to fetch articles:", err);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchArticles();
    }, []);

    const handleClick = (id) => {
        navigate(`/article/${id}`);
    };

    const handleInsert = () => {
        navigate('/article/insert');
    }

    const handleDelete = async (id) => {
        const confirm = await
            Swal.fire({
                text: 'ต้องการลบบทความนี้หรือไม่?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'ตกลง',
                cancelButtonText: 'ยกเลิก',
            });
        if (confirm.isConfirmed) {
            const data = await deleteArticle(id);
            if (data.success) {
                Swal.fire('สำเร็จ', data.message, 'success');
                setArticles(prev => prev.filter(a => a.id !== id));
            }
            else {
                Swal.fire('ผิดพลาด', data.message, 'error');
            }
        }
    };

    const handleEdit = async (id) => {
         navigate(`/article/edit/${id}`);
    };

    return (
        <section className="flex flex-col items-center justify-center min-h-screen w-full">
            <div className="flex-1 rounded-md p-6 pt-18 w-full overflow-y-auto container text-[18px]">
                <div className="border-l-4 mb-4 border-blue-800 flex items-center justify-between">
                    <div className="text-[30px] semibold ml-2 font-semibold">เนื้อหาบท<span className="text-blue-700">นิยาม</span></div>
                    <button className="bg-blue-600 w-9 h-9 rounded-full flex items-center justify-center transition-transform duration-300 hover:-translate-y-1 " title="เพิ่มบทความ" onClick={handleInsert}><Plus className="text-white" /></button>
                </div>
                <hr className="border-blue-200" />
                <div className="space-y-3">
                    {articles.length === 0 ? (
                        <p className="text-center">ไม่มีบทความ</p>
                    ) : (
                        articles.map((article) => (
                            <div key={article.id} className="relative p-4 border rounded-sm hover:bg-gray-100 flex justify-between items-center">
                                <span className="cursor-pointer" onClick={() => handleClick(article.id)}>{article.title}</span>
                                <div className="flex gap-2 ml-4">
                                    <button onClick={(e) => { e.stopPropagation(); handleEdit(article.id) }} className="bg-yellow-500 w-7 h-8 flex justify-center items-center rounded transition-transform duration-300 hover:-translate-y-1"><Pencil className="text-white" size={18} /></button>
                                    <button onClick={(e) => { e.stopPropagation(); handleDelete(article.id) }} className="bg-red-500 w-7 h-8 flex justify-center items-center rounded transition-transform duration-300 hover:-translate-y-1"><Trash2 className="text-white" size={18} /></button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </section>
    );
};

export default ArticlesList;
