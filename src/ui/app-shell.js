import {
  CURRENT_DATE_LABEL,
  adminInsights,
  architectureCards,
  brand,
  catalog,
  chartFeeds,
  featuredSongs,
  getCountries,
  getGenres,
  getLanguages,
  getSongById,
  libraryDistribution,
  moods,
  playlists,
  profile,
  recommendSongs,
  searchCatalog,
  stories,
  trendingRail,
} from "../data/catalog.js";
import { NoctraPreviewEngine } from "../audio/preview-engine.js";

const app = document.querySelector("#app");

const allGenres = ["All", ...getGenres()];
const allLanguages = ["All", ...getLanguages()];
const allCountries = ["All", ...getCountries()];
const moodMeta = Object.fromEntries(moods.map((mood) => [mood.label, mood]));
const profileDefaults = new Set(profile.favoriteSongs.map((song) => song.id));
const libraryStats = {
  songs: catalog.length,
  artists: new Set(catalog.map((song) => song.artist)).size,
  albums: new Set(catalog.map((song) => song.album)).size,
  countries: new Set(catalog.map((song) => song.country)).size,
  languages: new Set(catalog.map((song) => song.language)).size,
};

const state = {
  currentSongId: featuredSongs[0].id,
  isPlaying: false,
  isRepeatOn: true,
  isShuffleOn: false,
  progressSeconds: 0,
  durationSeconds: featuredSongs[0].durationSeconds,
  volume: 76,
  showLyrics: false,
  selectedPlaylistId: playlists.find((playlist) => playlist.name === "Late Night")?.id ?? playlists[0].id,
  searchQuery: "",
  searchMood: "All",
  searchGenre: "All",
  searchLanguage: "All",
  searchCountry: "All",
  aiMood: "Midnight",
  aiWeather: "Rainy",
  aiTimeSegment: "Late Night",
  aiStory:
    "I miss the city lights, one unfinished goodbye, and the version of myself that only appears when the rain hits the window after midnight.",
  likedSongs: new Set([featuredSongs[0].id, featuredSongs[1].id, featuredSongs[3].id, featuredSongs[5].id]),
  favoriteSongs: new Set([...profileDefaults, featuredSongs[2].id, featuredSongs[4].id]),
  followedUsers: new Set(["midnightletters", "coffeeringnote"]),
  storyLikeDeltas: new Map(),
  storyBookmarkSet: new Set(["story-1", "story-4"]),
};

const ui = {
  revealObserver: null,
  toastTimer: null,
  spectrumFrame: 0,
};

const previewEngine = new NoctraPreviewEngine({
  onProgress: ({ currentTime, duration, isPlaying }) => {
    state.progressSeconds = currentTime;
    state.durationSeconds = duration || getCurrentSong().durationSeconds;
    state.isPlaying = isPlaying;
    syncPlaybackUI();
  },
  onEnded: () => {
    handleSongEnded().catch((error) => {
      console.error("Unable to advance playback", error);
      showToast("Track finished, but the next preview could not start.");
    });
  },
});

export function initNoctraApp() {
  if (!app) {
    return;
  }

  renderShell();
  bindEvents();
  setupMotion();
  renderAll();
  previewEngine.setVolume(state.volume / 100);
  syncPlaybackUI();
  startSpectrumLoop();

  window.addEventListener(
    "beforeunload",
    () => {
      previewEngine.destroy();
    },
    { once: true },
  );
}

function renderShell() {
  app.innerHTML = `
    <div class="ambient-shell" aria-hidden="true">
      <div class="blur-orb blur-orb-a"></div>
      <div class="blur-orb blur-orb-b"></div>
      <div class="blur-orb blur-orb-c"></div>
      <div class="night-grid"></div>
      <div class="rainfall rainfall-back"></div>
      <div class="rainfall rainfall-front"></div>
      <div class="particles">
        ${Array.from({ length: 28 }, (_, index) => {
          const left = (index * 13) % 100;
          const delay = ((index % 8) * 0.55).toFixed(2);
          const duration = (8 + (index % 6) * 1.4).toFixed(2);
          return `<span class="particle" style="left:${left}%;animation-delay:${delay}s;animation-duration:${duration}s"></span>`;
        }).join("")}
      </div>
    </div>

    <div class="app-shell">
      <header class="glass topbar reveal">
        <div class="brand-lockup">
          <div class="brand-mark">N</div>
          <div>
            <div class="eyebrow">Global emotional music discovery</div>
            <h1>${brand.name}</h1>
            <p>${brand.headline}</p>
          </div>
        </div>

        <nav class="topbar-nav" aria-label="Primary navigation">
          ${[
            ["home", "Home"],
            ["discover", "Discover"],
            ["charts", "Trending"],
            ["community", "Community"],
            ["profile", "Profile"],
            ["admin", "Admin"],
            ["architecture", "Architecture"],
          ]
            .map(
              ([target, label]) => `
                <button class="nav-pill" data-action="scroll-to" data-target="${target}">${label}</button>
              `,
            )
            .join("")}
        </nav>

        <div class="topbar-actions">
          <div class="signal-pill">1,000+ songs indexed</div>
          <button class="primary-button" data-action="scroll-to" data-target="discover">Discover songs</button>
        </div>
      </header>

      <main class="main-layout">
        <section id="home" class="hero-layout reveal">
          <div id="hero-player"></div>

          <div class="hero-stack">
            <article class="glass side-panel" id="live-queue"></article>
            <article class="glass side-panel" id="overview-panel"></article>
            <article class="glass side-panel" id="community-spotlight"></article>
          </div>
        </section>

        <section class="content-section reveal">
          <article class="glass trending-panel">
            <div class="section-heading">
              <div>
                <div class="eyebrow">Real chart energy</div>
                <h2>Trending now across moods, stories, and cultural feeds</h2>
              </div>
              <span class="signal-pill">Updated ${CURRENT_DATE_LABEL}</span>
            </div>
            <div id="trending-rail" class="trending-grid"></div>
          </article>
        </section>

        <section id="discover" class="content-section reveal">
          <div class="section-heading">
            <div>
              <div class="eyebrow">Emotion-led search</div>
              <h2>Search by song, artist, album, lyric, genre, mood, language, and country</h2>
            </div>
            <span class="signal-pill">Indexed for 1,000+ tracks</span>
          </div>

          <div class="discover-layout">
            <article class="glass discover-panel" id="discover-panel"></article>
            <article class="glass playlist-panel" id="playlist-panel"></article>
          </div>
        </section>

        <section id="charts" class="content-section reveal">
          <div class="section-heading">
            <div>
              <div class="eyebrow">Feed surfaces</div>
              <h2>Billboard, Spotify, TikTok, Apple Music, YouTube, and regional momentum</h2>
            </div>
            <span class="signal-pill">${chartFeeds.length} live adapters</span>
          </div>

          <div class="split-layout">
            <article class="glass chart-panel" id="chart-panel"></article>
            <article class="glass ai-panel" id="ai-panel"></article>
          </div>
        </section>

        <section id="community" class="content-section reveal">
          <div class="section-heading">
            <div>
              <div class="eyebrow">Community layer</div>
              <h2>Stories, follows, favorites, comments, and emotional context around every track</h2>
            </div>
            <span class="signal-pill">Anonymous stories enabled</span>
          </div>

          <div class="community-layout">
            <article class="glass stories-panel" id="stories-panel"></article>

            <div class="community-side">
              <article id="profile" class="glass profile-panel"></article>
              <article id="admin" class="glass admin-panel"></article>
            </div>
          </div>
        </section>

        <section id="architecture" class="content-section reveal">
          <article class="glass architecture-panel">
            <div class="section-heading">
              <div>
                <div class="eyebrow">Scalable architecture</div>
                <h2>Designed to grow beyond 1,000 songs without UI or search performance issues</h2>
              </div>
              <span class="signal-pill">Production-minded</span>
            </div>
            <div id="architecture-grid" class="architecture-grid"></div>
          </article>
        </section>
      </main>

      <div class="glass bottom-dock" id="bottom-dock"></div>
      <div class="toast" id="toast"></div>
    </div>
  `;
}

function renderAll() {
  renderHeroPlayer();
  renderLiveQueue();
  renderOverviewPanel();
  renderCommunitySpotlight();
  renderTrendingRail();
  renderDiscoverPanel();
  renderPlaylistPanel();
  renderChartPanel();
  renderAiPanel();
  renderStoriesPanel();
  renderProfilePanel();
  renderAdminPanel();
  renderArchitecturePanel();
  renderBottomDock();
}

function renderHeroPlayer() {
  const song = getCurrentSong();
  const hero = document.querySelector("#hero-player");
  const spotlightStory = getSpotlightStory(song);
  const isLiked = state.likedSongs.has(song.id);
  const isFavorite = state.favoriteSongs.has(song.id);
  const playLabel = state.isPlaying ? "Pause" : "Play";

  hero.innerHTML = `
    <article class="glass hero-player">
      <div class="hero-backdrop" style="--cover:${song.albumCover}; --accent:${song.coverAccent}; --aura:${song.coverAura};">
        <div class="hero-rain"></div>
        <div class="hero-bokeh"></div>
      </div>

      <div class="hero-grid">
        <div class="stage-art">
          <div class="record-stack ${state.isPlaying ? "is-playing" : ""}">
            <div class="vinyl-disc"></div>
            <div class="cover-card" style="background:${song.albumCover}">
              <span>${getInitials(song.title)}</span>
            </div>
          </div>

          <div class="stage-badges">
            <span class="signal-pill">Rainy night mode</span>
            <span class="signal-pill">Adaptive audio preview</span>
          </div>
        </div>

        <div class="stage-copy">
          <div class="eyebrow">Large hero music player</div>
          <h2>${escapeHtml(song.title)}</h2>
          <p class="hero-meta-line">${escapeHtml(song.artist)} · ${escapeHtml(song.album)} · ${song.duration} · ${song.releaseYear}</p>

          <div class="hero-tags">
            ${renderTag(song.mood, moodMeta[song.mood]?.emoji)}
            ${renderTag(song.genre)}
            ${renderTag(song.language)}
            ${renderTag(song.country)}
            ${renderTag(song.lyricsAvailability)}
          </div>

          <p class="hero-summary">${escapeHtml(song.aiSummary)}</p>

          <div class="story-pulse">
            <div class="story-pulse-head">
              <span>${spotlightStory ? "Story connected to this mood" : "Community pulse"}</span>
              <strong>${spotlightStory ? `@${spotlightStory.username}` : "Always listening"}</strong>
            </div>
            <p>${escapeHtml(
              spotlightStory?.story ??
                "The community layer keeps every song tied to a feeling, a place, a memory, or a difficult night that somebody else survived first.",
            )}</p>
          </div>

          <div class="player-metrics">
            ${renderMetricCard("Popularity", `${song.popularityScore}/99`)}
            ${renderMetricCard("Monthly", formatCompactNumber(song.monthlyPlayCount))}
            ${renderMetricCard("Likes", formatCompactNumber(song.totalLikes))}
            ${renderMetricCard("Comments", formatCompactNumber(song.totalComments))}
          </div>

          <div class="progress-panel">
            <div class="time-row">
              <span id="current-time-label">${formatTime(state.progressSeconds)}</span>
              <span id="duration-time-label">${formatTime(state.durationSeconds || song.durationSeconds)}</span>
            </div>
            <input
              id="progress-slider"
              class="hero-range"
              type="range"
              min="0"
              max="${Math.max(1, Math.round(state.durationSeconds || song.durationSeconds))}"
              value="${Math.round(state.progressSeconds)}"
              step="1"
            />
          </div>

          <div class="transport-row">
            <button class="transport-button" data-action="toggle-shuffle">${state.isShuffleOn ? "Shuffle On" : "Shuffle"}</button>
            <button class="transport-button" data-action="prev-song">Previous</button>
            <button class="transport-primary" data-action="toggle-play"><span data-role="play-label">${playLabel}</span></button>
            <button class="transport-button" data-action="next-song">Next</button>
            <button class="transport-button" data-action="toggle-repeat">${state.isRepeatOn ? "Repeat On" : "Repeat"}</button>
          </div>

          <div class="utility-row">
            <button class="utility-button ${isLiked ? "is-active" : ""}" data-action="toggle-like" data-song-id="${song.id}">${isLiked ? "Liked" : "Like"}</button>
            <button class="utility-button ${isFavorite ? "is-active" : ""}" data-action="toggle-favorite" data-song-id="${song.id}">${isFavorite ? "Saved" : "Favorite"}</button>
            <button class="utility-button ${state.showLyrics ? "is-active" : ""}" data-action="toggle-lyrics">${state.showLyrics ? "Hide Lyrics" : "Lyrics"}</button>
            <button class="utility-button" data-action="share-whatsapp">Share WhatsApp</button>
            <button class="utility-button" data-action="share-instagram">Share Instagram</button>
            <button class="utility-button" data-action="download-playlist">Download Playlist</button>
            <button class="utility-button" data-action="fullscreen">Fullscreen</button>
          </div>

          <div class="volume-panel">
            <label class="field">
              <span>Volume</span>
              <input
                id="volume-slider"
                class="hero-range"
                type="range"
                min="0"
                max="100"
                value="${state.volume}"
                step="1"
              />
            </label>
          </div>

          ${
            state.showLyrics
              ? `
                <div class="lyrics-panel">
                  <div class="section-kicker">
                    <span>Lyrics Preview</span>
                    <strong>${song.lyricsAvailability}</strong>
                  </div>
                  <pre>${escapeHtml(song.lyricsExcerpt)}</pre>
                </div>
              `
              : ""
          }
        </div>

        <div class="stage-side">
          <div class="glass inner-card">
            <div class="section-kicker">
              <span>Playback status</span>
              <strong data-role="play-state">${state.isPlaying ? "Preview live" : "Ready to play"}</strong>
            </div>
            <canvas id="spectrum-canvas" class="spectrum-canvas"></canvas>
            <div class="spectrum-caption">
              <span>${song.genre} · ${song.mood}</span>
              <strong>${formatCompactNumber(song.weeklyPlayCount)} weekly plays</strong>
            </div>
          </div>

          <div class="glass inner-card">
            <div class="section-kicker">
              <span>Platform links</span>
              <strong>Distribution-ready</strong>
            </div>
            <div class="link-list">
              <a href="${song.musicVideo}" target="_blank" rel="noreferrer">Music video</a>
              <a href="${song.appleMusicLink}" target="_blank" rel="noreferrer">Apple Music</a>
              <div class="tech-row"><span>YouTube ID</span><strong>${song.youtubeVideoId}</strong></div>
              <div class="tech-row"><span>Spotify ID</span><strong>${song.spotifyTrackId}</strong></div>
            </div>
          </div>

          <div class="glass inner-card">
            <div class="section-kicker">
              <span>Versions</span>
              <strong>Alternative moments</strong>
            </div>
            <div class="version-list">
              <div class="version-chip">${escapeHtml(song.acousticVersion)}</div>
              <div class="version-chip">${escapeHtml(song.liveVersion)}</div>
              <div class="version-chip">${escapeHtml(song.karaokeVersion)}</div>
            </div>
          </div>
        </div>
      </div>
    </article>
  `;
}

function renderLiveQueue() {
  const container = document.querySelector("#live-queue");
  const playlist = getSelectedPlaylist();
  const queue = getPlaybackPool().slice(0, 6);

  container.innerHTML = `
    <div class="panel-heading">
      <div>
        <div class="eyebrow">Current queue</div>
        <h3>${escapeHtml(playlist.name)}</h3>
      </div>
      <span class="signal-pill">${playlist.songCount} tracks</span>
    </div>
    <p class="panel-copy">${escapeHtml(playlist.description)}</p>

    <div class="queue-list">
      ${queue
        .map(
          (song, index) => `
            <button
              class="queue-row ${song.id === state.currentSongId ? "is-active" : ""}"
              data-action="set-song"
              data-song-id="${song.id}"
            >
              <div class="queue-rank">${String(index + 1).padStart(2, "0")}</div>
              <div class="queue-cover" style="background:${song.albumCover}">
                <span>${getInitials(song.title)}</span>
              </div>
              <div class="queue-copy">
                <strong>${escapeHtml(song.title)}</strong>
                <span>${escapeHtml(song.artist)}</span>
              </div>
              <small>${song.mood}</small>
            </button>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderOverviewPanel() {
  const container = document.querySelector("#overview-panel");

  container.innerHTML = `
    <div class="panel-heading">
      <div>
        <div class="eyebrow">Catalog scale</div>
        <h3>Ready for public traffic</h3>
      </div>
      <span class="signal-pill">${CURRENT_DATE_LABEL}</span>
    </div>

    <div class="stats-grid">
      ${[
        ["Songs", formatNumber(libraryStats.songs)],
        ["Artists", formatNumber(libraryStats.artists)],
        ["Albums", formatNumber(libraryStats.albums)],
        ["Countries", formatNumber(libraryStats.countries)],
      ]
        .map(([label, value]) => renderMetricCard(label, value))
        .join("")}
    </div>

    <div class="distribution-list">
      ${libraryDistribution
        .map((entry) => {
          const width = Math.max(18, Math.round((entry.songs / libraryStats.songs) * 100));
          return `
            <div class="distribution-row">
              <div class="distribution-copy">
                <strong>${entry.language}</strong>
                <span>${entry.songs} songs</span>
              </div>
              <div class="distribution-bar">
                <div class="distribution-fill" style="width:${width}%"></div>
              </div>
            </div>
          `;
        })
        .join("")}
    </div>
  `;
}

function renderCommunitySpotlight() {
  const container = document.querySelector("#community-spotlight");
  const song = getCurrentSong();
  const storyPool = stories.filter((story) => story.mood === song.mood).slice(0, 2);

  container.innerHTML = `
    <div class="panel-heading">
      <div>
        <div class="eyebrow">Tonight's community pulse</div>
        <h3>${song.mood} stories</h3>
      </div>
      <span class="signal-pill">${storyPool.length || stories.length} voices</span>
    </div>

    <div class="spotlight-list">
      ${(storyPool.length ? storyPool : stories.slice(0, 2))
        .map((story) => {
          const isFollowing = state.followedUsers.has(story.username);
          return `
            <article class="spotlight-story">
              <div class="story-headline">
                <div class="story-avatar" style="background:${story.avatar.albumCover}">
                  <span>${getInitials(story.username)}</span>
                </div>
                <div>
                  <strong>${story.username}</strong>
                  <span>${story.currentSong.title}</span>
                </div>
                <button class="mini-button" data-action="follow-user" data-username="${story.username}">
                  ${isFollowing ? "Following" : "Follow"}
                </button>
              </div>
              <p>${escapeHtml(story.story)}</p>
            </article>
          `;
        })
        .join("")}
    </div>
  `;
}

function renderTrendingRail() {
  const container = document.querySelector("#trending-rail");

  container.innerHTML = trendingRail.slice(0, 6).map((song, index) => renderTrendCard(song, index + 1)).join("");
}

function renderDiscoverPanel() {
  const container = document.querySelector("#discover-panel");
  const results = getSearchResults();

  container.innerHTML = `
    <div class="control-stack">
      <label class="field field-search">
        <span>Search song, artist, album, lyric, or mood</span>
        <input
          id="search-query"
          class="text-input"
          type="text"
          placeholder="Try: rain in Seoul, healing acoustic, Jakarta midnight..."
          value="${escapeHtml(state.searchQuery)}"
        />
      </label>

      <div class="filter-grid">
        ${renderSelect("search-mood", "Mood", ["All", ...moods.map((mood) => mood.label)], state.searchMood)}
        ${renderSelect("search-genre", "Genre", allGenres, state.searchGenre)}
        ${renderSelect("search-language", "Language", allLanguages, state.searchLanguage)}
        ${renderSelect("search-country", "Country", allCountries, state.searchCountry)}
      </div>
    </div>

    <div class="mood-strip">
      ${moods
        .map((mood) => {
          const active = state.searchMood === mood.label;
          return `
            <button class="mood-pill ${active ? "is-active" : ""}" data-action="set-mood" data-mood="${mood.label}">
              <span>${mood.emoji}</span>
              <strong>${mood.label}</strong>
              <small>${mood.aura}</small>
            </button>
          `;
        })
        .join("")}
    </div>

    <div class="results-meta">
      <strong>${results.length}</strong>
      <span>emotion-ranked matches from a 1,000+ song catalog</span>
    </div>

    <div class="results-list">
      ${
        results.length
          ? results
              .map(
                (song) => `
                  <article class="result-row ${song.id === state.currentSongId ? "is-active" : ""}">
                    <button class="result-cover" data-action="set-song" data-song-id="${song.id}" style="background:${song.albumCover}">
                      <span>${getInitials(song.title)}</span>
                    </button>

                    <div class="result-main">
                      <strong>${escapeHtml(song.title)}</strong>
                      <span>${escapeHtml(song.artist)} · ${escapeHtml(song.album)}</span>
                      <small>${song.language} · ${song.country} · ${song.releaseYear}</small>
                    </div>

                    <div class="result-tags">
                      ${renderTag(song.genre)}
                      ${renderTag(song.mood, moodMeta[song.mood]?.emoji)}
                    </div>

                    <div class="result-stats">
                      <span>${formatCompactNumber(song.monthlyPlayCount)} monthly</span>
                      <strong>${song.duration}</strong>
                    </div>

                    <div class="result-actions">
                      <button class="table-button" data-action="set-song" data-song-id="${song.id}">
                        ${song.id === state.currentSongId && state.isPlaying ? "Playing" : "Play"}
                      </button>
                      <button class="table-button ${state.likedSongs.has(song.id) ? "is-active" : ""}" data-action="toggle-like" data-song-id="${song.id}">
                        ${state.likedSongs.has(song.id) ? "Liked" : "Like"}
                      </button>
                    </div>
                  </article>
                `,
              )
              .join("")
          : `
              <div class="empty-state">
                <strong>No songs matched that search.</strong>
                <span>Try a broader mood, genre, or country combination.</span>
              </div>
            `
      }
    </div>
  `;
}

function renderPlaylistPanel() {
  const container = document.querySelector("#playlist-panel");
  const playlist = getSelectedPlaylist();

  container.innerHTML = `
    <div class="playlist-hero" style="--playlist-cover:${playlist.accent};">
      <div class="playlist-hero-copy">
        <div class="eyebrow">Curated playlists</div>
        <h3>${escapeHtml(playlist.name)}</h3>
        <p>${escapeHtml(playlist.description)}</p>
      </div>
      <div class="playlist-badge">${playlist.songCount} songs</div>
    </div>

    <div class="playlist-tabs">
      ${playlists
        .map(
          (item) => `
            <button
              class="playlist-tab ${item.id === playlist.id ? "is-active" : ""}"
              data-action="select-playlist"
              data-playlist-id="${item.id}"
            >
              ${escapeHtml(item.name)}
            </button>
          `,
        )
        .join("")}
    </div>

    <div class="playlist-list">
      ${playlist.songs
        .map(
          (song, index) => `
            <button
              class="playlist-row ${song.id === state.currentSongId ? "is-active" : ""}"
              data-action="set-song"
              data-song-id="${song.id}"
            >
              <div class="playlist-index">${index + 1}</div>
              <div class="playlist-cover" style="background:${song.albumCover}">
                <span>${getInitials(song.title)}</span>
              </div>
              <div class="playlist-copy">
                <strong>${escapeHtml(song.title)}</strong>
                <span>${escapeHtml(song.artist)}</span>
              </div>
              <small>${song.mood}</small>
            </button>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderChartPanel() {
  const container = document.querySelector("#chart-panel");

  container.innerHTML = `
    <div class="chart-grid">
      ${chartFeeds
        .map(
          (feed) => `
            <article class="feed-card">
              <div class="feed-head">
                <div>
                  <div class="eyebrow">${feed.updatedAt}</div>
                  <h3>${escapeHtml(feed.name)}</h3>
                </div>
                <span class="signal-pill">${feed.items.length} songs</span>
              </div>

              <div class="feed-list">
                ${feed.items
                  .slice(0, 4)
                  .map(
                    (entry) => `
                      <button class="feed-row" data-action="set-song" data-song-id="${entry.song.id}">
                        <div class="feed-rank">#${entry.rank}</div>
                        <div class="feed-copy">
                          <strong>${escapeHtml(entry.song.title)}</strong>
                          <span>${escapeHtml(entry.song.artist)}</span>
                        </div>
                        <div class="feed-trend movement-${entry.movement}">
                          ${entry.movement}
                        </div>
                      </button>
                    `,
                  )
                  .join("")}
              </div>
            </article>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderAiPanel() {
  const container = document.querySelector("#ai-panel");
  const recommendations = getAiRecommendations();

  container.innerHTML = `
    <div class="panel-heading">
      <div>
        <div class="eyebrow">AI recommendation studio</div>
        <h3>Queue songs by mood, story, weather, time, and taste history</h3>
      </div>
      <span class="signal-pill">6 live picks</span>
    </div>

    <div class="ai-layout">
      <div class="ai-inputs">
        ${renderSelect("ai-mood", "Mood", moods.map((mood) => mood.label), state.aiMood)}
        ${renderSelect("ai-weather", "Weather", ["Rainy", "Sunny", "Cloudy", "Stormy"], state.aiWeather)}
        ${renderSelect("ai-time", "Time", ["Late Night", "Sunrise", "Workday", "Golden Hour"], state.aiTimeSegment)}

        <label class="field">
          <span>Story prompt</span>
          <textarea id="ai-story" class="text-area" rows="7">${escapeHtml(state.aiStory)}</textarea>
        </label>

        <div class="insight-row">
          ${profile.favoriteArtists
            .slice(0, 3)
            .map((artist) => `<div class="info-pill">${escapeHtml(artist.artist)}</div>`)
            .join("")}
          ${profile.favoriteGenres.slice(0, 3).map((genre) => `<div class="info-pill">${escapeHtml(genre)}</div>`).join("")}
        </div>
      </div>

      <div class="ai-results">
        <div class="ai-summary">
          <strong>${state.aiMood} · ${state.aiWeather} · ${state.aiTimeSegment}</strong>
          <span>The engine blends story keywords, favorites, recent listening, weather, and time-of-day context.</span>
        </div>

        <div class="recommendation-list">
          ${recommendations
            .map(
              (song) => `
                <article class="recommendation-card ${song.id === state.currentSongId ? "is-active" : ""}">
                  <div class="recommendation-head">
                    <div class="recommendation-cover" style="background:${song.albumCover}">
                      <span>${getInitials(song.title)}</span>
                    </div>
                    <div class="recommendation-copy">
                      <strong>${escapeHtml(song.title)}</strong>
                      <span>${escapeHtml(song.artist)}</span>
                      <small>${song.genre} · ${song.mood}</small>
                    </div>
                  </div>
                  <p>${escapeHtml(song.aiSummary)}</p>
                  <button class="table-button" data-action="set-song" data-song-id="${song.id}">Play recommendation</button>
                </article>
              `,
            )
            .join("")}
        </div>
      </div>
    </div>
  `;
}

function renderStoriesPanel() {
  const container = document.querySelector("#stories-panel");

  container.innerHTML = `
    <div class="panel-heading">
      <div>
        <div class="eyebrow">Anonymous stories</div>
        <h3>People do not just save songs. They save what the songs meant.</h3>
      </div>
      <span class="signal-pill">${stories.length} highlighted posts</span>
    </div>

    <div class="stories-grid">
      ${stories
        .map((story) => {
          const likes = story.likes + (state.storyLikeDeltas.get(story.id) || 0);
          const isBookmarked = state.storyBookmarkSet.has(story.id);
          const isFollowing = state.followedUsers.has(story.username);
          return `
            <article class="story-card">
              <div class="story-headline">
                <div class="story-avatar" style="background:${story.avatar.albumCover}">
                  <span>${getInitials(story.username)}</span>
                </div>
                <div>
                  <strong>${story.username}</strong>
                  <span>${story.mood} · ${story.currentSong.title}</span>
                </div>
                <button class="mini-button" data-action="follow-user" data-username="${story.username}">
                  ${isFollowing ? "Following" : "Follow"}
                </button>
              </div>

              <p>${escapeHtml(story.story)}</p>

              <button class="story-song" data-action="set-song" data-song-id="${story.currentSong.id}">
                <span>Current song</span>
                <strong>${escapeHtml(story.currentSong.title)} · ${escapeHtml(story.currentSong.artist)}</strong>
              </button>

              <div class="story-actions">
                <button class="mini-button" data-action="like-story" data-story-id="${story.id}">Like ${formatCompactNumber(likes)}</button>
                <button class="mini-button">Comment ${story.comments}</button>
                <button class="mini-button">Share ${story.shares}</button>
                <button class="mini-button ${isBookmarked ? "is-active" : ""}" data-action="bookmark-story" data-story-id="${story.id}">
                  ${isBookmarked ? "Bookmarked" : "Bookmark"}
                </button>
              </div>
            </article>
          `;
        })
        .join("")}
    </div>
  `;
}

function renderProfilePanel() {
  const container = document.querySelector("#profile");
  const favoriteSongs = getFavoriteSongs();

  container.innerHTML = `
    <div class="panel-heading">
      <div>
        <div class="eyebrow">Profile system</div>
        <h3>${escapeHtml(profile.name)}</h3>
      </div>
      <span class="signal-pill">${profile.tier}</span>
    </div>

    <div class="profile-head">
      <div class="profile-avatar">AR</div>
      <div>
        <strong>${escapeHtml(profile.handle)}</strong>
        <span>${escapeHtml(profile.location)}</span>
      </div>
    </div>

    <div class="stats-grid">
      ${[
        ["Followers", formatCompactNumber(profile.followers)],
        ["Following", formatCompactNumber(profile.following)],
        ["Streak", `${profile.streak} days`],
        ["Minutes", formatCompactNumber(profile.monthlyMinutes)],
      ]
        .map(([label, value]) => renderMetricCard(label, value))
        .join("")}
    </div>

    <div class="profile-block">
      <div class="section-kicker">
        <span>Favorite songs</span>
        <strong>${favoriteSongs.length} saved</strong>
      </div>
      <div class="mini-list">
        ${favoriteSongs
          .map(
            (song) => `
              <button class="mini-row" data-action="set-song" data-song-id="${song.id}">
                <div class="mini-cover" style="background:${song.albumCover}">
                  <span>${getInitials(song.title)}</span>
                </div>
                <div class="mini-copy">
                  <strong>${escapeHtml(song.title)}</strong>
                  <span>${escapeHtml(song.artist)}</span>
                </div>
              </button>
            `,
          )
          .join("")}
      </div>
    </div>

    <div class="profile-block">
      <div class="section-kicker">
        <span>Favorite artists and genres</span>
        <strong>Taste graph</strong>
      </div>
      <div class="chip-row">
        ${profile.favoriteArtists
          .slice(0, 4)
          .map((item) => `<div class="info-pill">${escapeHtml(item.artist)}</div>`)
          .join("")}
        ${profile.favoriteGenres.map((genre) => `<div class="info-pill">${escapeHtml(genre)}</div>`).join("")}
      </div>
    </div>

    <div class="profile-block">
      <div class="section-kicker">
        <span>Recently played</span>
        <strong>Listening history</strong>
      </div>
      <div class="history-list">
        ${profile.recentlyPlayed
          .map(
            (song) => `
              <button class="history-row" data-action="set-song" data-song-id="${song.id}">
                <strong>${escapeHtml(song.title)}</strong>
                <span>${escapeHtml(song.artist)}</span>
                <small>${song.releaseYear}</small>
              </button>
            `,
          )
          .join("")}
      </div>
    </div>
  `;
}

function renderAdminPanel() {
  const container = document.querySelector("#admin");

  container.innerHTML = `
    <div class="panel-heading">
      <div>
        <div class="eyebrow">Admin panel</div>
        <h3>Moderation, catalog ops, playlists, users, and analytics</h3>
      </div>
      <span class="signal-pill">Ops-ready</span>
    </div>

    <div class="stats-grid admin-summary">
      ${adminInsights.summary.map((item) => renderMetricCard(item.label, item.value)).join("")}
    </div>

    <div class="admin-grid">
      <div class="profile-block">
        <div class="section-kicker">
          <span>Management</span>
          <strong>Core controls</strong>
        </div>
        <div class="chip-row">
          ${adminInsights.management.map((item) => `<div class="info-pill">${escapeHtml(item)}</div>`).join("")}
        </div>
      </div>

      <div class="profile-block">
        <div class="section-kicker">
          <span>Top songs</span>
          <strong>Most active rows</strong>
        </div>
        <div class="history-list">
          ${adminInsights.topSongs
            .map(
              (song) => `
                <button class="history-row" data-action="set-song" data-song-id="${song.id}">
                  <strong>${escapeHtml(song.title)}</strong>
                  <span>${song.country} · ${song.genre}</span>
                  <small>${formatCompactNumber(song.monthlyPlayCount)}</small>
                </button>
              `,
            )
            .join("")}
        </div>
      </div>

      <div class="profile-block">
        <div class="section-kicker">
          <span>Country distribution</span>
          <strong>Market spread</strong>
        </div>
        <div class="history-list">
          ${adminInsights.countryBreakdown
            .map(
              (entry) => `
                <div class="history-row static-row">
                  <strong>${escapeHtml(entry.country)}</strong>
                  <span>Catalog coverage</span>
                  <small>${entry.count}</small>
                </div>
              `,
            )
            .join("")}
        </div>
      </div>
    </div>
  `;
}

function renderArchitecturePanel() {
  const container = document.querySelector("#architecture-grid");

  container.innerHTML = architectureCards
    .map(
      (card) => `
        <article class="architecture-card">
          <div class="eyebrow">Scalable layer</div>
          <h3>${escapeHtml(card.title)}</h3>
          <p>${escapeHtml(card.detail)}</p>
        </article>
      `,
    )
    .join("");
}

function renderBottomDock() {
  const container = document.querySelector("#bottom-dock");
  const song = getCurrentSong();

  container.innerHTML = `
    <div class="dock-cover" style="background:${song.albumCover}">
      <span>${getInitials(song.title)}</span>
    </div>

    <div class="dock-copy">
      <strong>${escapeHtml(song.title)}</strong>
      <span>${escapeHtml(song.artist)} · ${escapeHtml(song.album)}</span>
      <div class="dock-progress">
        <div class="dock-progress-track">
          <div id="dock-progress-fill" class="dock-progress-fill"></div>
        </div>
        <div class="dock-times">
          <span id="dock-current-time">${formatTime(state.progressSeconds)}</span>
          <span id="dock-duration-time">${formatTime(state.durationSeconds || song.durationSeconds)}</span>
        </div>
      </div>
    </div>

    <div class="dock-actions">
      <button class="dock-button" data-action="prev-song">Prev</button>
      <button class="dock-button primary" data-action="toggle-play"><span data-role="play-label">${state.isPlaying ? "Pause" : "Play"}</span></button>
      <button class="dock-button" data-action="next-song">Next</button>
    </div>
  `;
}

function bindEvents() {
  app.addEventListener("click", (event) => {
    const target = event.target.closest("[data-action]");

    if (!target) {
      return;
    }

    void handleAction(target);
  });

  app.addEventListener("input", (event) => {
    const target = event.target;

    if (
      !(
        target instanceof HTMLInputElement ||
        target instanceof HTMLSelectElement ||
        target instanceof HTMLTextAreaElement
      )
    ) {
      return;
    }

    if (target.id === "search-query") {
      state.searchQuery = target.value;
      renderDiscoverPanel();
      return;
    }

    if (target.id === "search-mood") {
      state.searchMood = target.value;
      renderDiscoverPanel();
      return;
    }

    if (target.id === "search-genre") {
      state.searchGenre = target.value;
      renderDiscoverPanel();
      return;
    }

    if (target.id === "search-language") {
      state.searchLanguage = target.value;
      renderDiscoverPanel();
      return;
    }

    if (target.id === "search-country") {
      state.searchCountry = target.value;
      renderDiscoverPanel();
      return;
    }

    if (target.id === "ai-mood") {
      state.aiMood = target.value;
      renderAiPanel();
      return;
    }

    if (target.id === "ai-weather") {
      state.aiWeather = target.value;
      renderAiPanel();
      return;
    }

    if (target.id === "ai-time") {
      state.aiTimeSegment = target.value;
      renderAiPanel();
      return;
    }

    if (target.id === "ai-story") {
      state.aiStory = target.value;
      renderAiPanel();
      return;
    }

    if (target.id === "volume-slider") {
      state.volume = Number(target.value);
      previewEngine.setVolume(state.volume / 100);
      syncPlaybackUI();
      return;
    }

    if (target.id === "progress-slider") {
      state.progressSeconds = Number(target.value);
      syncPlaybackUI();
      previewEngine.seek(state.progressSeconds).catch((error) => {
        console.error("Unable to seek preview", error);
      });
    }
  });
}

async function handleAction(target) {
  const { action } = target.dataset;

  switch (action) {
    case "toggle-play":
      await togglePlayback();
      break;
    case "next-song":
      await stepSong(1);
      break;
    case "prev-song":
      await stepSong(-1);
      break;
    case "toggle-shuffle":
      state.isShuffleOn = !state.isShuffleOn;
      renderHeroPlayer();
      renderLiveQueue();
      renderBottomDock();
      syncPlaybackUI();
      showToast(state.isShuffleOn ? "Shuffle enabled." : "Shuffle disabled.");
      break;
    case "toggle-repeat":
      state.isRepeatOn = !state.isRepeatOn;
      renderHeroPlayer();
      renderBottomDock();
      syncPlaybackUI();
      showToast(state.isRepeatOn ? "Repeat enabled." : "Repeat disabled.");
      break;
    case "toggle-like":
      toggleSetMembership(state.likedSongs, target.dataset.songId || state.currentSongId);
      renderHeroPlayer();
      renderDiscoverPanel();
      showToast("Song like state updated.");
      break;
    case "toggle-favorite":
      toggleSetMembership(state.favoriteSongs, target.dataset.songId || state.currentSongId);
      renderHeroPlayer();
      renderProfilePanel();
      showToast("Favorites updated.");
      break;
    case "toggle-lyrics":
      state.showLyrics = !state.showLyrics;
      renderHeroPlayer();
      syncPlaybackUI();
      break;
    case "set-song":
      await setCurrentSong(target.dataset.songId, { autoplay: true, silent: false });
      break;
    case "select-playlist":
      state.selectedPlaylistId = target.dataset.playlistId;
      renderPlaylistPanel();
      renderLiveQueue();
      showToast("Playlist context updated.");
      break;
    case "set-mood":
      state.searchMood = target.dataset.mood;
      state.aiMood = target.dataset.mood;
      renderDiscoverPanel();
      renderAiPanel();
      showToast(`${state.searchMood} mood activated.`);
      break;
    case "share-whatsapp":
      shareSong("whatsapp");
      break;
    case "share-instagram":
      await shareSong("instagram");
      break;
    case "download-playlist":
      downloadPlaylist();
      break;
    case "fullscreen":
      openFullscreen();
      break;
    case "like-story": {
      const storyId = target.dataset.storyId;
      state.storyLikeDeltas.set(storyId, (state.storyLikeDeltas.get(storyId) || 0) + 1);
      renderStoriesPanel();
      break;
    }
    case "bookmark-story":
      toggleSetMembership(state.storyBookmarkSet, target.dataset.storyId);
      renderStoriesPanel();
      break;
    case "follow-user":
      toggleSetMembership(state.followedUsers, target.dataset.username);
      renderCommunitySpotlight();
      renderStoriesPanel();
      break;
    case "scroll-to":
      document.getElementById(target.dataset.target)?.scrollIntoView({ behavior: "smooth", block: "start" });
      break;
    default:
      break;
  }
}

async function togglePlayback() {
  const song = getCurrentSong();

  try {
    if (state.isPlaying) {
      await previewEngine.pause();
      state.isPlaying = false;
      showToast("Preview paused.");
    } else {
      await previewEngine.play(song);
      state.isPlaying = true;
      state.durationSeconds = song.durationSeconds;
      showToast("Preview playing.");
    }

    renderHeroPlayer();
    renderBottomDock();
    syncPlaybackUI();
  } catch (error) {
    console.error("Playback toggle failed", error);
    showToast("Audio preview could not start on this browser.");
  }
}

async function setCurrentSong(songId, { autoplay = true, silent = false } = {}) {
  if (!songId) {
    return;
  }

  state.currentSongId = songId;
  state.progressSeconds = 0;
  state.durationSeconds = getCurrentSong().durationSeconds;

  renderHeroPlayer();
  renderLiveQueue();
  renderCommunitySpotlight();
  renderTrendingRail();
  renderDiscoverPanel();
  renderPlaylistPanel();
  renderStoriesPanel();
  renderBottomDock();
  syncPlaybackUI();

  if (autoplay) {
    try {
      await previewEngine.play(getCurrentSong());
      state.isPlaying = true;
      renderHeroPlayer();
      renderBottomDock();
      syncPlaybackUI();
    } catch (error) {
      console.error("Unable to auto-play selected song", error);
      showToast("Song selected, but audio preview could not start.");
    }
  }

  if (!silent) {
    showToast(`Now playing ${getCurrentSong().title}.`);
  }
}

async function stepSong(direction) {
  const pool = getPlaybackPool();
  if (!pool.length) {
    return;
  }

  if (state.isShuffleOn) {
    const nextSong = pool[Math.floor(Math.random() * pool.length)];
    await setCurrentSong(nextSong.id, { autoplay: true, silent: true });
    return;
  }

  const currentIndex = pool.findIndex((song) => song.id === state.currentSongId);
  const safeIndex = currentIndex >= 0 ? currentIndex : 0;
  const nextIndex = (safeIndex + direction + pool.length) % pool.length;
  await setCurrentSong(pool[nextIndex].id, { autoplay: true, silent: true });
}

async function handleSongEnded() {
  state.progressSeconds = 0;

  if (state.isRepeatOn) {
    await previewEngine.play(getCurrentSong());
    state.isPlaying = true;
    renderHeroPlayer();
    renderBottomDock();
    syncPlaybackUI();
    return;
  }

  await stepSong(1);
}

function setupMotion() {
  ui.revealObserver?.disconnect();

  ui.revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        }
      });
    },
    { threshold: 0.12 },
  );

  document.querySelectorAll(".reveal").forEach((element) => ui.revealObserver.observe(element));

  window.addEventListener("mousemove", (event) => {
    const x = (event.clientX / window.innerWidth) * 100;
    const y = (event.clientY / window.innerHeight) * 100;
    document.documentElement.style.setProperty("--pointer-x", `${x}%`);
    document.documentElement.style.setProperty("--pointer-y", `${y}%`);
  });
}

function startSpectrumLoop() {
  window.cancelAnimationFrame(ui.spectrumFrame);

  const draw = () => {
    drawSpectrum();
    ui.spectrumFrame = window.requestAnimationFrame(draw);
  };

  ui.spectrumFrame = window.requestAnimationFrame(draw);
}

function drawSpectrum() {
  const canvas = document.querySelector("#spectrum-canvas");
  if (!(canvas instanceof HTMLCanvasElement)) {
    return;
  }

  const context = canvas.getContext("2d");
  if (!context) {
    return;
  }

  const bounds = canvas.getBoundingClientRect();
  if (!bounds.width || !bounds.height) {
    return;
  }

  const dpr = window.devicePixelRatio || 1;
  const width = Math.floor(bounds.width * dpr);
  const height = Math.floor(bounds.height * dpr);

  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }

  context.clearRect(0, 0, width, height);

  const gradient = context.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, "rgba(255,255,255,0.96)");
  gradient.addColorStop(0.36, "rgba(170,124,255,0.92)");
  gradient.addColorStop(1, "rgba(86,214,255,0.18)");

  for (let lineIndex = 1; lineIndex < 5; lineIndex += 1) {
    const y = (height / 5) * lineIndex;
    context.strokeStyle = "rgba(255,255,255,0.06)";
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(width, y);
    context.stroke();
  }

  const liveData = state.isPlaying ? previewEngine.getFrequencyData() : [];
  const barCount = 32;
  const gap = width * 0.012;
  const barWidth = (width - gap * (barCount - 1)) / barCount;
  const now = performance.now() / 1000;

  for (let index = 0; index < barCount; index += 1) {
    const input = liveData.length
      ? (liveData[index % liveData.length] ?? 0) / 255
      : 0.16 + (Math.sin(now * 1.6 + index * 0.42) + 1) * 0.08;
    const heightFactor = Math.max(0.08, input);
    const barHeight = Math.max(height * 0.08, heightFactor * height * 0.92);
    const x = index * (barWidth + gap);
    const y = height - barHeight;

    context.fillStyle = gradient;
    context.fillRect(x, y, barWidth, barHeight);
    context.fillStyle = "rgba(255,255,255,0.05)";
    context.fillRect(x, height - 3 * dpr, barWidth, 3 * dpr);
  }
}

function syncPlaybackUI() {
  const song = getCurrentSong();
  const duration = Math.max(1, Math.round(state.durationSeconds || song.durationSeconds));
  const progress = clamp(state.progressSeconds, 0, duration);
  const progressRatio = duration ? (progress / duration) * 100 : 0;

  document.querySelectorAll('[data-role="play-label"]').forEach((element) => {
    element.textContent = state.isPlaying ? "Pause" : "Play";
  });

  document.querySelectorAll('[data-role="play-state"]').forEach((element) => {
    element.textContent = state.isPlaying ? "Preview live" : "Ready to play";
  });

  const progressSlider = document.querySelector("#progress-slider");
  if (progressSlider instanceof HTMLInputElement) {
    progressSlider.max = String(duration);
    progressSlider.value = String(Math.round(progress));
  }

  const volumeSlider = document.querySelector("#volume-slider");
  if (volumeSlider instanceof HTMLInputElement) {
    volumeSlider.value = String(state.volume);
  }

  setText("#current-time-label", formatTime(progress));
  setText("#duration-time-label", formatTime(duration));
  setText("#dock-current-time", formatTime(progress));
  setText("#dock-duration-time", formatTime(duration));

  const fill = document.querySelector("#dock-progress-fill");
  if (fill instanceof HTMLElement) {
    fill.style.width = `${progressRatio}%`;
  }
}

function getCurrentSong() {
  return getSongById(state.currentSongId);
}

function getSelectedPlaylist() {
  return playlists.find((playlist) => playlist.id === state.selectedPlaylistId) ?? playlists[0];
}

function getPlaybackPool() {
  const playlistSongs = getSelectedPlaylist().songs;
  const pool = dedupeSongs([...playlistSongs, ...featuredSongs]);
  return pool.length ? pool : featuredSongs;
}

function getSearchResults() {
  return searchCatalog({
    query: state.searchQuery,
    mood: state.searchMood,
    genre: state.searchGenre,
    language: state.searchLanguage,
    country: state.searchCountry,
  });
}

function getAiRecommendations() {
  return recommendSongs({
    mood: state.aiMood,
    weather: state.aiWeather,
    timeSegment: state.aiTimeSegment,
    story: state.aiStory,
    favoriteArtists: profile.favoriteArtists.map((item) => item.artist),
    favoriteGenres: profile.favoriteGenres,
  });
}

function getFavoriteSongs() {
  return dedupeSongs([
    ...Array.from(state.favoriteSongs).map((songId) => getSongById(songId)),
    ...profile.favoriteSongs,
  ]).slice(0, 6);
}

function getSpotlightStory(song) {
  return stories.find((story) => story.currentSong.id === song.id) ?? stories.find((story) => story.mood === song.mood) ?? null;
}

function renderSelect(id, label, options, selectedValue) {
  return `
    <label class="field">
      <span>${label}</span>
      <select id="${id}" class="select-input">
        ${options
          .map(
            (option) => `
              <option value="${escapeHtml(option)}" ${option === selectedValue ? "selected" : ""}>${escapeHtml(option)}</option>
            `,
          )
          .join("")}
      </select>
    </label>
  `;
}

function renderMetricCard(label, value) {
  return `
    <div class="metric-card">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(String(value))}</strong>
    </div>
  `;
}

function renderTrendCard(song, rank) {
  const isCurrent = song.id === state.currentSongId;
  return `
    <article class="trend-card ${isCurrent ? "is-active" : ""}">
      <div class="trend-rank">#${rank}</div>
      <div class="trend-cover" style="background:${song.albumCover}">
        <span>${getInitials(song.title)}</span>
      </div>
      <div class="trend-copy">
        <strong>${escapeHtml(song.title)}</strong>
        <span>${escapeHtml(song.artist)}</span>
        <small>${song.mood} · ${formatCompactNumber(song.weeklyPlayCount)} weekly</small>
      </div>
      <button class="table-button" data-action="set-song" data-song-id="${song.id}">Play</button>
    </article>
  `;
}

function renderTag(label, emoji = "") {
  return `
    <span class="tag">
      ${emoji ? `<span>${emoji}</span>` : ""}
      <span>${escapeHtml(label)}</span>
    </span>
  `;
}

function showToast(message) {
  const toast = document.querySelector("#toast");
  if (!(toast instanceof HTMLElement)) {
    return;
  }

  toast.textContent = message;
  toast.classList.add("is-visible");

  window.clearTimeout(ui.toastTimer);
  ui.toastTimer = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 2600);
}

function shareSong(channel) {
  const song = getCurrentSong();
  const shareText = `${song.title} by ${song.artist} on ${brand.name}. Mood: ${song.mood}.`;

  if (channel === "whatsapp") {
    window.open(`https://wa.me/?text=${encodeURIComponent(`${shareText} ${window.location.href}`)}`, "_blank", "noopener,noreferrer");
    return;
  }

  return shareToInstagramFallback(shareText);
}

async function shareToInstagramFallback(shareText) {
  try {
    if (navigator.share) {
      await navigator.share({
        title: `${getCurrentSong().title} · ${brand.name}`,
        text: shareText,
        url: window.location.href,
      });
      return;
    }
  } catch (_error) {
    // Fall back to clipboard when native share is dismissed or unsupported.
  }

  const copied = await copyToClipboard(`${shareText}\n${window.location.href}`);
  showToast(copied ? "Instagram caption copied." : "Copy the song link manually.");
}

function downloadPlaylist() {
  const playlist = getSelectedPlaylist();
  const payload = {
    exportedAt: CURRENT_DATE_LABEL,
    playlist: playlist.name,
    songs: playlist.songs.map((song) => ({
      title: song.title,
      artist: song.artist,
      album: song.album,
      mood: song.mood,
      country: song.country,
      spotifyTrackId: song.spotifyTrackId,
      youtubeVideoId: song.youtubeVideoId,
      appleMusicLink: song.appleMusicLink,
    })),
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${playlist.id}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
  showToast("Playlist export downloaded.");
}

function openFullscreen() {
  if (document.documentElement.requestFullscreen) {
    document.documentElement.requestFullscreen().catch(() => {
      showToast("Fullscreen is not available in this browser.");
    });
    return;
  }

  showToast("Fullscreen is not available in this browser.");
}

async function copyToClipboard(text) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (_error) {
    // Fallback below.
  }

  try {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "true");
    area.style.position = "absolute";
    area.style.left = "-9999px";
    document.body.append(area);
    area.select();
    const copied = document.execCommand("copy");
    area.remove();
    return copied;
  } catch (_error) {
    return false;
  }
}

function toggleSetMembership(set, value) {
  if (set.has(value)) {
    set.delete(value);
    return;
  }

  set.add(value);
}

function dedupeSongs(songs) {
  const seen = new Set();

  return songs.filter((song) => {
    if (!song || seen.has(song.id)) {
      return false;
    }

    seen.add(song.id);
    return true;
  });
}

function getInitials(value) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatCompactNumber(value) {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

function formatTime(value) {
  const total = Math.max(0, Math.floor(value || 0));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function setText(selector, value) {
  const element = document.querySelector(selector);
  if (element instanceof HTMLElement) {
    element.textContent = value;
  }
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
