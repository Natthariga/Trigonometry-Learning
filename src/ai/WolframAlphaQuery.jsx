import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/navBar';
import Footer from '../components/footer';
import { getFileUrl } from '../js/getFileUrl';

const WolframAlphaQuery = () => {
    const [query, setQuery] = useState('');
    const [pods, setPods] = useState([]);
    const [error, setError] = useState('');

    const mathFieldRef = useRef(null);
    useEffect(() => {
        const mf = mathFieldRef.current;
    }, []);

    const handleQuery = async () => {
        const input = encodeURIComponent(query);
        const url = getFileUrl(`wolfram.php?input=${input}`);

        try {
            const res = await axios.get(url);
            const data = res.data;

            if (data.queryresult.success) {
                setPods(data.queryresult.pods);
                setError('');
            } else {
                setPods([]);
                setError('ไม่พบผลลัพธ์จาก WolframAlpha');
            }
        } catch (err) {
            console.error(err);
            setPods([]);
            setError('เกิดข้อผิดพลาดขณะเรียกข้อมูล');
        }
    };

    return (
        <section className="flex flex-col min-h-screen w-full">
            <Sidebar />
            <div className="flex-1 rounded-md p-6 pt-32 w-full overflow-y-auto">
                <div className="w-full space-y-3">
                    <p className='text-xl font-medium'>กรอกสมการตรีโกณมิติ</p>
                    <div className='flex gap-3 w-full'>
                        <input
                            type="text" value={query} onChange={(e) => setQuery(e.target.value)}
                            placeholder='ตัวอย่าง: sin(30 degree), solve sin(x)=0.5, plot tan(x)'
                            className="flex-1 border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        <button
                            onClick={handleQuery}
                            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
                        >
                            คำนวณ
                        </button>
                    </div>
                </div>

                {error && <p className="text-red-500 text-center">{error}</p>}

                {pods.length > 0 && (
                    <div className="space-y-4 mt-6">
                        {pods.map((pod) => (
                            <div key={pod.id} className="bg-gray-50 p-4 rounded-lg border">
                                <h2 className="text-lg font-semibold text-gray-800">{pod.title}</h2>
                                {pod.subpods.map((subpod, index) => (
                                    <div key={index} className="mt-2">
                                        {subpod.img?.src && (
                                            <img
                                                src={subpod.img.src}
                                                alt={subpod.img.alt}
                                                className="max-w-full h-auto rounded"
                                            />
                                        )}
                                        {/* {subpod.plaintext && (
                                            <p className="text-gray-700 mt-1">{subpod.plaintext}</p>
                                        )} */}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <Footer />
        </section>
    );
};

export default WolframAlphaQuery;
