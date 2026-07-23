import { useState } from "react";

export default function ImageWithFallback({ src, alt, className, style, draggable }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={className}
        style={{
          ...style,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1e293b",
          color: "#64748b",
          fontSize: 11,
          textAlign: "center",
          padding: 8,
        }}
      >
        Image unavailable
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      draggable={draggable}
      onError={() => setFailed(true)}
    />
  );
}
