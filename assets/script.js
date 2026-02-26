// Accordion hover open logic
const accButton = document.querySelector(".accordion-button");
const collapseOne = document.getElementById("collapseOne");

accButton.addEventListener("mouseenter", () => {
  const bsCollapse = new bootstrap.Collapse(collapseOne, {
    hide: true,
  });
  bsCollapse.show();
});

accButton.addEventListener("mouseleave", () => {
  const bsCollapse = new bootstrap.Collapse(collapseOne, {
    show: true,
  });
  bsCollapse.hide();
});
