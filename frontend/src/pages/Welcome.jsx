import { useNavigate } from "react-router-dom";
import {
  PenLine,
  Users,
  GitBranch,
  Lock,
  Mic,
  BookOpenText,
  Globe,
  Sparkles,
  ArrowRight,
} from "lucide-react";

import Navbar from "../components/common/Navbar";
import { Mail, Linkedin } from "lucide-react";
import Img from "../assets/story2.jpg";

function Welcome() {
  const navigate = useNavigate();

  const topFeatures = [
    {
      title: "Write Chapters",
      desc: "Create and manage chapters smoothly with a clean workflow.",
      icon: <PenLine size={22} className="text-indigo-700" />,
    },
    {
      title: "Collaborators",
      desc: "Invite collaborators and build stories together in one space.",
      icon: <Users size={22} className="text-emerald-700" />,
    },
    {
      title: "Branches",
      desc: "Create alternate story branches and explore multiple paths.",
      icon: <GitBranch size={22} className="text-violet-700" />,
    },
    {
      title: "Chapter Locking",
      desc: "Avoid conflicts using lock/unlock protection while editing.",
      icon: <Lock size={22} className="text-amber-700" />,
    },
  ];

  const editorFeatures = [
    {
      title: "Rich Text Editor",
      desc: "Write naturally with formatting and a distraction-free layout.",
      icon: <Sparkles size={20} className="text-indigo-700" />,
    },
    {
      title: "Voice to Text",
      desc: "Convert speech into writing instantly while staying hands-free.",
      icon: <Mic size={20} className="text-emerald-700" />,
    },
    {
      title: "Reader Mode",
      desc: "Public reading experience for published stories.",
      icon: <BookOpenText size={20} className="text-violet-700" />,
    },
    {
      title: "Explore Classics",
      desc: "Read public domain books using external sources (Gutenberg).",
      icon: <Globe size={20} className="text-amber-700" />,
    },
  ];

  return (
    <div className="min-h-screen pt-16 relative overflow-hidden bg-gradient-to-b from-slate-50 via-gray-100 to-slate-100">
      <Navbar page="Welcome" />

      {/* Soft blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-32 w-[520px] h-[520px] rounded-full bg-indigo-200/40 blur-3xl" />
        <div className="absolute top-32 -right-40 w-[520px] h-[520px] rounded-full bg-emerald-200/35 blur-3xl" />
        <div className="absolute bottom-[-180px] left-1/3 w-[620px] h-[620px] rounded-full bg-violet-200/35 blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 md:px-8 py-10 md:py-14">

        {/* ================= HERO (UNCHANGED) ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 bg-white/80 backdrop-blur border border-gray-200 px-3 py-1.5 rounded-full">
              <Sparkles size={16} className="text-indigo-700" />
              Build stories like a team
            </p>

            <h1 className="mt-4 text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">
              The Collaborative <br className="hidden md:block" />
              StoryBuilder Platform
            </h1>

            <p className="mt-4 text-gray-600 text-base md:text-lg leading-relaxed">
              Create chapters, explore branches, collaborate with others, and
              publish beautifully — all in one professional workspace.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate("/dashboard")}
                className="px-5 py-3 rounded-xl bg-gray-900 text-white font-semibold hover:bg-gray-800 transition flex items-center justify-center gap-2 shadow-sm"
              >
                Open Dashboard <ArrowRight size={18} />
              </button>

              <button
                onClick={() => navigate("/main")}
                className="px-5 py-3 rounded-xl bg-white/80 backdrop-blur border border-gray-200 text-gray-800 font-semibold hover:bg-white transition shadow-sm"
              >
                Explore Stories
              </button>
            </div>
          </div>

          {/* Top features (UNCHANGED) */}
          <div className="bg-white/85 backdrop-blur border border-gray-200 rounded-2xl shadow-md p-6 md:p-7">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Platform Highlights
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Editor • Chapters • Branches • Locks
                </p>
              </div>

              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-50 to-emerald-50 border border-gray-200 flex items-center justify-center">
                <BookOpenText size={18} className="text-gray-800" />
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {topFeatures.map((f) => (
                <div
                  key={f.title}
                  className="rounded-2xl border border-gray-200 bg-gradient-to-b from-white to-gray-50 p-4 hover:shadow-sm transition"
                >
                  <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center shadow-sm">
                    {f.icon}
                  </div>

                  <p className="mt-3 font-semibold text-gray-900">{f.title}</p>
                  <p className="mt-1 text-sm text-gray-600 leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ================= EDITOR FEATURES ================= */}
        <div className="mt-10 bg-white/85 backdrop-blur border border-gray-200 rounded-2xl shadow-md overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                A powerful editor experience
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Everything you need to write, branch and publish confidently.
              </p>
            </div>

            <button
              onClick={() => navigate("/login")}
              className="hidden sm:inline-flex px-4 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition text-gray-700 font-semibold shadow-sm"
            >
              Start Writing
            </button>
          </div>

          {/* 🔹 MOBILE SLIDER (NEW – ONLY FOR MOBILE) */}
          <div className="md:hidden p-6">
            <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide">
              {editorFeatures.map((item) => (
                <div
                  key={item.title}
                  className="
                    min-w-[85%]
                    snap-center
                    rounded-2xl
                    border border-gray-200
                    p-4
                    bg-gradient-to-b from-white to-gray-50
                    shadow-sm
                  "
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center shadow-sm">
                      {item.icon}
                    </div>

                    <p className="font-semibold text-gray-900">{item.title}</p>
                  </div>

                  <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 🔹 DESKTOP GRID (UNCHANGED) */}
          <div className="hidden md:block p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {editorFeatures.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-gray-200 p-4 bg-gradient-to-b from-white to-gray-50 hover:shadow-sm transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center shadow-sm">
                      {item.icon}
                    </div>

                    <p className="font-semibold text-gray-900">{item.title}</p>
                  </div>

                  <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* CTA (UNCHANGED) */}
            <div className="mt-6 rounded-2xl border border-gray-200 bg-gradient-to-r from-gray-900 via-slate-900 to-gray-900 text-white p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-sm">
              <div>
                <p className="font-bold text-lg">Publish & share your stories</p>
                <p className="text-sm text-gray-200 mt-1">
                  Readers can view published stories even without logging in.
                </p>
              </div>

              <button
                onClick={() => navigate("/main")}
                className="px-4 py-2 rounded-xl bg-white text-gray-900 font-semibold hover:bg-gray-100 transition"
              >
                View Public Stories
              </button>
            </div>
          </div>
        </div>

        {/* ================= ABOUT (UNCHANGED) ================= */}
        <div className="mt-12 bg-white/85 backdrop-blur border border-gray-200 rounded-2xl shadow-md overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center px-6 py-8 md:px-10 md:py-12">

            {/* Left Content */}
            <div>
              <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wider">
                About StoryBuilder
              </p>

              <h2 className="mt-3 text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                Built for collaborative storytelling
              </h2>

              <p className="mt-4 text-sm sm:text-base text-gray-600 leading-relaxed max-w-xl">
                Modern Story writing platform designed for creators who value
                structure, collaboration, and creative freedom. Writers can organize
                chapters, explore alternate story branches, and collaborate seamlessly
                without conflicts in a single professional workspace.
              </p>

              <p className="mt-3 text-sm sm:text-base text-gray-600 leading-relaxed max-w-xl">
                With a focused editor, intelligent chapter locking, and seamless publishing,
                StoryBuilder enables creators to publish their stories and share them publicly.
                Published stories can be read by anyone, while authors retain full control
                over their content and creative process.
              </p>
            </div>

            {/* Right Image — Desktop only */}
            <div className="hidden lg:flex justify-end">
              <div
                className="
                  w-full max-w-sm
                  rounded-2xl border border-gray-200
                  bg-gradient-to-b from-white to-gray-50
                  p-3 shadow-sm
                  transform transition-all duration-300
                  hover:-translate-y-2 hover:shadow-md
                "
              >
                <img
                  src={Img}
                  alt="StoryBuilder collaboration illustration"
                  className="w-full h-[240px] rounded-xl object-cover"
                />
              </div>
            </div>

          </div>
        </div>


        {/* ================= FOOTER (UNCHANGED) ================= */}
        <footer className="mt-16 border-t border-gray-200 text-sm text-gray-600">
          <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div className="max-w-md">
                <p className="text-base font-semibold text-gray-900">
                  StoryBuilder
                </p>
                <p className="mt-2 text-gray-500 leading-relaxed">
                  A collaborative platform for structured storytelling.
                </p>
              </div>

              <div className="md:text-right">
                <p className="text-base font-semibold text-gray-900">
                  Contact
                </p>

                <div className="mt-3 flex flex-col items-start md:items-end gap-3">
                  <a
                    href="mailto:viswanathpaarthiban1@gmail.com"
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
                  >
                    <Mail size={18} />
                    Email
                  </a>

                  <a
                    href="https://www.linkedin.com/in/viswanathpaarthiban/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
                  >
                    <Linkedin size={18} />
                    LinkedIn
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-gray-200 text-xs text-gray-500">
              © {new Date().getFullYear()} StoryBuilder. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default Welcome;
