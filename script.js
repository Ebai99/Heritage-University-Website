function showFieldset(fieldsetId) {
  document.querySelectorAll(".school-program").forEach((fieldset) => {
    fieldset.classList.remove("active");
  });
  document.getElementById(fieldsetId).classList.add("active");
}
