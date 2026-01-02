const themeSelect = document.getElementById("themeSelect");

themeSelect.addEventListener("change", () => {
  const val = themeSelect.value;
  document.body.className = ""; // reset previous
  switch(val){
    case "dark": document.body.classList.add("dark"); break;
    case "light": document.body.classList.add("light"); break;
    case "blue": document.body.classList.add("blue"); break;
    case "green": document.body.classList.add("green"); break;
    case "purple": document.body.classList.add("purple"); break;
    default: document.body.classList.add("default"); break;
  }
});