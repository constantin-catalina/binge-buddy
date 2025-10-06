import React, { useState } from "react";
import { SignUp } from "@clerk/clerk-react";
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
  const [showModal, setShowModal] = useState(false);

  const openSignUp = () => setShowModal(true);
  const closeSignUp = () => setShowModal(false);
  const navigate = useNavigate();

  return (
    <section
      className="relative h-[90vh] md:h-screen overflow-hidden"
      aria-label="Binge Buddy hero"
    >
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src="/background.jpg"
          alt=""
          className="h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
        <div className="absolute inset-0 ring-1 ring-inset ring-white/10" />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex h-full items-center px-6 md:px-16 lg:px-36">
        <div className="max-w-[46rem] text-white">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.05] drop-shadow-[0_10px_30px_rgba(0,0,0,0.6)]">
            Track together
            <br />
            Binge together
          </h1>

          <p className="mt-4 text-base md:text-xl text-white/85 max-w-[40rem]">
            Follow friends, swap recommendations, and keep your <br/> watch history synced across devices.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={openSignUp}
              className="inline-flex items-center rounded-2xl px-6 py-3 font-medium
                         bg-primary hover:bg-primary-dull transition
                         shadow-lg shadow-primary/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            >
              Join Binge Buddy Free →
            </button>

            <button
              type="button"
              onClick={() => navigate("/discover")}
              className="inline-flex items-center rounded-2xl px-6 py-3 font-medium
                         bg-white/10 hover:bg-white/20 ring-1 ring-white/20 backdrop-blur-sm transition
                         focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            >
              Browse as Guest
            </button>
          </div>

          <div className="mt-4 flex items-center gap-4 text-white/70 text-sm">
            <span>Build lists</span>
            <span>Rate & review</span>
            <span>Cross-device sync</span>
          </div>
        </div>
      </div>

      {/* Modal SignUp */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={closeSignUp}
        >
          <div
            className="relative p-4 bg-zinc-900 rounded-2xl shadow-2xl border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <SignUp
              appearance={{
                variables: {
                  colorPrimary: "#993D29",
                  fontFamily: "'Outfit', sans-serif",
                  borderRadius: "16px",
                },
                elements: {
                  card: "bg-zinc-900 text-white",
                  headerTitle: "text-white text-xl font-semibold",
                  headerSubtitle: "text-white/70",
                  formFieldLabel: "text-white",
                  formFieldInput: "bg-white/5 text-white border-white/10",
                  formButtonPrimary:
                    "bg-primary hover:bg-primary-dull text-white shadow-md shadow-primary/40",
                  footerActionLink: "text-primary hover:text-primary-dull font-medium",
                },
              }}
              afterSignUpUrl="/discover"
              signInUrl="/sign-in"
            />
          </div>
        </div>
      )}
    </section>
  );
};

export default HeroSection;
