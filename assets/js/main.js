// ============================
// Configuration and Constants
// ============================
const CONFIG = {
  TIMEOUT_MS: 5000,
  ERROR_DISPLAY_TIME: 3000,
  ANIMATION_DURATION: 300,
};

const SECTIONS = {
  ANNOUNCEMENT: "announcement-section",
  CHARACTER_SELECTION: "character-selection-section",
};

// ============================
// Custom Error Types
// ============================
class FighterSelectionError extends Error {
  constructor(message) {
    super(message);
    this.name = "FighterSelectionError";
  }
}

// ============================
// State Management
// ============================
const gameState = {
  selectedFighter: null,
  initialized: false,
};

// ============================
// Error Handling
// ============================
const showError = (message) => {
  console.log(message);
};

// ============================
// Data Validation
// ============================
const validateFighterData = (fighter) => {
  const requiredProps = ["stats", "advantages", "limitations"];
  const requiredStats = [
    "strength",
    "intelligence",
    "dexterity",
    "endurance",
    "courage",
    "speed",
  ];

  return (
    requiredProps.every(
      (prop) =>
        fighter.hasOwnProperty(prop) &&
        fighter[prop] !== null &&
        typeof fighter[prop] === "object",
    ) &&
    requiredStats.every(
      (stat) =>
        fighter.stats.hasOwnProperty(stat) &&
        typeof fighter.stats[stat] === "number" &&
        fighter.stats[stat] >= 0 &&
        fighter.stats[stat] <= 100,
    )
  );
};

// ============================
// Fighter Management
// ============================
const loadFighters = async () => {
  try {
    const response = await fetch("assets/data/fighters.json");
    if (!response.ok) {
      throw new Error("Failed to fetch fighters data");
    }
    const data = await response.json();

    return Object.entries(data.fighters).map(([id, fighter]) => {
      if (!validateFighterData(fighter)) {
        throw new FighterSelectionError(`Invalid fighter data for ${id}`);
      }
      return { id, ...fighter };
    });
  } catch (error) {
    showError(`Failed to load fighters: ${error.message}`);
    return [];
  }
};

// ============================
// UI Rendering
// ============================
const createStatElement = (stat, value) => {
  const li = document.createElement("li");
  li.innerHTML = `
    <div class="stat-label">
      <span class="stat-name">${stat.toUpperCase()}</span>
      <span class="stat-value">${value}</span>
    </div>
    <div class="stat-bar-bg">
      <div class="stat-bar" style="width: ${value}%"></div>
    </div>
  `;
  return li;
};

const renderList = (items, container) => {
  items.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    container.appendChild(li);
  });
};

const renderFighter = (fighter, template) => {
  const clone = document.importNode(template.content, true);

  const avatarImg = clone.querySelector(".avatar-img");
  const miniAvatarImg = clone.querySelector(".avatar-mini-img");
  avatarImg.src = fighter.imageUrl;
  miniAvatarImg.src = fighter.imageUrl;
  avatarImg.alt = `${fighter.id} avatar`;
  miniAvatarImg.alt = `${fighter.id} mini avatar`;

  clone.querySelector(".fighter-header").textContent = fighter.id.toUpperCase();
  clone.querySelectorAll(".fighter-name").forEach((el) => {
    el.textContent = fighter.id;
  });

  if (fighter.bio) {
    const bioElement = clone.querySelector(".fighter-bio");
    bioElement.textContent = fighter.bio;
  }

  const statsList = clone.querySelector(".stats-list");
  Object.entries(fighter.stats).forEach(([stat, value]) => {
    statsList.appendChild(createStatElement(stat, value));
  });

  renderList(fighter.advantages, clone.querySelector(".advantages"));
  renderList(fighter.limitations, clone.querySelector(".limitations"));

  const selectButton = clone.querySelector(".select-button");
  selectButton.addEventListener("click", () => selectFighter(fighter.id));

  return clone;
};

const renderFighters = (fighters) => {
  const template = document.getElementById("fighter-template");
  const container = document.querySelector(".fighters-grid");

  fighters.forEach((fighter) => {
    container.appendChild(renderFighter(fighter, template));
  });
};

// ============================
// Fighter Selection
// ============================
const showConfirmationModal = (fighterId) => {
  const modal = document.getElementById("confirmationModal");
  const message = document.getElementById("confirmationMessage");

  message.textContent = `Are you sure you want ${fighterId}?`;
  modal.classList.add("showing");

  const handleConfirm = () => {
    document.querySelectorAll(".fighter-container").forEach((container) => {
      container.classList.toggle(
        "selected",
        container.querySelector(".fighter-name").textContent === fighterId,
      );
    });
    modal.classList.remove("showing");
    handleConfirmedSelection(fighterId);
  };

  const handleCancel = () => {
    modal.classList.remove("showing");
    gameState.selectedFighter = null;
    document.querySelectorAll(".fighter-container").forEach((container) => {
      container.classList.remove("selected");
    });
  };

  document.getElementById("confirmChoice").onclick = handleConfirm;
  document.getElementById("cancelChoice").onclick = handleCancel;
};

const selectFighter = (fighterId) => {
  try {
    if (gameState.selectedFighter === fighterId) {
      return;
    }

    gameState.selectedFighter = fighterId;
    showConfirmationModal(fighterId);
  } catch (error) {
    showError("Error selecting fighter");
    console.error("Selection error:", error);
  }
};

// ============================
// Event Handlers
// ============================
const setupEventListeners = () => {
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (gameState.selectedFighter) {
        gameState.selectedFighter = null;
        document.querySelectorAll(".fighter-container").forEach((container) => {
          container.classList.remove("selected");
        });
      }

      const modal = document.getElementById("confirmationModal");
      if (modal.classList.contains("showing")) {
        modal.classList.remove("showing");
        gameState.selectedFighter = null;
        document.querySelectorAll(".fighter-container").forEach((container) => {
          container.classList.remove("selected");
        });
      }
    }
  });
};

// ============================
// Selection Handler
// ============================
const handleConfirmedSelection = (fighterId) => {
  console.log(`Fighter ${fighterId} selected!`);
};

// ============================
// Initialization
// ============================
const initNavigation = () => {
  document.body.classList.add("no-scroll");

  const openButton = document.getElementById("open-button");
  const openDiv = document.getElementById("open-div");
  const continueDiv = document.getElementById("continue-div");
  const continueButton = document.getElementById("continue-button");
  const announcementSection = document.getElementById("announcement-section");
  const characterSelectionSection = document.getElementById(
    "character-selection-section",
  );

  openButton.addEventListener("click", function () {
    openDiv.classList.add("hidden-section");
    openDiv.classList.remove("active-section");
    continueDiv.classList.add("active-section");
    continueDiv.classList.remove("hidden-section");
  });

  continueButton.addEventListener("click", function () {
    document.body.classList.remove("no-scroll");
    announcementSection.classList.add("hidden-section");
    announcementSection.classList.remove("active-section");
    characterSelectionSection.classList.add("active-section");
    characterSelectionSection.classList.remove("hidden-section");
  });
};

const initScrollIndicators = () => {
  if (window.innerWidth <= 768) {
    const fightersGrid = document.querySelector(".fighters-grid");
    const fighters = document.querySelectorAll(".fighter-container");

    const indicatorContainer = document.createElement("div");
    indicatorContainer.className = "scroll-indicator";

    fighters.forEach((_, index) => {
      const dot = document.createElement("div");
      dot.className = "scroll-dot";
      if (index === 0) dot.classList.add("active");
      indicatorContainer.appendChild(dot);
    });

    fightersGrid.parentNode.insertBefore(
      indicatorContainer,
      fightersGrid.nextSibling,
    );

    fightersGrid.addEventListener("scroll", () => {
      const scrollPosition = fightersGrid.scrollLeft;
      const containerWidth = fightersGrid.offsetWidth;
      const activeIndex = Math.round(scrollPosition / containerWidth);

      document.querySelectorAll(".scroll-dot").forEach((dot, index) => {
        dot.classList.toggle("active", index === activeIndex);
      });
    });
  }
};

const initScrollArrows = () => {
  if (window.innerWidth <= 768) {
    const fightersGrid = document.querySelector(".fighters-grid");
    const leftArrow = document.querySelector(".scroll-left");
    const rightArrow = document.querySelector(".scroll-right");
    let hasScrolled = false;

    const handleVerticalScroll = () => {
      const characterSection = document.getElementById(
        "character-selection-section",
      );
      const sectionTop = characterSection.offsetTop;
      const scrollPosition =
        window.pageYOffset || document.documentElement.scrollTop;

      if (scrollPosition >= sectionTop && !hasScrolled) {
        hasScrolled = true;
        rightArrow.classList.remove("hidden");
      }
    };

    const handleHorizontalScroll = () => {
      const isAtStart = fightersGrid.scrollLeft < fightersGrid.offsetWidth / 2;
      const isAtEnd = fightersGrid.scrollLeft >= fightersGrid.offsetWidth / 2;

      leftArrow.classList.toggle("hidden", isAtStart);
      rightArrow.classList.toggle("hidden", isAtEnd);
    };

    leftArrow.classList.add("hidden");
    rightArrow.classList.add("hidden");

    window.addEventListener("scroll", handleVerticalScroll);
    fightersGrid.addEventListener("scroll", handleHorizontalScroll);

    leftArrow.addEventListener("click", () => {
      fightersGrid.scrollTo({
        left: 0,
        behavior: "smooth",
      });
    });

    rightArrow.addEventListener("click", () => {
      fightersGrid.scrollTo({
        left: fightersGrid.scrollWidth,
        behavior: "smooth",
      });
    });
  }
};

// Debounce function to limit the frequency of scroll event handling
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
};

const updateStickyHeaders = () => {
  const fightersGrid = document.querySelector(".fighters-grid");
  const fighters = document.querySelectorAll(".fighter-container");
  const containerWidth = fightersGrid.offsetWidth;

  fighters.forEach((fighter) => {
    const rect = fighter.getBoundingClientRect();
    const stickyHeader = fighter.querySelector(".fighter-sticky-header");

    const centerPoint = containerWidth / 2;
    const fighterCenter = rect.left + rect.width / 2;
    const distanceFromCenter = Math.abs(fighterCenter - centerPoint);

    if (distanceFromCenter < rect.width / 2) {
      stickyHeader.classList.add("visible");
    } else {
      stickyHeader.classList.remove("visible");
    }
  });
};

const initStickyHeaders = () => {
  if (window.innerWidth <= 768) {
    const fightersGrid = document.querySelector(".fighters-grid");

    const debouncedUpdateStickyHeaders = debounce(updateStickyHeaders, 100);

    fightersGrid.addEventListener("scroll", debouncedUpdateStickyHeaders);
    window.addEventListener("scroll", debouncedUpdateStickyHeaders);
  }
};

const init = async () => {
  if (gameState.initialized) return;

  try {
    const fighters = await loadFighters();

    if (fighters.length === 0) {
      showError("No fighters available. Please try again later.");
      return;
    }

    renderFighters(fighters);
    setupEventListeners();
    initNavigation();
    initScrollIndicators();
    initScrollArrows();
    initStickyHeaders();
    gameState.initialized = true;
  } catch (error) {
    showError("Failed to initialize application");
    console.error("Initialization error:", error);
  }
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

window.addEventListener("error", (event) => {
  console.error("Global error:", event.error);
  showError("An unexpected error occurred. Please refresh the page.");
});
