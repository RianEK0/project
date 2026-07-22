import {
  CURRENT_DATE_LABEL,
  adminInsights,
  architectureCards,
  brand,
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
} from "./data/catalog.js";

const app = document.querySelector("#app");

const state = {
  currentSongId: featuredSongs[0].id,
  isPlaying: true,
  isRepeatOn: true,
  isShuffleOn: false,
  progress: 18,
  volume: 72,
  showLyrics: false,
  selectedPlaylistId: playlists[0].id,
  searchQuery: "",
  searchMood: "All",
  searchGenre: "All",
  searchLanguage: "All",
  searchCountry: "All",
  aiMood: "Midnight",
  aiWeather: "Rainy",
  aiTimeSegment: "Late Night",
  aiStory:
    "I miss the city lights, a person I never fully said goodbye to, and the version of myself that only appears when it rains.",
  likedSongs: new Set([featuredSongs[0].id, featuredSongs[2].id, featuredSongs[3].id]),
  favoriteSongs: new Set([featuredSongs[1].id, featuredSongs[4].id, featuredSongs[5].id]),
  followedUsers: new Set(["midnightletters", "coffeeringnote"]),
  storyLikeDeltas: new Map(),
  storyBookmarkSet: new Set(["story-1", "story-4"]),
};

const moodMeta = Object.fromEntries(moods.map((mood) => [mood.label, mood]));
const genres = ["All", ...getGenres()];
const languages = ["All", ...getLanguages()];
const countries = ["All", ...getCountries()];
const sectionsObserver = { value: null };
let toastTimer = null;
let progressTimer = null;

renderApp();
bindEvents();
startMotion();
syncPlaybackLoop();

function renderApp() {
  app.innerHTML = `
    <div class="ambient-shell">
      <div class="blur-orb blur-orb-a"></div>
      <div class="blur-orb blur-orb-b"></div>
      <div class="blur-orb blur-orb-c"></div>
      <div class="night-grid"></div>
      <div class="rainfall rainfall-back"></div>
      <div class="rainfall rainfall-front"></div>
      <div class="particles">
        ${Array.from({ length: 24 }, (_, index) => {
          const x = (index * 17) % 100;
          const delay = ((index % 7) * 0.8).toFixed(1);
          const duration = (8 + (index % 5) * 2).toFixed(1);
          return `<span class="particle" style="left:${x}%;animation-delay:${delay}s;animation-duration:${duration}s"></span>`;
        }).join("")}
      </div>
    </div>

    <div class="toast" id="toast"></div>

    <div class="app-shell">
      <aside class="sidebar glass reveal">
        <div class="brand-block">
          <div class="brand-mark">N</div>
          <div>
            <div class="eyebrow">Emotion-first music community</div>
            <h1>${brand.name}</h1>
            <p>${brand.headline}</p>
          </div>
        </div>

        <nav class="nav-stack">
          ${[
            ["home", "Home"],
            ["charts", "Trending"],
            ["discover", "Discover"],
            ["community", "Community"],
            ["ai", "AI Recs"],
            ["profile", "Profile"],
            ["admin", "Admin"],
            ["architecture", "Architecture"],
          ]
            .map(
              ([id, label]) => `
                <a href="#${id}" class="nav-link">
                  <span>${label}</span>
                  <span class="nav-link-arrow">↗</span>
                </a>
              `,
            )
            .join("")}
        </nav>

        <div id="mini-player"></div>

        <div class="sidebar-card">
          <div class="card-header-line">
            <span>Library scale</span>
            <strong>1,000+ songs</strong>
          </div>
          <div class="distribution-list">
            ${libraryDistribution
              .map(
                (item) => `
                  <div class="distribution-row">
                    <span>${item.language}</span>
                    <strong>${item.songs}</strong>
                  </div>
                `,
              )
              .join("")}
          </div>
        </div>

        <div class="sidebar-card">
          <div class="card-header-line">
            <span>Live chart sync</span>
            <strong>${CURRENT_DATE_LABEL}</strong>
          </div>
          <p>
            Feed adapters are prepared for Spotify, Billboard, YouTube Music, TikTok, Apple Music, and Indonesia-first trending streams.
          </p>
        </div>
      </aside>

      <main class="main-panel">
        <section class="topbar glass reveal">
          <div>
            <div class="eyebrow">Not a clone. An emotional discovery platform.</div>
            <h2>${brand.subheadline}</h2>
          </div>
          <div class="topbar-actions">
            <button class="primary-button" data-action="scroll-to" data-target="discover">Discover songs</button>
            <button class="ghost-button" data-action="scroll-to" data-target="community">Share a story</button>
          </div>
        </section>

        <section id="home" class="hero-layout reveal">
          <div id="hero-player"></div>
          <div class="hero-side-stack">
            <div class="glass rail-card">
              <div class="section-heading">
                <div>
                  <div class="eyebrow">Global motion</div>
                  <h3>Trending now</h3>
                </div>
                <span class="muted-badge">Live pulse</span>
              </div>
              <div id="trending-rail"></div>
            </div>

            <div class="glass rail-card">
              <div class="section-heading">
                <div>
                  <div class="eyebrow">Search surfaces</div>
                  <h3>Library coverage</h3>
                </div>
                <span class="muted-badge">Scalable</span>
              </div>
              <div class="capability-grid">
                ${[
                  "Songs",
                  "Artists",
                  "Albums",
                  "Lyrics",
                  "Moods",
                  "Genres",
                  "Languages",
                  "Countries",
                ]
                  .map((capability) => `<div class="capability-pill">${capability}</div>`)
                  .join("")}
              </div>
            </div>
          </div>
        </section>

        <section id="charts" class="content-section reveal">
          <div class="section-heading">
            <div>
              <div class="eyebrow">Auto-ranked feeds</div>
              <h3>Latest trending surfaces</h3>
            </div>
            <span class="muted-badge">${chartFeeds.length} feeds</span>
          </div>
          <div id="chart-grid" class="chart-grid"></div>
        </section>

        <section id="discover" class="content-section reveal">
          <div class="section-heading">
            <div>
              <div class="eyebrow">Emotion-led search</div>
              <h3>Discover by song, artist, album, lyrics, mood, language, and country</h3>
            </div>
            <span class="muted-badge">Client indexed</span>
          </div>

          <div class="mood-strip glass" id="mood-strip"></div>

          <div class="discover-grid">
            <div class="glass playlist-panel">
              <div class="section-heading compact">
                <div>
                  <div class="eyebrow">Curated playlists</div>
                  <h3>Playlists people return to</h3>
                </div>
                <span class="muted-badge">24 lists</span>
              </div>
              <div id="playlist-grid" class="playlist-grid"></div>
              <div id="playlist-spotlight"></div>
            </div>

            <div class="glass search-panel">
              <div class="section-heading compact">
                <div>
                  <div class="eyebrow">Search engine</div>
                  <h3>Emotion + metadata discovery</h3>
                </div>
                <span class="muted-badge">Top 18</span>
              </div>

              <label class="search-field">
                <span>Search song, artist, album, lyric, or mood</span>
                <input
                  id="search-query"
                  type="text"
                  placeholder="Try: midnight rain, Jakarta, acoustic healing, low tide..."
                  value="${escapeHtml(state.searchQuery)}"
                />
              </label>

              <div class="filters-grid">
                ${renderSelect("search-mood", "Mood", ["All", ...moods.map((mood) => mood.label)], state.searchMood)}
                ${renderSelect("search-genre", "Genre", genres, state.searchGenre)}
                ${renderSelect("search-language", "Language", languages, state.searchLanguage)}
                ${renderSelect("search-country", "Country", countries, state.searchCountry)}
              </div>

              <div id="search-results"></div>
            </div>
          </div>
        </section>

        <section id="community" class="content-section reveal">
          <div class="section-heading">
            <div>
              <div class="eyebrow">Anonymous stories</div>
              <h3>People connect songs to real life, not just playlists</h3>
            </div>
            <span class="muted-badge">Community layer</span>
          </div>
          <div id="stories-feed" class="stories-feed"></div>
        </section>

        <section id="ai" class="content-section reveal">
          <div class="section-heading">
            <div>
              <div class="eyebrow">AI recommendation studio</div>
              <h3>Recommendations blend mood, weather, time, story context, favorites, and listening history</h3>
            </div>
            <span class="muted-badge">Taste engine</span>
          </div>
          <div class="ai-grid">
            <div class="glass ai-panel">
              <div class="filters-grid">
                ${renderSelect("ai-mood", "Mood", moods.map((mood) => mood.label), state.aiMood)}
                ${renderSelect("ai-weather", "Weather", ["Rainy", "Sunny", "Stormy", "Cloudy"], state.aiWeather)}
                ${renderSelect("ai-time", "Time", ["Late Night", "Sunrise", "Workday", "Golden Hour"], state.aiTimeSegment)}
              </div>

              <label class="search-field">
                <span>Story prompt for the AI recommender</span>
                <textarea id="ai-story" rows="6">${escapeHtml(state.aiStory)}</textarea>
              </label>

              <div class="ai-insights">
                <div class="insight-chip">Favorite artists influence ranking</div>
                <div class="insight-chip">Favorite genres influence ranking</div>
                <div class="insight-chip">Listening history boosts recency-fit tracks</div>
              </div>
            </div>

            <div class="glass ai-panel">
              <div class="section-heading compact">
                <div>
                  <div class="eyebrow">Recommendation output</div>
                  <h3>Your next emotional queue</h3>
                </div>
                <span class="muted-badge">6 picks</span>
              </div>
              <div id="ai-results"></div>
            </div>
          </div>
        </section>

        <section id="profile" class="content-section reveal">
          <div class="section-heading">
            <div>
              <div class="eyebrow">Profile system</div>
              <h3>Favorites, artists, history, achievements, followers, and listening stats</h3>
            </div>
            <span class="muted-badge">${profile.tier}</span>
          </div>
          <div id="profile-panel"></div>
        </section>

        <section id="admin" class="content-section reveal">
          <div class="section-heading">
            <div>
              <div class="eyebrow">Admin panel</div>
              <h3>Catalog management, moderation, analytics, and chart operations</h3>
            </div>
            <span class="muted-badge">Ops-ready</span>
          </div>
          <div id="admin-panel"></div>
        </section>

        <section id="architecture" class="content-section reveal">
          <div class="section-heading">
            <div>
              <div class="eyebrow">System architecture</div>
              <h3>Built to scale beyond 1,000 songs without performance drift</h3>
            </div>
            <span class="muted-badge">Production thinking</span>
          </div>
          <div id="architecture-grid" class="architecture-grid"></div>
        </section>
      </main>
    </div>
  `;

  renderAllSections();
}

function renderAllSections() {
  renderMiniPlayer();
  renderHeroPlayer();
  renderTrendingRail();
  renderCharts();
  renderMoodStrip();
  renderPlaylists();
  renderSearchResults();
  renderStories();
  renderAiResults();
  renderProfile();
  renderAdmin();
  renderArchitecture();
}

function renderMiniPlayer() {
  const song = getCurrentSong();
  const miniPlayer = document.querySelector("#mini-player");

  miniPlayer.innerHTML = `
    <div class="sidebar-card now-playing-card">
      <div class="card-header-line">
        <span>Now playing</span>
        <strong>${state.isPlaying ? "Live" : "Paused"}</strong>
      </div>
      <div class="mini-song">
        <div class="mini-cover" style="background:${song.albumCover}">
          <span>${getInitials(song.title)}</span>
        </div>
        <div class="mini-song-copy">
          <strong>${song.title}</strong>
          <span>${song.artist}</span>
          <small>${song.mood} • ${song.country}</small>
        </div>
      </div>
      <div class="mini-progress">
        <div class="mini-progress-bar" style="width:${state.progress}%"></div>
      </div>
      <div class="mini-controls">
        <button class="icon-button" data-action="prev-song" aria-label="Previous song">‹‹</button>
        <button class="icon-button primary" data-action="toggle-play" aria-label="Play or pause">${state.isPlaying ? "Pause" : "Play"}</button>
        <button class="icon-button" data-action="next-song" aria-label="Next song">››</button>
      </div>
    </div>
  `;
}

function renderHeroPlayer() {
  const song = getCurrentSong();
  const hero = document.querySelector("#hero-player");
  const isLiked = state.likedSongs.has(song.id);
  const isFavorite = state.favoriteSongs.has(song.id);

  hero.innerHTML = `
    <div class="glass hero-player">
      <div class="hero-scene" style="--cover:${song.albumCover}; --accent:${song.coverAccent}; --aura:${song.coverAura}">
        <div class="hero-visual">
          <div class="rain-window"></div>
          <div class="city-bokeh"></div>
          <div class="album-art" style="background:${song.albumCover}">
            <span>${getInitials(song.title)}</span>
          </div>
        </div>

        <div class="hero-copy">
          <div class="eyebrow">Large hero music player</div>
          <h2>${song.title}</h2>
          <p class="hero-subcopy">${song.artist} • ${song.album} • ${song.genre}</p>

          <div class="hero-tags">
            ${renderTag(song.mood)}
            ${renderTag(song.country)}
            ${renderTag(song.language)}
            ${renderTag(`${song.releaseYear}`)}
            ${renderTag(song.lyricsAvailability)}
          </div>

          <p class="hero-summary">${song.aiSummary}</p>

          <div class="hero-stats">
            ${renderMetric("Popularity", `${song.popularityScore}/99`)}
            ${renderMetric("Monthly plays", formatNumber(song.monthlyPlayCount))}
            ${renderMetric("Likes", formatNumber(song.totalLikes))}
            ${renderMetric("Comments", formatNumber(song.totalComments))}
          </div>

          <div class="transport-controls">
            <button class="icon-button" data-action="toggle-shuffle">${state.isShuffleOn ? "Shuffle on" : "Shuffle"}</button>
            <button class="icon-button" data-action="prev-song">Previous</button>
            <button class="hero-play-button" data-action="toggle-play">${state.isPlaying ? "Pause" : "Play"}</button>
            <button class="icon-button" data-action="next-song">Next</button>
            <button class="icon-button" data-action="toggle-repeat">${state.isRepeatOn ? "Repeat on" : "Repeat"}</button>
          </div>

          <div class="slider-row">
            <label>
              <span>Progress</span>
              <input id="progress-slider" type="range" min="0" max="100" value="${state.progress}" />
            </label>
            <label>
              <span>Volume</span>
              <input id="volume-slider" type="range" min="0" max="100" value="${state.volume}" />
            </label>
          </div>

          <div class="utility-row">
            <button class="ghost-button" data-action="toggle-lyrics">${state.showLyrics ? "Hide lyrics" : "Lyrics"}</button>
            <button class="ghost-button" data-action="toggle-like" data-song-id="${song.id}">${isLiked ? "Liked" : "Like"}</button>
            <button class="ghost-button" data-action="toggle-favorite" data-song-id="${song.id}">${isFavorite ? "Saved" : "Favorite"}</button>
            <button class="ghost-button" data-action="share-whatsapp">Share to WhatsApp</button>
            <button class="ghost-button" data-action="share-instagram">Share to Instagram</button>
            <button class="ghost-button" data-action="download-playlist">Download playlist</button>
            <button class="ghost-button" data-action="fullscreen">Fullscreen</button>
          </div>

          ${
            state.showLyrics
              ? `
                <div class="lyrics-panel">
                  <div class="section-heading compact">
                    <div>
                      <div class="eyebrow">Lyrics preview</div>
                      <h3>${song.lyricsAvailability}</h3>
                    </div>
                  </div>
                  <pre>${song.lyricsExcerpt}</pre>
                </div>
              `
              : ""
          }
        </div>

        <div class="hero-sidebar">
          <div class="glass floating-panel">
            <div class="section-heading compact">
              <div>
                <div class="eyebrow">Versions</div>
                <h3>Playback paths</h3>
              </div>
            </div>
            <a href="${song.musicVideo}" target="_blank" rel="noreferrer">Music video</a>
            <div>${song.acousticVersion}</div>
            <div>${song.liveVersion}</div>
            <div>${song.karaokeVersion}</div>
          </div>

          <div class="glass floating-panel">
            <div class="section-heading compact">
              <div>
                <div class="eyebrow">Platform IDs</div>
                <h3>Distribution-ready</h3>
              </div>
            </div>
            <div class="tech-row"><span>YouTube</span><strong>${song.youtubeVideoId}</strong></div>
            <div class="tech-row"><span>Spotify</span><strong>${song.spotifyTrackId}</strong></div>
            <div class="tech-row"><span>Apple Music</span><strong>Linked</strong></div>
          </div>

          <div class="glass floating-panel">
            <div class="section-heading compact">
              <div>
                <div class="eyebrow">Motion</div>
                <h3>Now playing</h3>
              </div>
            </div>
            <div class="equalizer ${state.isPlaying ? "is-active" : ""}">
              ${Array.from({ length: 9 }, () => '<span></span>').join("")}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderTrendingRail() {
  const container = document.querySelector("#trending-rail");
  container.innerHTML = trendingRail
    .slice(0, 6)
    .map(
      (song, index) => `
        <button class="rail-song" data-action="set-song" data-song-id="${song.id}">
          <div class="rail-rank">#${index + 1}</div>
          <div class="rail-cover" style="background:${song.albumCover}">
            <span>${getInitials(song.title)}</span>
          </div>
          <div class="rail-copy">
            <strong>${song.title}</strong>
            <span>${song.artist}</span>
            <small>${song.mood} • ${formatNumber(song.weeklyPlayCount)} weekly</small>
          </div>
        </button>
      `,
    )
    .join("");
}

function renderCharts() {
  const chartGrid = document.querySelector("#chart-grid");

  chartGrid.innerHTML = chartFeeds
    .map(
      (feed) => `
        <article class="glass chart-card">
          <div class="card-header-line">
            <div>
              <div class="eyebrow">${feed.updatedAt}</div>
              <h3>${feed.name}</h3>
            </div>
            <span class="muted-badge">${feed.items.length} songs</span>
          </div>
          <div class="chart-list">
            ${feed.items
              .map(
                (entry) => `
                  <button class="chart-row" data-action="set-song" data-song-id="${entry.song.id}">
                    <div class="chart-rank">${entry.rank}</div>
                    <div class="chart-copy">
                      <strong>${entry.song.title}</strong>
                      <span>${entry.song.artist}</span>
                    </div>
                    <div class="chart-meta">
                      <small>${entry.song.country}</small>
                      <span class="movement movement-${entry.movement}">${entry.movement}</span>
                    </div>
                  </button>
                `,
              )
              .join("")}
          </div>
        </article>
      `,
    )
    .join("");
}

function renderMoodStrip() {
  const strip = document.querySelector("#mood-strip");

  strip.innerHTML = moods
    .map((mood) => {
      const isActive = state.searchMood === mood.label;
      return `
        <button class="mood-chip ${isActive ? "is-active" : ""}" data-action="set-mood" data-mood="${mood.label}">
          <span>${mood.emoji}</span>
          <strong>${mood.label}</strong>
          <small>${mood.aura}</small>
        </button>
      `;
    })
    .join("");
}

function renderPlaylists() {
  const playlistGrid = document.querySelector("#playlist-grid");
  const spotlight = document.querySelector("#playlist-spotlight");
  const selectedPlaylist = getSelectedPlaylist();

  playlistGrid.innerHTML = playlists
    .slice(0, 12)
    .map(
      (playlist) => `
        <button
          class="playlist-card ${selectedPlaylist.id === playlist.id ? "is-active" : ""}"
          data-action="select-playlist"
          data-playlist-id="${playlist.id}"
          style="background:${playlist.accent}"
        >
          <strong>${playlist.name}</strong>
          <span>${playlist.description}</span>
          <small>${playlist.songCount} songs</small>
        </button>
      `,
    )
    .join("");

  spotlight.innerHTML = `
    <div class="playlist-spotlight">
      <div class="section-heading compact">
        <div>
          <div class="eyebrow">Selected playlist</div>
          <h3>${selectedPlaylist.name}</h3>
        </div>
        <span class="muted-badge">${selectedPlaylist.songCount} songs</span>
      </div>
      <p>${selectedPlaylist.description}</p>
      <div class="playlist-song-list">
        ${selectedPlaylist.songs
          .map(
            (song) => `
              <button class="playlist-song" data-action="set-song" data-song-id="${song.id}">
                <div class="playlist-song-cover" style="background:${song.albumCover}">
                  <span>${getInitials(song.title)}</span>
                </div>
                <div class="playlist-song-copy">
                  <strong>${song.title}</strong>
                  <span>${song.artist}</span>
                </div>
                <small>${song.mood}</small>
              </button>
            `,
          )
          .join("")}
      </div>
    </div>
  `;
}

function renderSearchResults() {
  const container = document.querySelector("#search-results");
  const results = getSearchResults();

  container.innerHTML = `
    <div class="result-meta">
      <strong>${results.length}</strong>
      <span>emotion-ranked results</span>
    </div>
    <div class="results-grid">
      ${results
        .map(
          (song) => `
            <article class="song-card">
              <button class="song-card-cover" data-action="set-song" data-song-id="${song.id}" style="background:${song.albumCover}">
                <span>${getInitials(song.title)}</span>
              </button>
              <div class="song-card-copy">
                <strong>${song.title}</strong>
                <span>${song.artist}</span>
                <small>${song.album}</small>
              </div>
              <div class="song-card-tags">
                ${renderTag(song.genre)}
                ${renderTag(song.mood)}
              </div>
              <div class="song-card-meta">
                <small>${song.language} • ${song.country}</small>
                <button class="ghost-button compact" data-action="toggle-like" data-song-id="${song.id}">
                  ${state.likedSongs.has(song.id) ? "Liked" : "Like"}
                </button>
              </div>
            </article>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderStories() {
  const feed = document.querySelector("#stories-feed");

  feed.innerHTML = stories
    .map((story) => {
      const likes = story.likes + (state.storyLikeDeltas.get(story.id) || 0);
      const isBookmarked = state.storyBookmarkSet.has(story.id);
      const isFollowing = state.followedUsers.has(story.username);

      return `
        <article class="glass story-card">
          <div class="story-header">
            <div class="story-avatar" style="background:${story.avatar.albumCover}">
              <span>${getInitials(story.username)}</span>
            </div>
            <div>
              <strong>${story.username}</strong>
              <div class="story-meta">${story.mood} • ${story.currentSong.title}</div>
            </div>
            <button class="ghost-button compact" data-action="follow-user" data-username="${story.username}">
              ${isFollowing ? "Following" : "Follow"}
            </button>
          </div>
          <p>${story.story}</p>
          <button class="story-song" data-action="set-song" data-song-id="${story.currentSong.id}">
            <span>Current song</span>
            <strong>${story.currentSong.title} — ${story.currentSong.artist}</strong>
          </button>
          <div class="story-actions">
            <button class="ghost-button compact" data-action="like-story" data-story-id="${story.id}">Like ${likes}</button>
            <button class="ghost-button compact">Comment ${story.comments}</button>
            <button class="ghost-button compact">Share ${story.shares}</button>
            <button class="ghost-button compact" data-action="bookmark-story" data-story-id="${story.id}">
              ${isBookmarked ? "Bookmarked" : "Bookmark"}
            </button>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderAiResults() {
  const results = recommendSongs({
    mood: state.aiMood,
    weather: state.aiWeather,
    timeSegment: state.aiTimeSegment,
    story: state.aiStory,
    favoriteArtists: profile.favoriteArtists.map((item) => item.artist),
    favoriteGenres: profile.favoriteGenres,
  });

  const container = document.querySelector("#ai-results");

  container.innerHTML = `
    <div class="ai-summary-card">
      <strong>${state.aiMood} • ${state.aiWeather} • ${state.aiTimeSegment}</strong>
      <span>The recommender is blending story keywords, saved taste, weather, and listening history signals.</span>
    </div>
    <div class="playlist-song-list">
      ${results
        .map(
          (song) => `
            <button class="playlist-song" data-action="set-song" data-song-id="${song.id}">
              <div class="playlist-song-cover" style="background:${song.albumCover}">
                <span>${getInitials(song.title)}</span>
              </div>
              <div class="playlist-song-copy">
                <strong>${song.title}</strong>
                <span>${song.artist}</span>
              </div>
              <small>${song.genre}</small>
            </button>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderProfile() {
  const panel = document.querySelector("#profile-panel");

  panel.innerHTML = `
    <div class="profile-grid">
      <article class="glass profile-identity">
        <div class="profile-head">
          <div class="profile-avatar">AR</div>
          <div>
            <div class="eyebrow">${profile.location}</div>
            <h3>${profile.name}</h3>
            <p>${profile.handle} • ${profile.tier}</p>
          </div>
        </div>
        <div class="hero-stats">
          ${renderMetric("Followers", formatNumber(profile.followers))}
          ${renderMetric("Following", formatNumber(profile.following))}
          ${renderMetric("Listening streak", `${profile.streak} days`)}
          ${renderMetric("Monthly minutes", formatNumber(profile.monthlyMinutes))}
        </div>
        <div class="achievement-list">
          ${profile.achievements
            .map(
              (achievement) => `
                <div class="achievement-card">
                  <strong>${achievement.title}</strong>
                  <span>${achievement.detail}</span>
                  <small>${achievement.progress}</small>
                </div>
              `,
            )
            .join("")}
        </div>
      </article>

      <article class="glass profile-column">
        <div class="section-heading compact">
          <div>
            <div class="eyebrow">Favorites</div>
            <h3>Songs and artists</h3>
          </div>
        </div>
        <div class="playlist-song-list compact-list">
          ${profile.favoriteSongs
            .map(
              (song) => `
                <button class="playlist-song" data-action="set-song" data-song-id="${song.id}">
                  <div class="playlist-song-cover" style="background:${song.albumCover}">
                    <span>${getInitials(song.title)}</span>
                  </div>
                  <div class="playlist-song-copy">
                    <strong>${song.title}</strong>
                    <span>${song.artist}</span>
                  </div>
                  <small>${song.mood}</small>
                </button>
              `,
            )
            .join("")}
        </div>
        <div class="info-chip-row">
          ${profile.favoriteGenres.map((genre) => `<div class="capability-pill">${genre}</div>`).join("")}
        </div>
      </article>

      <article class="glass profile-column">
        <div class="section-heading compact">
          <div>
            <div class="eyebrow">History</div>
            <h3>Recently played</h3>
          </div>
        </div>
        <div class="history-list">
          ${profile.recentlyPlayed
            .map(
              (song) => `
                <button class="history-row" data-action="set-song" data-song-id="${song.id}">
                  <strong>${song.title}</strong>
                  <span>${song.artist}</span>
                  <small>${song.releaseYear}</small>
                </button>
              `,
            )
            .join("")}
        </div>
      </article>

      <article class="glass profile-column">
        <div class="section-heading compact">
          <div>
            <div class="eyebrow">Statistics</div>
            <h3>Listening patterns</h3>
          </div>
        </div>
        <div class="profile-stats-list">
          ${profile.statistics
            .map(
              (item) => `
                <div class="tech-row">
                  <span>${item.label}</span>
                  <strong>${item.value}</strong>
                </div>
              `,
            )
            .join("")}
        </div>
      </article>
    </div>
  `;
}

function renderAdmin() {
  const panel = document.querySelector("#admin-panel");

  panel.innerHTML = `
    <div class="admin-grid">
      <article class="glass admin-overview">
        <div class="section-heading compact">
          <div>
            <div class="eyebrow">Dashboard analytics</div>
            <h3>Catalog overview</h3>
          </div>
        </div>
        <div class="summary-grid">
          ${adminInsights.summary
            .map(
              (item) => `
                <div class="summary-card">
                  <span>${item.label}</span>
                  <strong>${item.value}</strong>
                </div>
              `,
            )
            .join("")}
        </div>
        <div class="summary-grid secondary">
          ${adminInsights.analytics
            .map(
              (item) => `
                <div class="summary-card">
                  <span>${item.label}</span>
                  <strong>${item.value}</strong>
                </div>
              `,
            )
            .join("")}
        </div>
      </article>

      <article class="glass admin-column">
        <div class="section-heading compact">
          <div>
            <div class="eyebrow">Management</div>
            <h3>Operational controls</h3>
          </div>
        </div>
        <div class="capability-grid">
          ${adminInsights.management.map((item) => `<div class="capability-pill">${item}</div>`).join("")}
        </div>
      </article>

      <article class="glass admin-column">
        <div class="section-heading compact">
          <div>
            <div class="eyebrow">Top songs</div>
            <h3>High-signal rows</h3>
          </div>
        </div>
        <div class="history-list">
          ${adminInsights.topSongs
            .map(
              (song) => `
                <button class="history-row" data-action="set-song" data-song-id="${song.id}">
                  <strong>${song.title}</strong>
                  <span>${song.country} • ${song.genre}</span>
                  <small>${formatNumber(song.monthlyPlayCount)}</small>
                </button>
              `,
            )
            .join("")}
        </div>
      </article>

      <article class="glass admin-column">
        <div class="section-heading compact">
          <div>
            <div class="eyebrow">Market spread</div>
            <h3>Country distribution</h3>
          </div>
        </div>
        <div class="history-list">
          ${adminInsights.countryBreakdown
            .map(
              (entry) => `
                <div class="tech-row">
                  <span>${entry.country}</span>
                  <strong>${entry.count}</strong>
                </div>
              `,
            )
            .join("")}
        </div>
      </article>
    </div>
  `;
}

function renderArchitecture() {
  const grid = document.querySelector("#architecture-grid");

  grid.innerHTML = architectureCards
    .map(
      (card) => `
        <article class="glass architecture-card">
          <div class="eyebrow">Scalable layer</div>
          <h3>${card.title}</h3>
          <p>${card.detail}</p>
        </article>
      `,
    )
    .join("");
}

function bindEvents() {
  app.addEventListener("click", handleClick);

  app.addEventListener("input", (event) => {
    const target = event.target;

    if (!(target instanceof HTMLElement)) return;

    if (target.id === "search-query") {
      state.searchQuery = target.value;
      renderSearchResults();
    }

    if (target.id === "search-mood") {
      state.searchMood = target.value;
      renderMoodStrip();
      renderSearchResults();
    }

    if (target.id === "search-genre") {
      state.searchGenre = target.value;
      renderSearchResults();
    }

    if (target.id === "search-language") {
      state.searchLanguage = target.value;
      renderSearchResults();
    }

    if (target.id === "search-country") {
      state.searchCountry = target.value;
      renderSearchResults();
    }

    if (target.id === "ai-mood") {
      state.aiMood = target.value;
      renderAiResults();
    }

    if (target.id === "ai-weather") {
      state.aiWeather = target.value;
      renderAiResults();
    }

    if (target.id === "ai-time") {
      state.aiTimeSegment = target.value;
      renderAiResults();
    }

    if (target.id === "ai-story") {
      state.aiStory = target.value;
      renderAiResults();
    }

    if (target.id === "progress-slider") {
      state.progress = Number(target.value);
      renderMiniPlayer();
      renderHeroPlayer();
    }

    if (target.id === "volume-slider") {
      state.volume = Number(target.value);
      renderHeroPlayer();
    }
  });
}

function handleClick(event) {
  const actionTarget = event.target.closest("[data-action]");

  if (!actionTarget) return;

  const { action } = actionTarget.dataset;

  switch (action) {
    case "toggle-play":
      state.isPlaying = !state.isPlaying;
      syncPlaybackLoop();
      renderMiniPlayer();
      renderHeroPlayer();
      showToast(state.isPlaying ? "Playback resumed" : "Playback paused");
      break;
    case "next-song":
      stepSong(1);
      break;
    case "prev-song":
      stepSong(-1);
      break;
    case "toggle-shuffle":
      state.isShuffleOn = !state.isShuffleOn;
      renderHeroPlayer();
      showToast(state.isShuffleOn ? "Shuffle enabled" : "Shuffle disabled");
      break;
    case "toggle-repeat":
      state.isRepeatOn = !state.isRepeatOn;
      renderHeroPlayer();
      showToast(state.isRepeatOn ? "Repeat enabled" : "Repeat disabled");
      break;
    case "toggle-like":
      toggleSetMembership(state.likedSongs, actionTarget.dataset.songId || state.currentSongId);
      renderHeroPlayer();
      renderSearchResults();
      showToast("Song like status updated");
      break;
    case "toggle-favorite":
      toggleSetMembership(state.favoriteSongs, actionTarget.dataset.songId || state.currentSongId);
      renderHeroPlayer();
      showToast("Favorite library updated");
      break;
    case "toggle-lyrics":
      state.showLyrics = !state.showLyrics;
      renderHeroPlayer();
      break;
    case "set-song":
      setCurrentSong(actionTarget.dataset.songId);
      break;
    case "share-whatsapp":
      shareSong("whatsapp");
      break;
    case "share-instagram":
      shareSong("instagram");
      break;
    case "download-playlist":
      downloadPlaylist();
      break;
    case "fullscreen":
      openFullscreen();
      break;
    case "select-playlist":
      state.selectedPlaylistId = actionTarget.dataset.playlistId;
      renderPlaylists();
      break;
    case "set-mood":
      state.searchMood = actionTarget.dataset.mood;
      state.aiMood = actionTarget.dataset.mood;
      renderMoodStrip();
      syncSelectValue("search-mood", state.searchMood);
      syncSelectValue("ai-mood", state.aiMood);
      renderSearchResults();
      renderAiResults();
      showToast(`${state.searchMood} mood activated`);
      break;
    case "like-story": {
      const storyId = actionTarget.dataset.storyId;
      state.storyLikeDeltas.set(storyId, (state.storyLikeDeltas.get(storyId) || 0) + 1);
      renderStories();
      break;
    }
    case "bookmark-story":
      toggleSetMembership(state.storyBookmarkSet, actionTarget.dataset.storyId);
      renderStories();
      break;
    case "follow-user":
      toggleSetMembership(state.followedUsers, actionTarget.dataset.username);
      renderStories();
      break;
    case "scroll-to":
      document.getElementById(actionTarget.dataset.target)?.scrollIntoView({ behavior: "smooth", block: "start" });
      break;
    default:
      break;
  }
}

function startMotion() {
  sectionsObserver.value = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        }
      });
    },
    { threshold: 0.15 },
  );

  document.querySelectorAll(".reveal").forEach((section) => sectionsObserver.value.observe(section));

  window.addEventListener("mousemove", (event) => {
    const x = (event.clientX / window.innerWidth) * 100;
    const y = (event.clientY / window.innerHeight) * 100;
    document.documentElement.style.setProperty("--pointer-x", `${x}%`);
    document.documentElement.style.setProperty("--pointer-y", `${y}%`);
  });
}

function syncPlaybackLoop() {
  window.clearInterval(progressTimer);

  if (!state.isPlaying) {
    return;
  }

  progressTimer = window.setInterval(() => {
    const song = getCurrentSong();
    const increment = 100 / Math.max(song.durationSeconds / 1.8, 1);
    state.progress = Math.min(100, state.progress + increment);

    if (state.progress >= 100) {
      if (state.isRepeatOn) {
        state.progress = 0;
      } else {
        stepSong(1, true);
        return;
      }
    }

    renderMiniPlayer();
    renderHeroPlayer();
  }, 1000);
}

function stepSong(direction, silent = false) {
  const pool = state.isShuffleOn ? trendingRail : featuredSongs;
  const currentIndex = pool.findIndex((song) => song.id === state.currentSongId);
  const nextIndex = state.isShuffleOn
    ? Math.floor(Math.random() * pool.length)
    : (currentIndex + direction + pool.length) % pool.length;

  state.currentSongId = pool[nextIndex].id;
  state.progress = 0;
  renderMiniPlayer();
  renderHeroPlayer();

  if (!silent) {
    showToast(`Queued ${pool[nextIndex].title}`);
  }
}

function setCurrentSong(songId) {
  state.currentSongId = songId;
  state.progress = 0;
  renderMiniPlayer();
  renderHeroPlayer();
  showToast(`Now focused on ${getCurrentSong().title}`);
}

function shareSong(channel) {
  const song = getCurrentSong();
  const text = `${song.title} by ${song.artist} on ${brand.name} — mood: ${song.mood}`;

  if (channel === "whatsapp") {
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
    return;
  }

  if (navigator.share) {
    navigator
      .share({
        title: `${song.title} — ${brand.name}`,
        text,
        url: window.location.href,
      })
      .catch(() => {
        copyToClipboard(`${text}\n${window.location.href}`);
      });
    return;
  }

  copyToClipboard(`${text}\n${window.location.href}`);
  showToast("Instagram story caption copied");
}

function downloadPlaylist() {
  const payload = {
    exportedAt: CURRENT_DATE_LABEL,
    playlist: getSelectedPlaylist().name,
    songs: getSelectedPlaylist().songs.map((song) => ({
      title: song.title,
      artist: song.artist,
      album: song.album,
      mood: song.mood,
      country: song.country,
      spotifyTrackId: song.spotifyTrackId,
      youtubeVideoId: song.youtubeVideoId,
    })),
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${getSelectedPlaylist().id}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
  showToast("Playlist export downloaded");
}

function openFullscreen() {
  document.documentElement.requestFullscreen?.();
}

function getCurrentSong() {
  return getSongById(state.currentSongId);
}

function getSelectedPlaylist() {
  return playlists.find((playlist) => playlist.id === state.selectedPlaylistId) ?? playlists[0];
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

function toggleSetMembership(set, value) {
  if (set.has(value)) {
    set.delete(value);
  } else {
    set.add(value);
  }
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-US", {
    notation: value >= 1000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(value);
}

function getInitials(value) {
  return value
    .split(/[\s-]+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function renderMetric(label, value) {
  return `
    <div class="metric-card">
      <span>${label}</span>
      <strong>${value}</strong>
    </div>
  `;
}

function renderTag(value) {
  return `<span class="tag">${value}</span>`;
}

function renderSelect(id, label, options, selected) {
  return `
    <label class="select-field">
      <span>${label}</span>
      <select id="${id}">
        ${options.map((option) => `<option value="${option}" ${option === selected ? "selected" : ""}>${option}</option>`).join("")}
      </select>
    </label>
  `;
}

function copyToClipboard(value) {
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(value).finally(() => {
      showToast("Share text copied");
    });
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "true");
  textarea.style.position = "absolute";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
  showToast("Share text copied");
}

function syncSelectValue(id, value) {
  const select = document.getElementById(id);
  if (select) select.value = value;
}

function showToast(message) {
  const toast = document.querySelector("#toast");
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 2200);
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
