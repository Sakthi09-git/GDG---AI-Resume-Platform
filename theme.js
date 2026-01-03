const themeSelect = document.getElementById("themeSelect");

themeSelect.addEventListener("change", () => {
  const val = themeSelect.value;

  // Reset all themes
  document.body.className = "";

  switch (val) {
    case "dark":
      document.body.classList.add("dark");
      break;

    case "light":
      document.body.classList.add("light");
      break;

    case "green":
      document.body.classList.add("green");
      break;

    case "purple":
      document.body.classList.add("purple");
      break;

    case "sunset":
      document.body.classList.add("sunset");
      break;

    default:
      document.body.classList.add("default");
  }
});