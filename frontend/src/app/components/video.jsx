"use client";
import { useInView } from "motion/react";
import { useRef, useEffect } from "react";

export default function VideoOverlay({ children }) {
  const ref = useRef(null);
  const videoRef = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.2;
    }
  }, []);

  return (
    <div ref={ref} className="min-h-screen relative">
      <div className="absolute top-0 left-0 w-full h-screen z-20">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className="h-full w-full object-cover"
          style={{
            filter: isInView ? "brightness(0.1)" : "brightness(0)",
            transition: "all 0.9s cubic-bezier(0.17, 0.55, 0.55, 1) 0.5s",
          }}
        >
          <source src="/bg.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
      <div className="relative z-50 min-h-screen">{children}</div>
    </div>
  );
}
