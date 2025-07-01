import React from 'react';
import homeVid from '../assets/home-vid.mp4';

const Home = () => {
  return (
    <>
  
      <div className="relative overflow-hidden">
        <video
          src={homeVid}
          autoPlay
          loop
          muted
          className="absolute top-0 left-0 w-full h-[100vh] object-cover brightness-50 z-0"
        />


        <div className="relative z-10 flex flex-col gap-3.5 items-center justify-center h-[100vh] text-white text-5xl font-bold text-center px-4">
          <p> Ensuring the safety of everybody.</p>
          <p>One report at a time.</p>
        </div>
      </div>




    </>
  );
};

export default Home;
