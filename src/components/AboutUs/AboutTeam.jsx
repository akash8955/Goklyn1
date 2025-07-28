import React from "react";

const AboutTeam = () => {
  return (
    <section
      className="container py-5 text-white"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.85)", // Dark semi-transparent background
        borderRadius: "12px",
      }}
    >
      <div className="text-center mb-4">
        <h2 className="fw-bold">What Sets Our Team Apart?</h2>
      </div>

      <div className="row g-4">
        {[
          {
            title: "Student-Led Innovation",
            description:
              "Our team members actively contribute to cutting-edge projects, gaining practical knowledge and leadership skills in the ever-evolving tech landscape.",
          },
          {
            title: "Mentorship-Driven Approach",
            description:
              "Students work under the guidance of skilled professionals who provide personalized mentorship and support, shaping their careers with real-world experience.",
          },
          {
            title: "Diverse Skill Sets",
            description:
              "From AI to Cybersecurity, our team members bring expertise in various domains, enabling us to deliver comprehensive and innovative solutions tailored for the future.",
          },
        ].map((item, index) => (
          <div key={index} className="col-lg-4 col-md-6">
            <div
              className="card shadow-sm border-light rounded-3 p-4 h-100"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.1)", // Glassmorphism effect
                color: "white",
                borderWidth: "1.5px",
                borderOpacity: "50%",
                backdropFilter: "blur(10px)", // Subtle blur for better contrast
              }}
            >
              <h5 className="fw-semibold">{item.title}</h5>
              <p className="text-light">{item.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-5">
        <p className="fw-bold">
          At <span className="text-primary">GOKLYN</span>, we believe in the
          power of teamwork and the potential of young minds to drive
          technological progress.
        </p>
      </div>
    </section>
  );
};

export default AboutTeam;
