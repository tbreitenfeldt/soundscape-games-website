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
 *       "downloadUrl": string    // absolute URL to the zip file
 *     }
 *   ]
 * }
 */

(function () {
  "use strict";

  const GAMES_JSON_URL = "games.json";

  // ── DOM references ──────────────────────────────────────────
  const gamesList = document.getElementById("games-list");
  const gamesStatus = document.getElementById("games-status");
  const footerYear = document.getElementById("footer-year");

  // ── Set footer year ─────────────────────────────────────────
  if (footerYear) {
    footerYear.textContent = new Date().getFullYear();
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
      typeof game.downloadUrl === "string" &&
      game.downloadUrl.trim() !== ""
    );
  }

  // ── Build a single game card element ─────────────────────────
  function buildGameCard(game) {
    const article = document.createElement("article");
    article.className = "game-card";

    const heading = document.createElement("h3");
    heading.textContent = game.name;

    const meta = document.createElement("p");
    meta.className = "game-card__meta";
    meta.textContent = "Version " + game.version;

    const description = document.createElement("p");
    description.className = "game-card__description";
    description.textContent = game.description;

    const downloadLink = document.createElement("a");
    downloadLink.href = game.downloadUrl;
    downloadLink.className = "game-card__download";
    downloadLink.textContent = "Download " + game.name;
    // Communicate that this is a file download to screen readers
    downloadLink.setAttribute(
      "aria-label",
      "Download " + game.name + " version " + game.version + " (ZIP file)"
    );
    downloadLink.setAttribute("download", "");

    article.appendChild(heading);
    article.appendChild(meta);
    article.appendChild(description);
    article.appendChild(downloadLink);

    return article;
  }

  // ── Render the list of games ──────────────────────────────────
  function renderGames(games) {
    // Clear any previous content (e.g. the loading message)
    gamesList.innerHTML = "";

    if (!games || games.length === 0) {
      const empty = document.createElement("p");
      empty.textContent = "No games are available at the moment. Check back soon!";
      gamesList.appendChild(empty);
      announce("No games are currently available.");
      return;
    }

    const validGames = games.filter(isValidGame);

    if (validGames.length === 0) {
      const empty = document.createElement("p");
      empty.textContent = "No games are available at the moment. Check back soon!";
      gamesList.appendChild(empty);
      announce("No games are currently available.");
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

  // ── Fetch and parse games.json ────────────────────────────────
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
})();
