import React from "react";

const Loader = ({ text = "System Loading..." }) => {
  return (
    <div className="flex items-center justify-center w-full h-full py-10">
      <div className="flex flex-col items-center">
        {/* Glow Spinner */}
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-electric shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
        
        {/* Text */}
        {text && <p className="mt-4 text-sm text-textSecondary font-mono tracking-widest uppercase">{text}</p>}
      </div>
    </div>
  );
};

export default Loader;
