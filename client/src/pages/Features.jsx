import React from "react";

export default function Features() {
  const features = [
    {
      color: "from-sky-400 to-sky-600",
      icon: (
        <svg
          className="w-12 h-12 mb-4"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" />
        </svg>
      ),
      title: "Easy Reporting",
      desc: "Create complaints with titles, descriptions, and precise locations.",
    },
    {
      color: "from-green-400 to-green-600",
      icon: (
        <svg
          className="w-12 h-12 mb-4"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18" />
        </svg>
      ),
      title: "Status Tracking",
      desc: "Track updates from open to resolved with real-time notifications.",
    },
    {
      color: "from-purple-400 to-purple-600",
      icon: (
        <svg
          className="w-12 h-12 mb-4"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 
            1.79-4 4 1.79 4 4 4z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18v-1a6 6 0 0112 0v1"
          />
        </svg>
      ),
      title: "Admin Dashboard",
      desc: "Admins manage, prioritize, and analyze incoming complaints.",
    },
    {
      color: "from-red-400 to-red-600",
      icon: (
        <svg
          className="w-12 h-12 mb-4"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 11c1.104 0 2-.896 2-2s-.896-2-2-2-2 
            .896-2 2 .896 2 2 2z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 22s8-7 8-12c0-4.418-3.582-8-8-8s-8 
            3.582-8 8c0 5 8 12 8 12z"
          />
        </svg>
      ),
      title: "Secure Data",
      desc: "All user data and complaints are securely stored and encrypted.",
    },
    {
      color: "from-yellow-400 to-yellow-600",
      icon: (
        <svg
          className="w-12 h-12 mb-4"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 1v22m11-11H1" />
        </svg>
      ),
      title: "Mobile Friendly",
      desc: "Easily report and track issues from any device, anytime.",
    },
  ];

  return (
    <section className="bg-gradient-to-b from-white-100 via-white to-white-100 min-h-screen">
      {/* Decorative Blobs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-sky-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000"></div>

      <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
        <h2 className="text-4xl md:text-5xl font-extrabold mb-20 bg-gradient-to-r from-sky-700 to-purple-700 bg-clip-text text-transparent">
          ✨ Key Features
        </h2>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-12">
          {features.map((f, idx) => (
            <div
              key={idx}
              className="bg-white/70 backdrop-blur-xl rounded-3xl p-10 shadow-xl border border-gray-100 
              hover:shadow-2xl hover:-translate-y-3 hover:rotate-1 transform transition-all duration-500 group animate-fade-in"
              style={{ animationDelay: `${idx * 150}ms`, animationFillMode: "forwards" }}
            >
              {/* Icon with glow */}
              <div
                className={`mx-auto flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r ${f.color} text-white shadow-lg shadow-${f.color}/40 mb-6 group-hover:scale-110 transition-transform duration-500`}
              >
                {f.icon}
              </div>
              <h3 className="text-2xl font-semibold mb-3 text-sky-900 group-hover:text-sky-600 transition-colors duration-300">
                {f.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
