// Accordion hover open logic
function accordionHover() {
  const accButton = document.querySelector(".accordion-button");
  const collapseOne = document.getElementById("collapseOne");

  if (accButton && collapseOne) {
    const bsCollapse = new bootstrap.Collapse(collapseOne, {
      toggle: false,
    });

    accButton.addEventListener("mouseenter", () => {
      bsCollapse.show();
    });

    accButton.addEventListener("mouseleave", () => {
      bsCollapse.hide();
    });
  }
}

// Typing Animation
function typingAnimation() {
  const words = ["Admission", "Fee Structure", "LMS", "Programs Guide"];
  let i = 0;
  let j = 0;
  let currentWord = "";
  let isDeleting = false;

  function typeEffect() {
    currentWord = words[i];

    if (isDeleting) {
      j--;
    } else {
      j++;
    }

    document.getElementById("typing").textContent = currentWord.substring(0, j);

    if (!isDeleting && j === currentWord.length) {
      isDeleting = true;
      setTimeout(typeEffect, 1200);
      return;
    }

    if (isDeleting && j === 0) {
      isDeleting = false;
      i++;
      if (i === words.length) i = 0;
    }

    setTimeout(typeEffect, isDeleting ? 50 : 100);
  }

  typeEffect();
}
function toggleSeeMore() {
  const btn = document.querySelector(".see-more-btn");
  const extraItems = document.querySelectorAll(".extra-item");

  btn.addEventListener("click", function () {
    extraItems.forEach((item) => {
      if (item.style.display === "list-item") {
        item.style.display = "none";
        btn.textContent = "See More";
      } else {
        item.style.display = "list-item";
        btn.textContent = "See Less";
      }
    });
  });
}
function togglefaqs() {
  const questions = document.querySelectorAll(".faq-question");

  questions.forEach((question) => {
    question.addEventListener("click", () => {
      const currentAnswer = question.nextElementSibling;
      const currentIcon = question.querySelector(".icon");

      document.querySelectorAll(".faq-answer").forEach((answer) => {
        if (answer !== currentAnswer) {
          answer.style.maxHeight = null;
          answer.previousElementSibling.querySelector(".icon").textContent =
            "+";
        }
      });

      if (currentAnswer.style.maxHeight) {
        currentAnswer.style.maxHeight = null;
        currentIcon.textContent = "+";
      } else {
        currentAnswer.style.maxHeight = currentAnswer.scrollHeight + "px";
        currentIcon.textContent = "−";
      }
    });
  });
}
// Run Functions
accordionHover();
typingAnimation();
toggleSeeMore();
togglefaqs();
