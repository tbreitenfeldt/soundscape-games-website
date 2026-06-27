/**
 * main.js
 *
 * Fetches games.json, parses the game metadata, and renders
 * accessible game cards into #games-list.
 *
 * JSON schema expected:
 * {
 *   "games": [
 *     {
 *       "name":        string,   // display name of the game
 *       "description": string,   // short description
 *       "version":     string,   // semver string, e.g. "1.0.0"
 *       "windowsDownloadUrl": string, // required Windows download URL
 *       "macDownloadUrl": string // optional Mac download URL
 *     }
 *   ]
 * }
 */

(function () {
  "use strict";

  const GAMES_JSON_URL = "games.json";
  const LAST_UPDATED_YEAR = "2026";

  // ── DOM references ──────────────────────────────────────────
  const gamesList = document.getElementById("games-list");
  const gamesStatus = document.getElementById("games-status");
  const footerYear = document.getElementById("footer-year");
  const navLinks = Array.prototype.slice.call(
    document.querySelectorAll('nav[aria-label="Site navigation"] a[href^="#"]')
  );

  // ── Set footer year ─────────────────────────────────────────
  if (footerYear) {
    footerYear.textContent = LAST_UPDATED_YEAR;
  }

  // ── Announce a message to screen readers via the live region ─
  function announce(message) {
    if (gamesStatus) {
      gamesStatus.textContent = "";
      // Brief timeout forces screen readers to re-read the region
      setTimeout(function () {
        gamesStatus.textContent = message;
      }, 50);
    }
  }

  // ── Validate a single game entry ─────────────────────────────
  function isValidGame(game) {
    return (
      game &&
      typeof game.name === "string" &&
      game.name.trim() !== "" &&
      typeof game.description === "string" &&
      typeof game.version === "string" &&
      game.version.trim() !== "" &&
      typeof game.windowsDownloadUrl === "string" &&
      game.windowsDownloadUrl.trim() !== "" &&
      (typeof game.macDownloadUrl === "undefined" ||
        game.macDownloadUrl === null ||
        (typeof game.macDownloadUrl === "string" &&
          game.macDownloadUrl.trim() !== ""))
    );
  }

  function createPlatformIcon(platform) {
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("width", "16");
    svg.setAttribute("height", "16");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    svg.classList.add("platform-icon");

    const path = document.createElementNS(svgNS, "path");
    path.setAttribute("fill", "currentColor");

    if (platform === "mac") {
      path.setAttribute(
        "d",
        "M16.7 2.6c.1 1-.2 2-.8 2.8-.6.8-1.5 1.4-2.4 1.3-.1-1 .2-2 .8-2.7.6-.8 1.5-1.4 2.4-1.4zm3.1 13.6c-.5 1.1-.8 1.6-1.4 2.5-.8 1.3-2 3-3.5 3-1.3 0-1.6-.8-3.4-.8s-2.1.8-3.4.8c-1.5 0-2.7-1.6-3.5-2.9C2.7 15 2.1 9.4 4.8 7.5c1.5-1.1 3.1-.9 4.4-.9 1.2 0 2.2-.8 3.4-.8 1.1 0 2.5.8 3.4.8 1.5 0 2.8-.6 4.2.5-1.2.7-2.1 2-2.1 3.4 0 1.7 1 3.1 2.1 4.4z"
      );
    } else {
      path.setAttribute(
        "d",
        "M3 4.5 11 3v8H3V4.5zm9-1.7L21 1.4v9.5h-9V2.8zM3 21l8 1.3V14H3V21zm9 1.5 9-1.5v-7h-9v8.5z"
      );
    }

    svg.appendChild(path);
    return svg;
  }

  function normalizeMetadata(game) {
    if (game.metadata && typeof game.metadata === "object") {
      return game.metadata;
    }

    return {
      platform: game.platform,
      genre: game.genre,
      estimatedPlayTime: game.estimatedPlayTime,
    };
  }

  function buildMetadataRow(game) {
    const metadata = normalizeMetadata(game);
    const values = [
      metadata.platform,
      metadata.genre,
      metadata.estimatedPlayTime,
    ]
      .map(function (value) {
        return typeof value === "string" ? value.trim() : "";
      })
      .filter(Boolean);

    if (!values.length) {
      return null;
    }

    const row = document.createElement("div");
    row.className = "game-card__metadata-row";

    values.forEach(function (value) {
      const item = document.createElement("span");
      item.className = "game-card__metadata-item";
      item.textContent = value;
      row.appendChild(item);
    });

    return row;
  }

  // ── Build a single game card element ─────────────────────────
  function buildGameCard(game) {
    const article = document.createElement("article");
    article.className = "game-card";

    const heading = document.createElement("h3");
    heading.textContent = game.name;

    const meta = document.createElement("p");
    meta.className = "game-card__meta";

    const versionBadge = document.createElement("span");
    versionBadge.className = "game-card__version-badge";
    versionBadge.textContent = "v" + game.version;
    meta.appendChild(versionBadge);

    const description = document.createElement("p");
    description.className = "game-card__description";
    description.textContent = game.description;

    const metadataRow = buildMetadataRow(game);

    const downloadActions = document.createElement("div");
    downloadActions.className = "game-card__actions";

    const windowsDownloadLink = document.createElement("a");
    windowsDownloadLink.href = game.windowsDownloadUrl;
    windowsDownloadLink.className = "game-card__download";
    const windowsIcon = createPlatformIcon("windows");
    windowsDownloadLink.appendChild(windowsIcon);
    windowsDownloadLink.appendChild(document.createTextNode("Download for Windows"));
    // Communicate that this is a file download to screen readers
    windowsDownloadLink.setAttribute(
      "aria-label",
      "Download " + game.name + " version " + game.version + " for Windows"
    );
    windowsDownloadLink.setAttribute("download", "");
    downloadActions.appendChild(windowsDownloadLink);

    if (typeof game.macDownloadUrl === "string" && game.macDownloadUrl.trim() !== "") {
      const macDownloadLink = document.createElement("a");
      macDownloadLink.href = game.macDownloadUrl;
      macDownloadLink.className = "game-card__download";
      const macIcon = createPlatformIcon("mac");
      macDownloadLink.appendChild(macIcon);
      macDownloadLink.appendChild(document.createTextNode("Download for Mac"));
      macDownloadLink.setAttribute(
        "aria-label",
        "Download " + game.name + " version " + game.version + " for Mac"
      );
      macDownloadLink.setAttribute("download", "");
      downloadActions.appendChild(macDownloadLink);
    }

    article.appendChild(heading);
    article.appendChild(meta);
    article.appendChild(description);
    if (metadataRow) {
      article.appendChild(metadataRow);
    }
    article.appendChild(downloadActions);

    return article;
  }

  const NO_GAMES_MESSAGE = "No games are available at the moment. Check back soon!";
  const NO_GAMES_ANNOUNCEMENT = "No games are currently available.";

  // ── Render the list of games ──────────────────────────────────
  function renderGames(games) {
    // Clear any previous content (e.g. the loading message)
    gamesList.innerHTML = "";

    const validGames = games ? games.filter(isValidGame) : [];
    gamesList.classList.toggle("games-list--single", validGames.length === 1);

    if (validGames.length === 0) {
      const empty = document.createElement("p");
      empty.textContent = NO_GAMES_MESSAGE;
      gamesList.appendChild(empty);
      announce(NO_GAMES_ANNOUNCEMENT);
      return;
    }

    const fragment = document.createDocumentFragment();
    validGames.forEach(function (game) {
      fragment.appendChild(buildGameCard(game));
    });
    gamesList.appendChild(fragment);

    const count = validGames.length;
    announce(count + (count === 1 ? " game loaded." : " games loaded."));
  }

  // ── Show an error state ───────────────────────────────────────
  function showError(message) {
    gamesList.innerHTML = "";
    const errorParagraph = document.createElement("p");
    errorParagraph.className = "error-message";
    errorParagraph.setAttribute("role", "alert");
    errorParagraph.textContent = message;
    gamesList.appendChild(errorParagraph);
    announce(message);
  }

  function initActiveSectionHighlight() {
    if (!navLinks.length || !window.IntersectionObserver) {
      return;
    }

    const sectionIds = navLinks
      .map(function (link) {
        return link.getAttribute("href");
      })
      .filter(function (href) {
        return href && href.charAt(0) === "#";
      });

    const sections = sectionIds
      .map(function (id) {
        return document.getElementById(id.slice(1));
      })
      .filter(Boolean);

    function setActiveNav(sectionId) {
      navLinks.forEach(function (link) {
        const isActive = link.getAttribute("href") === "#" + sectionId;
        if (isActive) {
          link.setAttribute("aria-current", "true");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    }

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            setActiveNav(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-40% 0px -45% 0px",
        threshold: 0.01,
      }
    );

    sections.forEach(function (section) {
      observer.observe(section);
    });

    if (sections.length) {
      setActiveNav(sections[0].id);
    }
  }

  initActiveSectionHighlight();

  // ── Fetch and parse games.json ────────────────────────────────
  if (window.location.protocol === "file:") {
    showError(
      "This site must be served over http://localhost to load games. Start a local server and open the provided URL."
    );
  } else {
    fetch(GAMES_JSON_URL)
      .then(function (response) {
        if (!response.ok) {
          throw new Error(
            "Unable to load game data (HTTP " + response.status + ")."
          );
        }
        return response.json();
      })
      .then(function (data) {
        if (!data || !Array.isArray(data.games)) {
          throw new Error("Game data is in an unexpected format.");
        }
        renderGames(data.games);
      })
      .catch(function (error) {
        console.error("Failed to load games:", error);
        showError(
          "Sorry, the game list could not be loaded. Please try again later."
        );
      });
  }
})();
