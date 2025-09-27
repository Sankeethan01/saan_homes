// components/Loader.tsx
import React from 'react';
import Image from 'next/image';

const Loader: React.FC = () => {
  return (
    <div className="loader">
      <Image 
        src="/assets/images/loader.gif" 
        alt="Loading..." 
        className="gif" 
        width={120}
        height={120}
        priority
      />
      <style jsx>{`
        .loader {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
        }

        .gif {
          width: 120px;
          height: auto;
        }
      `}</style>
    </div>
  );
};

export default Loader;
