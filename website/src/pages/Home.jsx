import React from 'react';
import homeVid from '../assets/home-vid.mp4';

const Home = () => {
  return (
    <>
      <style>{`
        /* Animate background gradient horizontally */
        .animated-gradient-bg {
          background: linear-gradient(270deg, #020024 , #090979, #00D4FF);
          background-size: 600% 600%;
          animation: gradientShift 10s ease infinite;
        }

        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

      <div className="relative overflow-hidden">
        <video
          src={homeVid}
          autoPlay
          loop
          muted
          className="absolute top-0 left-0 w-full h-[70vh] object-cover brightness-50 z-0"
        />


        <div className="relative z-10 flex flex-col gap-3.5 items-center justify-center h-[70vh] text-white text-5xl font-bold text-center px-4">
          <p> Ensuring the safety of everybody.</p>
          <p>One report at a time.</p>
        </div>
      </div>


      <div className="animated-gradient-bg p-6">
        <div className="flex flex-col md:flex-row gap-8">
          <p className="flex-1 bg-white bg-opacity-90 border border-blue-700 rounded-3xl p-6 text-center text-gray-800 text-lg shadow-md">
            Our mission is to protect lives and nature by providing real-time fire incident updates, safe zones, and coordinated emergency response tools. Together, we build a safer community for everyone.
          </p>
          <p className="flex-1 bg-white bg-opacity-90 border border-blue-700 rounded-3xl p-6 text-center text-gray-800 text-lg shadow-md">
            Join us in creating safer environments by staying informed and prepared. Your awareness can save lives.
          </p>
          <p className="flex-1 bg-white bg-opacity-90 border border-blue-700 rounded-3xl p-6 text-center text-gray-800 text-lg shadow-md">
            Our data is continuously updated and verified in collaboration with local authorities and emergency services to ensure you get accurate information.
          </p>
        </div>
      </div>

    </>
  );
};

export default Home;
