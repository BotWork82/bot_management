import React from "react";

export function Loader({ size = "md", className = "" }: { size?: "sm" | "md" | "lg"; className?: string }) {
  const dim = size === "sm" ? 6 : size === "lg" ? 10 : 8;
  const style = {
    width: `${dim * 1}px`,
    height: `${dim}px`
  } as React.CSSProperties;

  return (
    <div className={`inline-flex items-center justify-center ${className}`} style={style}>
      <style>{`
        @keyframes loader-move {
          0% { transform: translateX(0); }
          50% { transform: translateX(10px); }
          100% { transform: translateX(0); }
        }
        .loader-dot {
          width: 8px;
          height: 8px;
          border-radius: 9999px;
          background: rgba(100,116,139,1);
        }
        .loader-container { display: flex; gap: 6px; align-items: center; }
        .loader-dot:nth-child(1) { animation: loader-move 0.9s ease-in-out infinite; animation-delay: 0s; }
        .loader-dot:nth-child(2) { animation: loader-move 0.9s ease-in-out infinite; animation-delay: 0.15s; }
        .loader-dot:nth-child(3) { animation: loader-move 0.9s ease-in-out infinite; animation-delay: 0.3s; }
      `}</style>
      <div className="loader-container" aria-hidden="true">
        <div className="loader-dot" />
        <div className="loader-dot" />
        <div className="loader-dot" />
      </div>
    </div>
  );
}

export default Loader;

