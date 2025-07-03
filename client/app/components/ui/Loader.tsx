// components/Loader.tsx
import React from 'react';

const Loader: React.FC = () => {
  return (
    <div className="loader">
      <img src="/assets/images/loader.gif" alt="Loading..." className="gif" />
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
