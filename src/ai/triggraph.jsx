import React, { useEffect } from "react";
import Sidebar from "../components/navBar";
import Footer from "../components/footer";
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';

const TrigGraphCompare = () => {
  useEffect(() => {
    window.scrollTo(0, 0); // บังคับเลื่อนขึ้นบนสุด
  }, []);

  return (
    <section className="flex flex-col min-h-screen w-full">
      <Sidebar />
      <div className="flex-1 rounded-md p-6 pt-32 w-full overflow-y-auto">
        {/* หัวข้อ */}
        <div className="bg-[url('/images/bg-ai.png')] bg-cover bg-center rounded-tl-md rounded-tr-md p-7 text-white mb-4">
          <h2 className="text-3xl font-bold mb-2">
            การสร้างและวิเคราะห์กราฟฟังก์ชันทางคณิตศาสตร์ด้วยกราฟ
          </h2>
        </div>

        {/* กราฟ */}
        <div className="w-full h-[80vh]">
          <iframe
            src="https://www.geogebra.org/classic"
            width="100%"
            height="100%"
            style={{ border: "none", borderRadius: 8 }}
            title="GeoGebra Classic"
            allowFullScreen
          />
        </div>
      </div>
      <Footer />
    </section>
  );
};

export default TrigGraphCompare;
