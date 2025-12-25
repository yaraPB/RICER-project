'use client';

import NavBar from '@/src/components/NavBar';

export default function HomePage() {
  return (
    <div style={{ margin: 0, padding: 0, overflow: 'hidden' }}>
      <NavBar />
      
      <div className="relative overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute top-0 left-0 w-full h-[100vh] object-cover brightness-50 z-0"
        >
          <source src="/home-vid.mp4" type="video/mp4" />
        </video>

        <div className="relative z-10 flex flex-col gap-3.5 items-center justify-center h-[100vh] text-white text-5xl font-bold text-center px-4">
          <p>Ensuring the safety of everybody.</p>
          <p>One report at a time.</p>
        </div>
      </div>
    </div>
  );
}