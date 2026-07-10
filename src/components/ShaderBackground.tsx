'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from '@/context/ThemeContext';

const ShaderGradientCanvas = dynamic(
  () => import('@shadergradient/react').then((mod) => mod.ShaderGradientCanvas),
  { ssr: false }
);

const ShaderGradient = dynamic(
  () => import('@shadergradient/react').then((mod) => mod.ShaderGradient),
  { ssr: false }
);

export default function ShaderBackground() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Return static fallback container during SSR/hydration to avoid mismatches
  if (!mounted) {
    const isDark = theme === 'dark';
    return <div className={`fixed inset-0 w-full h-full -z-10 transition-colors duration-500 ${isDark ? 'bg-[#0E1A16]' : 'bg-[#f4f2ee]'}`} />;
  }

  const isDark = theme === 'dark';

  return (
    <div className={`fixed inset-0 w-full h-full -z-10 pointer-events-none overflow-hidden transition-colors duration-500 ${isDark ? 'bg-[#0E1A16]' : 'bg-[#f4f2ee]'}`}>
      <ShaderGradientCanvas
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
        pixelDensity={1}
        fov={45}
      >
        {isDark ? (
          <ShaderGradient
            key="dark-shader"
            animate="off"
            axesHelper="off"
            bgColor1="#000000"
            bgColor2="#000000"
            brightness={1.2}
            cAzimuthAngle={180}
            cDistance={2.82}
            cPolarAngle={80}
            cameraZoom={9.1}
            color1="#0E1A16"
            color2="#1F2E25"
            color3="#0A3C3A"
            destination="onCanvas"
            embedMode="off"
            envPreset="city"
            format="gif"
            fov={45}
            frameRate={10}
            gizmoHelper="hide"
            grain="off"
            lightType="env"
            pixelDensity={1}
            positionX={0}
            positionY={0}
            positionZ={0}
            range="disabled"
            rangeEnd={40}
            rangeStart={0}
            reflection={0}
            rotationX={50}
            rotationY={0}
            rotationZ={-60}
            shader="defaults"
            type="waterPlane"
            uAmplitude={0}
            uDensity={1.5}
            uFrequency={0}
            uSpeed={0.3}
            uStrength={1.5}
            uTime={8}
            wireframe={false}
          />
        ) : (
          <ShaderGradient
            key="light-shader"
            animate="off"
            axesHelper="off"
            bgColor1="#000000"
            bgColor2="#000000"
            brightness={1.1}
            cAzimuthAngle={180}
            cDistance={2.82}
            cPolarAngle={80}
            cameraZoom={9.1}
            color1="#D8CBB3"
            color2="#A8CFA3"
            color3="#5E8A68"
            destination="onCanvas"
            embedMode="off"
            envPreset="city"
            format="gif"
            fov={45}
            frameRate={10}
            gizmoHelper="hide"
            grain="off"
            lightType="env"
            pixelDensity={1}
            positionX={0}
            positionY={0}
            positionZ={0}
            range="disabled"
            rangeEnd={40}
            rangeStart={0}
            reflection={0}
            rotationX={50}
            rotationY={0}
            rotationZ={-60}
            shader="defaults"
            type="waterPlane"
            uAmplitude={0}
            uDensity={1.5}
            uFrequency={0}
            uSpeed={0.3}
            uStrength={1.5}
            uTime={8}
            wireframe={false}
          />
        )}
      </ShaderGradientCanvas>
    </div>
  );
}
