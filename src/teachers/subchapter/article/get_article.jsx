import { useEffect, useState } from "react";
import { getArticles, deleteArticle } from "../../../api/teachers/article";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { Plus, Trash2, Pencil, Clock } from "lucide-react";
import Sidebar from "../../../components/sidebarAdmin";
import { FaPlus } from "react-icons/fa";
import SearchAndSort from "../../../components/search";
import { useLocation } from "react-router-dom";

const ArticlesList = () => {
    const [articles, setArticles] = useState([]);
    const location = useLocation();
    const { subchapter_id } = location.state || {};
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOption, setSortOption] = useState("desc");
    const sortOptions = [
        { value: "desc", label: "ลำดับ" },
        { value: "name", label: "เรียงตามชื่อ (ก-ฮ)" },
        { value: "latest", label: "ล่าสุด" },
    ];


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

    const handleInsert = () => {
        navigate('/teacher/article/insert' , {state:{subchapter_id}});
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
                setArticles(prev => prev.filter(a => a.articles_id !== id));
            }
            else {
                Swal.fire('ผิดพลาด', data.message, 'error');
            }
        }
    };

    const handleEdit = async (id) => {
        navigate(`/teacher/article/edit/${id}`);
    };

    return (
        <section className="flex min-h-screen">
            <Sidebar />
            <div className="flex-1 p-8 w-full overflow-y-auto">
                {/* หัวข้อบนสุด */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4 md:gap-0">
                    <div className="flex items-center space-x-2 text-sm text-gray-700 bg-gray-50 px-4 py-2 rounded-full whitespace-nowrap">
                        <Clock size={16} className="text-blue-500" />
                        <span>
                            {new Date().toLocaleDateString('th-TH', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </span>
                    </div>

                    <SearchAndSort
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        sortValue={sortOption}
                        onSortChange={(v) => setSortOption(v)}
                        sortOptions={sortOptions}
                    />

                </div>

                <div id="topic" className="relative flex justify-between items-center my-10 bg-white border border-gray-100 p-3 rounded">
                    <div className="absolute left-0 top-0 h-full w-1 rounded-l-2xl bg-blue-500" />

                    <div className="pl-4">
                        <h1 className="text-[22px] font-semibold text-blue-700">สรุปเนื้อหา</h1>
                    </div>

                    <button
                        onClick={() => handleInsert()}
                        className="flex justify-center items-center w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow transition duration-200 transform hover:scale-105">
                        <FaPlus className="w-4 h-4" />
                    </button>
                </div>

                <div className="space-y-3">
                    {articles.length === 0 ? (
                        <p className="text-center">ไม่มีบทความ</p>
                    ) : (
                        articles.map((article) => (
                            <div key={article.articles_id} className="relative p-4 border border-gray-200 rounded-sm hover:bg-gray-100 flex justify-between items-center">
                                <span
                                    className=""
                                // onClick={() => handleClick(article.articles_id)}
                                >
                                    {article.title}
                                </span>
                                <div className="flex gap-2 ml-4">
                                    <button onClick={(e) => { e.stopPropagation(); handleEdit(article.articles_id) }} className="bg-yellow-500 w-7 h-8 flex justify-center items-center rounded transition-transform duration-300 hover:-translate-y-1"><Pencil className="text-white" size={18} /></button>
                                    <button onClick={(e) => { e.stopPropagation(); handleDelete(article.articles_id) }} className="bg-red-500 w-7 h-8 flex justify-center items-center rounded transition-transform duration-300 hover:-translate-y-1"><Trash2 className="text-white" size={18} /></button>
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
