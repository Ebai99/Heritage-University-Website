window.onload = function () {
  const loader = document.getElementById("loader");
  if (loader) {
    loader.classList.add("loader-hidden");
    setTimeout(() => {
      loader.style.display = "none";
    }, 500);
  }
  setActiveProgram("hnd", "HND");
};

function setActiveProgram(radioId, formType) {
  // Set active state for radio buttons
  ["hnd", "degree", "masters"].forEach((id) => {
    const radio = document.getElementById(id);
    if (radio) {
      radio.checked = id === radioId;
      radio.parentElement.classList.toggle("active", id === radioId);
    }
  });

  // Show only the selected form by ID
  ["HND", "bachelor", "master"].forEach((formId) => {
    const form = document.getElementById(formId);
    if (form) {
      form.style.display = formId === formType ? "block" : "none";
    }
  });
}

// Attach event listeners to radio buttons
document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("hnd").addEventListener("click", function () {
    setActiveProgram("hnd", "HND");
  });
  document.getElementById("degree").addEventListener("click", function () {
    setActiveProgram("degree", "bachelor");
  });
  document.getElementById("masters").addEventListener("click", function () {
    setActiveProgram("masters", "master");
  });
});

// Reset button reloads the page
function resetProgramSelection() {
  location.reload();
}
