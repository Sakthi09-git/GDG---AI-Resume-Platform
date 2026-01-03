// ============= FIREBASE IMPORT ===========
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
      alert("❌ Auth error");
      console.error(err);
    }
  }
};

// ================= GLOBAL IMAGE DATA =================
let profileImageBase64 = "";

// ================= RESUME FORM =================
document.getElementById("resumeForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const education = document.getElementById("education").value.trim();
  const year = document.getElementById("year").value.trim();
  const cgpa = document.getElementById("cgpa").value.trim();
  const skills = document.getElementById("skills").value.trim();
  const projects = document.getElementById("projects").value.trim();

  const photoInput = document.getElementById("profilePic");

  /* ================= RESUME RENDER FUNCTION ================= */
  const renderResume = () => {
    resumeName.textContent = Name: ${name};
    resumeEducation.textContent = Department: ${education};
    resumeYear.textContent = Year / Semester: ${year};
    resumeCGPA.textContent = CGPA: ${cgpa};
    resumeProjects.textContent = projects;

    // skills
    resumeSkills.innerHTML = "";
    skills.split(",").forEach(skill => {
      if (!skill.trim()) return;
      const span = document.createElement("span");
      span.className = "badge";
      span.textContent = skill.trim();
      resumeSkills.appendChild(span);
    });

    // image
    if (profileImageBase64) {
      const img = document.getElementById("profileImage");
      img.src = profileImageBase64;
      img.style.display = "block";
    }
  };

  /* ================= PROFILE IMAGE READ (FIXED) ================= */
  if (photoInput && photoInput.files.length > 0) {
    const reader = new FileReader();
    reader.onload = () => {
      profileImageBase64 = reader.result;
      renderResume(); // 🔥 resume render AFTER image loaded
    };
    reader.readAsDataURL(photoInput.files[0]);
  } else {
    renderResume(); // no image
  }

  // ---------- INTERNSHIP LOGIC ----------
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

  // ---------- FIRESTORE SAVE ----------
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
  doc.text("AI Generated Resume", 105, y, { align: "center" });
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
