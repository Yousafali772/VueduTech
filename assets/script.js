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

// Search bar logic (navbar)
let searchData = [];
let isSearchDataLoaded = false;
let pageIndex = [];
let isSearchClickHandlerBound = false;

function normalizeForSearch(input) {
  return (input || "")
    .toLowerCase()
    // Keep only letters/digits to support slug-like queries (cs101-handout).
    .replace(/[^a-z0-9]+/g, "");
}

function buildPageSearchIndex() {
  // Build an in-page search index (for handout/past-papers/video pages).
  // We scan titles from tables (first column) and from video card text.
  const index = [];

  const path = (location?.pathname || "").toLowerCase();
  const pageKind = path.includes("highlight-handout")
    ? "highlighted-handout"
    : path.includes("handout")
      ? "handout"
      : path.includes("short-vedio-lecture")
        ? "video"
        : path.includes("midterm")
          ? "midterm-past-paper"
          : path.includes("finalterm")
            ? "finalterm-past-paper"
            : path.includes("past-papers")
              ? "past-paper"
              : "unknown";

  // Table-based pages (handout/highlight/past-papers)
  const rows = document.querySelectorAll("table tbody tr");
  rows.forEach((tr) => {
    const tds = tr.querySelectorAll("td");
    if (!tds || !tds.length) return;

    // Some pages (like handout) have a serial number in the first <td>,
    // while the actual "title + code" is in another <td>.
    const codeRegex = /\b([A-Z]{3}\d{3}[A-Z]?)\b/i;
    const titleCell =
      Array.from(tds).find((td) => codeRegex.test(td.textContent || "")) ||
      tds[0];

    const title = (titleCell.textContent || "").trim();
    if (!title) return;

    // Avoid indexing generic/empty rows.
    const hasContent = /\w/.test(title);
    if (!hasContent) return;

    const keys = [title];
    const codeMatch = title.match(/\b([A-Z]{3}\d{3}[A-Z]?)\b/i);
    const code = codeMatch?.[1];

    if (code) {
      keys.push(code);

      // Requested slug-like search for handouts (e.g. cs101-handout)
      if (pageKind === "handout") keys.push(`${code}-handout`);
      if (pageKind === "highlighted-handout")
        keys.push(`${code}-highlighted-handout`);

      if (pageKind === "midterm-past-paper") keys.push(`${code}-midterm`);
      if (pageKind === "finalterm-past-paper")
        keys.push(`${code}-finalterm`);
      if (pageKind === "past-paper") keys.push(`${code}-past-paper`);
    }

    const type =
      pageKind === "handout"
        ? "Handout"
        : pageKind === "highlighted-handout"
          ? "Highlighted Handout"
          : pageKind === "midterm-past-paper"
            ? "Midterm Past Paper"
            : pageKind === "finalterm-past-paper"
              ? "Finalterm Past Paper"
              : pageKind === "past-paper"
                ? "Past Paper"
                : "On this page";

    index.push({ title, type, element: tr, keys });
  });

  // Video pages (cards with p.card-text)
  const cardTexts = document.querySelectorAll("p.card-text");
  cardTexts.forEach((p) => {
    const title = (p.textContent || "").trim();
    if (!title) return;

    // Only add if it looks like video card titles.
    if (!/\w/.test(title)) return;

    const card = p.closest(".card") || p;
    const keys = [title];
    const codeMatch = title.match(/\b([A-Z]{3}\d{3}[A-Z]?)\b/i);
    const code = codeMatch?.[1];
    if (code) {
      keys.push(code);
      keys.push(`${code}-video`);
      keys.push(`${code}-short-lecture`);
    }

    index.push({ title, type: "Video", element: card, keys });
  });

  return index;
}

async function loadSearchData() {
  try {
    const response = await fetch("/searchbar.json");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    if (Array.isArray(data)) searchData = data;
  } catch (err) {
    console.error("Failed to load searchbar.json:", err);
  } finally {
    isSearchDataLoaded = true;
  }
}

function searchContent() {
  const inputEl = document.getElementById("searchInput");
  const resultsEl = document.getElementById("results");
  if (!inputEl || !resultsEl) return;

  const queryRaw = (inputEl.value || "").trim();
  const query = normalizeForSearch(queryRaw);

  // Hide by default when query is too short.
  if (query.length < 2) {
    resultsEl.style.display = "none";
    resultsEl.innerHTML = "";
    return;
  }

  resultsEl.style.display = "block";
  resultsEl.innerHTML = "";

  // 1) Try in-page title search (most useful on handout/past-paper/video pages).
  if (!pageIndex.length) {
    pageIndex = buildPageSearchIndex();
  }

  if (pageIndex.length) {
    const pageFiltered = pageIndex.filter((item) => {
      const keys = item?.keys?.length ? item.keys : [item?.title || ""];
      return keys.some((k) => normalizeForSearch(k).includes(query));
    });

    if (pageFiltered.length) {
      resultsEl.innerHTML = "";
      pageFiltered.slice(0, 12).forEach((item, idx) => {
        const originalIdx = pageIndex.indexOf(item);
        resultsEl.innerHTML += `
          <div class="result-item">
            <button type="button" class="page-result-link" data-page-idx="${originalIdx}">
              <strong>${item.title}</strong>
              <br>
              <small>${item.type}</small>
            </button>
          </div>
        `;
      });

      // Scroll to the matching element
      if (!isSearchClickHandlerBound) {
        resultsEl.addEventListener("click", (e) => {
          const btn = e.target.closest("[data-page-idx]");
          if (!btn) return;

          const pageIdx = Number(btn.getAttribute("data-page-idx"));
          const el = pageIndex[pageIdx]?.element;
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
            // Optional visual cue
            el.style.transition = "background-color 250ms ease";
            el.style.backgroundColor = "rgba(124, 77, 224, 0.12)";
            setTimeout(() => {
              el.style.backgroundColor = "";
            }, 800);
          }
        });
        isSearchClickHandlerBound = true;
      }

      return;
    }
  }

  // 2) Fallback: global category search
  if (!isSearchDataLoaded) {
    resultsEl.innerHTML = `<div class="result-item"><strong>Loading...</strong></div>`;
    return;
  }

  const filtered = searchData.filter((item) => {
    const title = item?.title || "";
    return normalizeForSearch(title).includes(query);
  });

  if (!filtered.length) {
    resultsEl.innerHTML = `<div class="result-item">No results found.</div>`;
    return;
  }

  filtered.slice(0, 12).forEach((item) => {
    const title = item?.title || "";
    const type = item?.type || "";
    const url = item?.url || "#";

    resultsEl.innerHTML += `
      <div class="result-item">
        <a href="${url}">
          <strong>${title}</strong>
          <br>
          <small>${type}</small>
        </a>
      </div>
    `;
  });
}
document.addEventListener("DOMContentLoaded", function () {
  var searchBar = document.getElementById("searchBar");

  searchBar.addEventListener("keyup", function () {
    var input = this.value.toLowerCase().trim();
    var courses = document.querySelectorAll(".course-item");

    courses.forEach(function (course) {
      var nameEl = course.querySelector(".course-name");
      var codeEl = course.querySelector(".course-code");

      var courseName = nameEl ? nameEl.textContent.toLowerCase() : "";
      var courseCode = codeEl ? codeEl.textContent.toLowerCase() : "";

      // better matching
      var words = courseName.split(" ");
      var nameMatch = words.some((word) => word.startsWith(input));
      var codeMatch = courseCode.includes(input);

      if (nameMatch || codeMatch || input === "") {
        course.style.display = "";
      } else {
        course.style.display = "none";
      }
    });
  });
});

// Run Functions
accordionHover();
typingAnimation();
toggleSeeMore();
togglefaqs();

// Load search index once (works for all pages that include the navbar search UI)
loadSearchData();

// Prepare in-page index early (only if page has relevant content)
pageIndex = buildPageSearchIndex();
