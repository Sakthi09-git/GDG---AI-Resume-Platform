// ================= FIREBASE IMPORT =================
import {
  auth,
  db,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  addDoc,
  collection
} from "./firebase.js";

// ================= GLOBAL LOGIN STATE =================
let isLoggedIn = false;   // 🔐 LOGIN FLAG
let profileImageBase64 = "";

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
    isLoggedIn = true; // 🔥 ENABLE FEATURES
  } catch {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert("✅ Account Created & Logged In");
      isLoggedIn = true; // 🔥 ENABLE FEATURES
    } catch (err) {
      alert("❌ Auth error! Incorrect Password! Try again!");
      console.error(err);
    }
  }
};

// ================= GEMINI CONFIG =================
const GEMINI_API_KEY = "AIzaSyA1mtAG6dqJtUPooQAqnUP4wCmsy83iqI8";
const GEMINI_URL =
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;

const improveProjectsWithGemini = async (education, skills, projects) => {
  try {
    const res = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Improve this resume projects for a ${education} student with skills ${skills}. Projects: ${projects}`
          }]
        }]
      })
    });

    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || projects;
  } catch {
    return projects;
  }
};

// ================= RESUME FORM =================
document.getElementById("resumeForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  // 🔐 LOGIN CHECK
  if (!isLoggedIn) {
    alert("⚠ Please login first to generate resume");
    return;
  }

  const name = document.getElementById("name").value.trim();
  const education = document.getElementById("education").value.trim();
  const year = document.getElementById("year").value.trim();
  const cgpa = document.getElementById("cgpa").value.trim();
  const skills = document.getElementById("skills").value.trim();
  let projects = document.getElementById("projects").value.trim();
  const githubLink = document.getElementById("github").value.trim();
  const photoInput = document.getElementById("profilePic");

  projects = await improveProjectsWithGemini(education, skills, projects);

  // ================= RENDER RESUME =================
  const renderResume = () => {
    resumeName.textContent = `Name: ${name}`;
    resumeEducation.textContent = `Department: ${education}`;
    resumeYear.textContent = `Year / Semester: ${year}`;
    resumeCGPA.textContent = `CGPA: ${cgpa}`;
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

    let githubEl = document.getElementById("resumeGithub");

    // Create element only once if not exists
    if (!githubEl) {
      githubEl = document.createElement("p");
      githubEl.id = "resumeGithub";
      document.getElementById("resume").appendChild(githubEl);
    }

    if (githubLink) {
      githubEl.innerHTML =
        `GitHub: <a href="${githubLink}" target="_blank">${githubLink}</a>`;
    } else {
      githubEl.innerHTML = "";
    }
    if (profileImageBase64) {
      const img = document.getElementById("profileImage");
      img.src = profileImageBase64;
      img.style.display = "block";
    }
  };

  // ================= IMAGE =================
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
    if (skillLower.includes("embedded") || skillLower.includes("vlsi")) {
      internshipData = [
        { title: "Embedded Systems Intern", icon: "⚡" },
        { title: "VLSI Intern", icon: "🔌" }
      ];
    } else {
      internshipData = [
        { title: "Electronics Intern", icon: "🔧" }
      ];
    }
  } else {
    internshipData = [{ title: "Software Intern", icon: "💼" }];
  }

  internshipData.forEach(i => {
    const div = document.createElement("div");
    div.className = `internship-card ${getInternshipClass(i.title)}`;
    div.innerHTML = `
      <div class="internship-icon">${i.icon}</div>
      <div class="internship-title">${i.title}</div>
    `;
    internships.appendChild(div);
  });

  // ================= FIRESTORE SAVE =================
  await addDoc(collection(db, "resumes"), {
    name,
    education,
    year,
    cgpa,
    skills,
    projects,
    githubLink,
    internships: internshipData,
    profileImage: profileImageBase64,
    createdAt: new Date()
  });
});

// ================= PDF DOWNLOAD (UI IMPROVED) =================
document.getElementById("downloadBtn").addEventListener("click", () => {
  if (!resumeName.textContent || resumeName.textContent.trim() === "") {
    alert("Generate resume first!");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  let y = 20;

  // ===== TITLE =====
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(88, 80, 236); // purple-blue
  doc.text("Resume", 105, y, { align: "center" });
  y += 15;

  // ===== PROFILE IMAGE =====
  if (profileImageBase64) {
    doc.addImage(profileImageBase64, "JPEG", 80, y, 50, 50);
    y += 60;
  }

  // Reset text style
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);

  // ===== PROFILE SECTION =====
  doc.setFont("helvetica", "bold");
  doc.text("Profile", 20, y);
  y += 8;

  doc.setFont("helvetica", "normal");
  doc.text(resumeName.textContent, 20, y); y += 7;
  doc.text(resumeEducation.textContent, 20, y); y += 7;
  doc.text(resumeYear.textContent, 20, y); y += 7;
  doc.text(resumeCGPA.textContent, 20, y); y += 10;

  // ===== SKILLS =====
  doc.setFont("helvetica", "bold");
  doc.text("Skills", 20, y);
  y += 8;

  doc.setFont("helvetica", "normal");
  const skillsText = [...resumeSkills.children]
    .map(s => `• ${s.textContent}`)
    .join("   ");

  const skillsLines = doc.splitTextToSize(skillsText || "-", 170);
  doc.text(skillsLines, 20, y);
  y += skillsLines.length * 7 + 5;

  // ===== PROJECTS =====
  doc.setFont("helvetica", "bold");
  doc.text("Projects", 20, y);
  y += 8;

  doc.setFont("helvetica", "normal");
  const projectLines = doc.splitTextToSize(resumeProjects.textContent || "-", 170);
  doc.text(projectLines, 20, y);
  y += projectLines.length * 7 + 8;

  // ===== GITHUB =====
  const githubEl = document.getElementById("resumeGithub");
  if (githubEl && githubEl.querySelector("a")) {
    const githubUrl = githubEl.querySelector("a").href;

    doc.setFont("helvetica", "bold");
    doc.text("GitHub / Portfolio", 20, y);
    y += 8;

    doc.setTextColor(0, 102, 204);
    doc.textWithLink(githubUrl, 20, y, { url: githubUrl });
    doc.setTextColor(0, 0, 0);
  }

  // ===== FOOTER =====
  doc.setFontSize(10);
  doc.setTextColor(150);
  doc.text("Generated using AI Resume Platform", 105, 290, { align: "center" });

  doc.save("Resume.pdf");
});

// ================= RESUME SCORE =================
const calculateResumeScore = (skills, projects, cgpa) => {
  let score = 0;
  const skillCount = skills.split(",").filter(s => s.trim()).length;
  if (skillCount >= 3) score += 30;
  if (skillCount >= 5) score += 10;
  if (projects.length >= 30) score += 30;
  const cg = parseFloat(cgpa);
  if (!isNaN(cg)) {
    if (cg >= 7) score += 20;
    if (cg >= 8.5) score += 10;
  }
  return Math.min(score, 100);
};

// ================= INTERNSHIP COLOR CLASS =================
const getInternshipClass = (title) => {
  const t = title.toLowerCase();
  if (t.includes("frontend")) return "frontend";
  if (t.includes("backend")) return "backend";
  if (t.includes("full")) return "fullstack";
  if (t.includes("ai") || t.includes("ml")) return "ai";
  if (t.includes("embedded") || t.includes("vlsi")) return "embedded";
  return "default-internship";
};