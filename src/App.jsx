import { Canvas } from "@react-three/fiber";
import { Leva } from "leva";
import { Loader } from "@react-three/drei";
import { Experience } from "./components/Experience";
import { UI } from "./components/UI";
import { useState, useEffect } from "react";

function App() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // 检测移动设备
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const mobileKeywords = ['mobile', 'android', 'iphone', 'ipad', 'ipod', 'blackberry', 'windows phone'];
      return mobileKeywords.some(keyword => userAgent.includes(keyword)) || window.innerWidth < 768;
    };

    setIsMobile(checkMobile());

    // 监听窗口大小变化
    const handleResize = () => {
      setIsMobile(checkMobile());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 移动端优化配置
  const canvasConfig = {
    camera: { position: [0, 0, 1], fov: 30 },
    shadows: !isMobile, // 移动端禁用阴影
    dpr: isMobile ? [1, 1.5] : [1, 2], // 移动端降低像素比
    performance: {
      min: isMobile ? 0.2 : 0.5, // 移动端更激进的性能优化
    },
    gl: {
      powerPreference: isMobile ? "low-power" : "high-performance",
      antialias: !isMobile, // 移动端禁用抗锯齿
    }
  };

  return (
    <>
      <Loader />
      <Leva hidden />
      <UI hidden={false} isMobile={isMobile} />
      <Canvas {...canvasConfig}>
        <Experience isMobile={isMobile} />
      </Canvas>
    </>
  );
}

export default App;
