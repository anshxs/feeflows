'use client';

export default function Loading() {
  return (
    <>
      <style jsx>{`
        @keyframes rainbow {
          0% {
            background-position: 0% 50%;
          }
          100% {
            background-position: 200% 50%;
          }
        }
      `}</style>
      <div
        className="fixed top-0 left-0 w-full h-1 z-50"
        style={{
          backgroundImage:
            "linear-gradient(to right, #ec4899, #facc15, #3b82f6)",
          backgroundSize: "200% 100%",
          animation: "rainbow 2s linear infinite",
        }}
      />
    </>
  );
}
