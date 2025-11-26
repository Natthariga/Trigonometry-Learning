import { useEffect, useRef } from "react";

const GeoGraph = ({ equation }) => {
  const containerRef = useRef(null);
  const ggbRef = useRef(null);

  const formatEquation = (eq) => {
    if (!eq) return "";
    eq = eq.trim()
      .replace(/\\\\/g, "\\")        
      .replace(/\\\s*/g, "")         
      .replace(/\s+/g, " ");        

    eq = eq.replace(/^y\s*=\s*/i, "f(x)=");

    eq = eq.replace(/\b(sin|cos|tan|log|exp|sqrt)\s*(x)?\b/gi, (match, func, x) => {
      return x ? `${func}(x)` : `${func}`;
    });

    return eq;
  };

  const initApplet = () => {
    if (!containerRef.current || !window.GGBApplet) return;

    containerRef.current.innerHTML = "";

    const ggbApp = new window.GGBApplet(
      {
        appName: "graphing",
        width: 500,
        height: 400,
        showToolBar: false,
        showAlgebraInput: false,
        showMenuBar: false,
        appletOnLoad: () => {
          const appletObj = ggbApp.getAppletObject();
          ggbRef.current = appletObj;
          if (appletObj && equation) {
            const eq = formatEquation(equation);
            appletObj.evalCommand(eq);
          }
        },
      },
      true
    );

    ggbApp.inject(containerRef.current);
  };

  useEffect(() => {
    if (
      !document.querySelector(
        'script[src="https://cdn.geogebra.org/apps/deployggb.js"]'
      )
    ) {
      const ggbScript = document.createElement("script");
      ggbScript.src = "https://cdn.geogebra.org/apps/deployggb.js";
      ggbScript.onload = () => {
        initApplet();
      };
      document.body.appendChild(ggbScript);
    } else {
      initApplet();
    }
  }, []);

  useEffect(() => {
    if (ggbRef.current && equation) {
      const eq = formatEquation(equation);
      ggbRef.current.evalCommand(eq);
    }
  }, [equation]);

  return <div ref={containerRef} className="w-[800px] h-[500px]"></div>;
};

export default GeoGraph;
