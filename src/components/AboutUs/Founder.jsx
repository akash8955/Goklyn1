import React from "react";

const founders = [
  {
    name: "Mohit Sharma",
    role: "Director",
    img: "/assets/newImages/Mohit_sharma.jpeg",
    bio: "Director of goklyn pvt Ltd leads the company with a mission to revolutionize the technology in medical field. With  deep passion for blending medical expertise with technical advancements.",
  },
  {
    name: "Monika Sharma",
    role: "Director",
    img: "/assets/newImages/Monika_sharma.jpeg",
    bio: "Founder of Goklyn Technologies by Goklyn Pvt Ltd, holds a B.Sc. in Physics (Hons) and a B.Tech in Computer Science. She leads advancements in networking, cybersecurity, cryptography, quantum computing, and quantum machine learning & communication.",
  },
];

const Founder = () => {
  return (
    <section className="container py-5 text-white text-center">
      <h2 className="fw-bold mb-4">Meet the Visionaries Behind <span className="text-primary">GOKLYN</span></h2>
      <p className="mb-5 mx-auto" style={{ maxWidth: "100%" }}>
        Our founders are tech enthusiasts and industry veterans with a shared vision of bridging
        the gap between academia and industry. With years of experience in research, project
        development, and mentorship, they are dedicated to building a platform that transforms
        students into industry-ready professionals and helps businesses thrive with cutting-edge
        solutions.
      </p>

      <div className="row g-4 justify-content-center">
        {founders.map((founder, index) => (
          <div key={index} className="col-lg-4 col-md-6">
            <div
              className="card border-light shadow-sm p-4 h-100"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.07)",
                color: "white",
                borderWidth: "0.8px",
                borderColor: "rgba(255, 255, 255, 0.3)",
                backdropFilter: "blur(12px)",
                transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
                borderRadius : '10px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.01)";
                e.currentTarget.style.boxShadow = "0px 8px 16px rgba(255, 255, 255, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <img
                src={founder.img}
                alt={founder.name}
                className="rounded-circle mb-3 object-fit-cover align-self-center"
                style={{
                  width: "120px",
                  height: "120px",
                  objectFit: "cover",
                  border: "3px solid rgba(255, 255, 255, 0.2)",
                  padding: "5px",
                  backgroundPosition : 'center',
                  objectPosition : '0.5px 10%',
                  scale : '1.05'
                }}
              />
              <h5 className="fw-semibold">{founder.name}</h5>
              <p className="text-primary fw-bold">{founder.role}</p>
              <p className="text-light" style={{fontSize:'16px'}}>{founder.bio}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Founder;
