// ================= FIREBASE IMPORT =================
import {
  auth,
  db,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  addDoc,
  collection
} from "./firebase.js";

// ================= LOGIN =================
window.login = async () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    alert("Enter email & password");
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, password);
    alert("✅ Login Successful");
  } catch {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert("✅ Account Created & Logged In");
    } catch (err) {
      alert("❌ Auth error! Incorrect Password! Try again!");
      console.error(err);
    }
  }
};

let profileImageBase64 = "";

// ================= GEMINI CONFIG =================
const GEMINI_API_KEY = "AIzaSyA1mtAG6dqJtUPooQAqnUP4wCmsy83iqI8";
const GEMINI_URL =
  https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY};

// ================= GEMINI FUNCTION =================
const improveProjectsWithGemini = async (education, skills, projects) => {
  try {
    const res = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: Improve this resume projects for a ${education} student with skills ${skills}. Projects: ${projects}
          }]
        }]
      })
    });

    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || projects;
  } catch (err) {
    console.error("Gemini Error:", err);
    return projects; // fallback
  }
};

// ================= RESUME FORM =================
document.getElementById("resumeForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const education = document.getElementById("education").value.trim();
  const year = document.getElementById("year").value.trim();
  const cgpa = document.getElementById("cgpa").value.trim();
  const skills = document.getElementById("skills").value.trim();
  let projects = document.getElementById("projects").value.trim();
  const photoInput = document.getElementById("profilePic");
  projects = await improveProjectsWithGemini(education, skills, projects);

  /* ================= RENDER RESUME ================= */
  const renderResume = () => {
    resumeName.textContent = Name: ${name};
    resumeEducation.textContent = Department: ${education};
    resumeYear.textContent = Year / Semester: ${year};
    resumeCGPA.textContent = CGPA: ${cgpa};
    resumeProjects.textContent = projects;

    resumeSkills.innerHTML = "";
    skills.split(",").forEach(skill => {
      if (!skill.trim()) return;
      const span = document.createElement("span");
      span.className = "badge";
      span.textContent = skill.trim();
      resumeSkills.appendChild(span);
    });

    const score = calculateResumeScore(skills, projects, cgpa);
    document.getElementById("resumeScore").textContent = score + "%";


    if (profileImageBase64) {
      const img = document.getElementById("profileImage");
      img.src = profileImageBase64;
      img.style.display = "block";
    }
  };

  /* ================= IMAGE ================= */
  if (photoInput && photoInput.files.length > 0) {
    const reader = new FileReader();
    reader.onload = () => {
      profileImageBase64 = reader.result;
      renderResume();
    };
    reader.readAsDataURL(photoInput.files[0]);
  } else {
    renderResume();
  }

  // ================= INTERNSHIPS =================
  internships.innerHTML = "";
  const edu = education.toLowerCase();
  const skillLower = skills.toLowerCase();

  let internshipData = [];

  if (edu.includes("cse") || edu.includes("it")) {
    internshipData = [
      { title: "Frontend Intern", icon: "💻" },
      { title: "Backend Intern", icon: "🧠" },
      { title: "Full Stack Intern", icon: "🌐" }
    ];
  } else if (edu.includes("aiml") || edu.includes("aids")) {
    internshipData = [
      { title: "AI Intern", icon: "🤖" },
      { title: "ML Intern", icon: "📊" },
      { title: "Data Science Intern", icon: "📈" }
    ];
  } else if (edu.includes("ece") || edu.includes("eee")) {
    if (
      skillLower.includes("embedded") ||
      skillLower.includes("vlsi") ||
      skillLower.includes("electronics")
    ) {
      internshipData = [
        { title: "Embedded Systems Intern", icon: "⚡" },
        { title: "VLSI Intern", icon: "🔌" },
        { title: "IoT Intern", icon: "📡" }
      ];
    } else {
      internshipData = [
        { title: "Electronics Intern", icon: "🔧" },
        { title: "Hardware Intern", icon: "🧰" }
      ];
    }
  } else {
    internshipData = [{ title: "Software Intern", icon: "💼" }];
  }

  internshipData.forEach(i => {
    const div = document.createElement("div");
    div.className = "internship-badge";
    div.innerHTML = <span class="internship-icon">${i.icon}</span>${i.title};
    internships.appendChild(div);
  });

  // ================= FIRESTORE SAVE =================
  try {
    await addDoc(collection(db, "resumes"), {
      name,
      education,
      year,
      cgpa,
      skills,
      projects,
      internships: internshipData,
      profileImage: profileImageBase64,
      createdAt: new Date()
    });
    console.log("✅ Stored in Firebase");
  } catch (err) {
    alert("❌ Firebase save failed");
    console.error(err);
  }
});

// ================= PDF DOWNLOAD =================
document.getElementById("downloadBtn").addEventListener("click", () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  let y = 20;

  if (profileImageBase64) {
    doc.addImage(profileImageBase64, "JPEG", 80, y, 50, 50);
    y += 60;
  }

  doc.setFontSize(16);
  doc.text("Resume", 105, y, { align: "center" });
  y += 15;

  doc.setFontSize(12);
  doc.text(resumeName.textContent, 20, y); y += 8;
  doc.text(resumeEducation.textContent, 20, y); y += 8;
  doc.text(resumeYear.textContent, 20, y); y += 8;
  doc.text(resumeCGPA.textContent, 20, y); y += 10;

  doc.text("Skills:", 20, y); y += 8;
  const skillsText = [...resumeSkills.children].map(s => s.textContent).join(", ");
  doc.text(skillsText, 20, y); y += 10;

  doc.text("Projects:", 20, y); y += 8;
  doc.text(resumeProjects.textContent, 20, y);

  doc.save("Resume.pdf");
});
// ================= RESUME SCORE =================
const calculateResumeScore = (skills, projects, cgpa) => {
  let score = 0;

  // Skills strength
  const skillCount = skills.split(",").filter(s => s.trim()).length;
  if (skillCount >= 3) score += 30;
  if (skillCount >= 5) score += 10;

  // Projects strength
  if (projects.length >= 30) score += 30;

  // CGPA strength
  const cg = parseFloat(cgpa);
  if (!isNaN(cg)) {
    if (cg >= 7) score += 20;
    if (cg >= 8.5) score += 10;
  }

  return Math.min(score, 100);
};