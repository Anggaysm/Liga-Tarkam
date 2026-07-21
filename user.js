// ============================================
// USER.JS - PUBLIC VIEW (DEBUG VERSION)
// ============================================

console.log("👀 user.js loaded!");
console.log("📍 Current URL:", window.location.href);

// ============================================
// STATE
// ============================================
let groups = [];
let currentGroupIndex = 0;
let groupTeams = {};
let groupMatches = {};
let groupCurrentRound = {};
let groupCurrentMatch = {};
let groupTeamStats = {};
let groupMatchResults = {};
let isListenerActive = false;

// ============================================
// DOM REFS
// ============================================
const groupTabs = document.getElementById("groupTabs");
const standingsBody = document.querySelector("#standingsTable tbody");
const fixtureArea = document.getElementById("fixtureArea");
const fixtureCount = document.getElementById("fixtureCount");
const totalMatches = document.getElementById("totalMatches");
const totalGoals = document.getElementById("totalGoals");
const avgGoals = document.getElementById("avgGoals");
const topScorer = document.getElementById("topScorer");
const statusDot = document.getElementById("statusDot");
const statusText = document.getElementById("statusText");
const standingInfo = document.getElementById("standingInfo");

// ============================================
// CEK KONEKSI FIREBASE
// ============================================
function checkFirebase() {
  console.log("🔍 Checking Firebase...");

  // Cek firebase
  if (typeof firebase === "undefined") {
    console.error("❌ firebase is undefined!");
    return false;
  }
  console.log("✅ firebase loaded");

  // Cek firebaseConfig
  if (typeof firebaseConfig === "undefined") {
    console.error("❌ firebaseConfig is undefined!");
    return false;
  }
  console.log("✅ firebaseConfig loaded:", firebaseConfig);

  // Cek db
  if (typeof db === "undefined") {
    console.error("❌ db is undefined!");
    return false;
  }
  console.log("✅ db loaded");

  // Cek auth
  if (typeof auth === "undefined") {
    console.error("❌ auth is undefined!");
    return false;
  }
  console.log("✅ auth loaded");

  return true;
}

// ============================================
// LOAD DATA WITH REAL-TIME LISTENER
// ============================================
function loadData() {
  console.log("📥 Loading user data...");

  // Cek Firebase dulu
  if (!checkFirebase()) {
    console.error("❌ Firebase not ready!");
    if (statusDot) statusDot.className = "online-dot offline";
    if (statusText) statusText.textContent = "⚠️ Firebase Error";
    showToast("⚠️ Firebase tidak terhubung!", "error");
    return;
  }

  // Set status loading
  if (statusDot) statusDot.className = "online-dot online";
  if (statusText) statusText.textContent = "🔄 Loading...";

  // === REAL-TIME LISTENER ===
  console.log("📡 Setting up real-time listener...");
  console.log("📁 Path: groups/data");

  try {
    const unsubscribe = db
      .collection("groups")
      .doc("data")
      .onSnapshot(
        (doc) => {
          console.log("🔄 REAL-TIME UPDATE RECEIVED!");
          console.log("📄 Doc exists:", doc.exists);

          if (doc.exists) {
            const data = doc.data();
            console.log("📊 Data:", data);
            console.log("📋 Groups:", data.groups);
            console.log("📋 GroupTeams:", data.groupTeams);

            // Update semua state
            groups = data.groups || [];
            groupTeams = data.groupTeams || {};
            groupMatches = data.groupMatches || {};
            groupCurrentRound = data.groupCurrentRound || {};
            groupCurrentMatch = data.groupCurrentMatch || {};
            groupTeamStats = data.groupTeamStats || {};
            groupMatchResults = data.groupMatchResults || {};
            currentGroupIndex = data.currentGroupIndex || 0;

            // Update UI
            updateAll();

            // Update status
            if (statusDot) statusDot.className = "online-dot online";
            if (statusText) statusText.textContent = "✅ Online";

            console.log("✅ UI Updated! Groups:", groups.length);
          } else {
            console.warn("⚠️ Document does not exist!");
            if (statusDot) statusDot.className = "online-dot online";
            if (statusText) statusText.textContent = "⏳ Belum ada data";
            updateAll();
          }
        },
        (error) => {
          console.error("❌ LISTENER ERROR:", error);
          console.error("❌ Error code:", error.code);
          console.error("❌ Error message:", error.message);

          if (statusDot) statusDot.className = "online-dot offline";
          if (statusText) statusText.textContent = "⚠️ Offline";
          showToast("⚠️ Gagal terhubung ke server: " + error.message, "error");
        },
      );

    isListenerActive = true;
    console.log("✅ Listener active!");
  } catch (error) {
    console.error("❌ Error setting up listener:", error);
    if (statusDot) statusDot.className = "online-dot offline";
    if (statusText) statusText.textContent = "⚠️ Error";
    showToast("⚠️ Error: " + error.message, "error");
  }
}

// ============================================
// SWITCH GROUP
// ============================================
function switchGroup(index) {
  if (index < 0 || index >= groups.length) return;
  currentGroupIndex = index;
  updateAll();
  console.log("📋 Switched to group:", getCurrentGroupName());
}

function getCurrentGroupName() {
  return groups[currentGroupIndex] || null;
}

// ============================================
// UPDATE ALL UI
// ============================================
function updateAll() {
  console.log("🔄 Updating all UI...");
  updateGroupTabs();
  updateStandings();
  updateFixture();
  updateStats();
}

// ============================================
// UPDATE GROUP TABS
// ============================================
function updateGroupTabs() {
  if (!groupTabs) return;

  if (groups.length === 0) {
    groupTabs.innerHTML =
      '<span class="text-muted" style="padding:8px 0;">Belum ada grup</span>';
    return;
  }

  let html = "";
  groups.forEach((name, index) => {
    const isActive = index === currentGroupIndex;
    const teamCount = groupTeams[name]?.length || 0;
    html += `
            <div class="group-tab ${isActive ? "active" : ""}" onclick="switchGroup(${index})">
                <span>${name}</span>
                <span class="tab-badge">${teamCount} tim</span>
            </div>
        `;
  });
  groupTabs.innerHTML = html;
}

// ============================================
// UPDATE STANDINGS
// ============================================
function updateStandings() {
  if (!standingsBody) return;
  standingsBody.innerHTML = "";

  const groupName = getCurrentGroupName();
  if (!groupName) {
    if (standingInfo) standingInfo.textContent = "Pilih grup terlebih dahulu";
    standingsBody.innerHTML =
      '<tr><td colspan="10" style="text-align:center;padding:20px;color:var(--text-muted);">Pilih grup terlebih dahulu</td></tr>';
    return;
  }

  const teamNames = groupTeams[groupName] || [];
  if (teamNames.length === 0) {
    if (standingInfo) standingInfo.textContent = "Belum ada tim di grup ini";
    standingsBody.innerHTML =
      '<tr><td colspan="10" style="text-align:center;padding:20px;color:var(--text-muted);">Belum ada tim di grup ini</td></tr>';
    return;
  }

  // Get stats dari Firebase
  const stats = groupTeamStats[groupName] || {};
  const teams = teamNames.map((name) => ({
    name,
    ...(stats[name] || {
      played: 0,
      win: 0,
      draw: 0,
      loss: 0,
      gf: 0,
      ga: 0,
      points: 0,
    }),
  }));

  // Sortir klasemen
  const sorted = [...teams];
  sorted.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const gdA = a.gf - a.ga;
    const gdB = b.gf - b.ga;
    if (gdB !== gdA) return gdB - gdA;
    return b.gf - a.gf;
  });

  // Render tabel
  sorted.forEach((team, index) => {
    const gd = team.gf - team.ga;
    const row = document.createElement("tr");
    row.innerHTML = `
            <td>${index + 1}</td>
            <td><strong>${team.name}</strong></td>
            <td>${team.played}</td>
            <td>${team.win}</td>
            <td>${team.draw}</td>
            <td>${team.loss}</td>
            <td>${team.gf}</td>
            <td>${team.ga}</td>
            <td>${gd > 0 ? "+" : ""}${gd}</td>
            <td><strong>${team.points}</strong></td>
        `;
    standingsBody.appendChild(row);
  });

  // Update info
  const totalMatchesPlayed = teams.reduce((sum, t) => sum + t.played, 0) / 2;
  if (standingInfo) {
    standingInfo.textContent = `${teamNames.length} tim | ${totalMatchesPlayed} pertandingan dimainkan`;
  }
}

// ============================================
// UPDATE FIXTURE / JADWAL
// ============================================
function updateFixture() {
  if (!fixtureArea) return;

  const groupName = getCurrentGroupName();
  if (
    !groupName ||
    !groupTeams[groupName] ||
    groupTeams[groupName].length === 0
  ) {
    fixtureArea.innerHTML = `
            <div class="empty-state">
                <span class="empty-icon">📅</span>
                <h3>Belum ada jadwal</h3>
                <p>Pilih grup yang sudah digenerate</p>
            </div>
        `;
    if (fixtureCount) fixtureCount.textContent = "0 match";
    return;
  }

  const matches = groupMatches[groupName] || [];
  if (matches.length === 0) {
    fixtureArea.innerHTML = `
            <div class="empty-state">
                <span class="empty-icon">📅</span>
                <h3>Belum ada jadwal</h3>
                <p>Admin belum mengenerate liga</p>
            </div>
        `;
    if (fixtureCount) fixtureCount.textContent = "0 match";
    return;
  }

  const teamNames = groupTeams[groupName] || [];
  const currentRound = groupCurrentRound[groupName] || 0;
  const currentMatch = groupCurrentMatch[groupName] || 0;
  const results = groupMatchResults[groupName] || [];

  let html = '<div class="fixture-list">';
  let playedCount = 0;
  let totalCount = 0;

  matches.forEach((round, roundIdx) => {
    const isPastRound = roundIdx < currentRound;
    const isCurrentRound = roundIdx === currentRound;

    html += `<div class="fixture-round">`;
    html += `
            <div class="fixture-round-title">
                <span>${isPastRound ? "✅" : isCurrentRound ? "▶️" : "📅"} Putaran ${roundIdx + 1}</span>
                <span>${round.length} match</span>
            </div>
        `;

    round.forEach((match, matchIdx) => {
      const teamA = teamNames[match.home];
      const teamB = teamNames[match.away];

      const isPlayed =
        roundIdx < currentRound ||
        (roundIdx === currentRound && matchIdx < currentMatch);
      const isCurrent = roundIdx === currentRound && matchIdx === currentMatch;

      let statusClass = "upcoming";
      let statusTextStatus = "Akan datang";
      let scoreText = "vs";
      let scoreClass = "upcoming";

      const result = results.find(
        (r) => r.round === roundIdx && r.matchIndex === matchIdx,
      );

      if (isPlayed || result) {
        statusClass = "played";
        statusTextStatus = "✅ Selesai";
        if (result) {
          scoreText = `${result.scoreA} - ${result.scoreB}`;
          scoreClass = "played";
        } else {
          scoreText = "? - ?";
        }
        playedCount++;
      } else if (isCurrent) {
        statusClass = "current";
        statusTextStatus = "⚡ Sedang";
        scoreText = "vs";
        scoreClass = "upcoming";
      }

      totalCount++;

      const itemClass = isPlayed
        ? "fixture-item played"
        : isCurrent
          ? "fixture-item current"
          : "fixture-item upcoming";

      html += `
                <div class="${itemClass}">
                    <div class="fixture-teams">
                        <span>${teamA}</span>
                        <span class="vs">vs</span>
                        <span>${teamB}</span>
                        <span class="fixture-status ${statusClass}">${statusTextStatus}</span>
                    </div>
                    <div class="fixture-score ${scoreClass}">${scoreText}</div>
                </div>
            `;
    });

    html += `</div>`;
  });

  html += "</div>";
  fixtureArea.innerHTML = html;

  if (fixtureCount) {
    fixtureCount.textContent = `${playedCount}/${totalCount} selesai`;
  }
}

// ============================================
// UPDATE STATS
// ============================================
function updateStats() {
  const groupName = getCurrentGroupName();
  if (
    !groupName ||
    !groupTeams[groupName] ||
    groupTeams[groupName].length === 0
  ) {
    if (totalMatches) totalMatches.textContent = "0";
    if (totalGoals) totalGoals.textContent = "0";
    if (avgGoals) avgGoals.textContent = "0.0";
    if (topScorer) topScorer.textContent = "-";
    return;
  }

  const teamNames = groupTeams[groupName] || [];
  const stats = groupTeamStats[groupName] || {};

  let totalM = 0;
  let totalG = 0;
  let topTeam = "-";
  let topGoals = 0;

  teamNames.forEach((name) => {
    const s = stats[name] || { played: 0, gf: 0 };
    totalM += s.played || 0;
    totalG += s.gf || 0;
    if ((s.gf || 0) > topGoals) {
      topGoals = s.gf || 0;
      topTeam = name;
    }
  });

  totalM = totalM / 2;

  if (totalMatches) totalMatches.textContent = totalM;
  if (totalGoals) totalGoals.textContent = totalG;
  if (avgGoals)
    avgGoals.textContent = totalM > 0 ? (totalG / totalM).toFixed(1) : "0.0";
  if (topScorer)
    topScorer.textContent = topGoals > 0 ? `${topTeam} (${topGoals})` : "-";
}

// ============================================
// TOAST
// ============================================
function showToast(message, type = "info") {
  const oldToast = document.querySelector(".toast");
  if (oldToast) oldToast.remove();

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.opacity = "1";
  });

  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ============================================
// KEYBOARD SHORTCUTS
// ============================================
document.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.key === "ArrowLeft") {
    e.preventDefault();
    if (currentGroupIndex > 0) switchGroup(currentGroupIndex - 1);
  }
  if (e.ctrlKey && e.key === "ArrowRight") {
    e.preventDefault();
    if (currentGroupIndex < groups.length - 1)
      switchGroup(currentGroupIndex + 1);
  }
});

// ============================================
// INIT
// ============================================
document.addEventListener("DOMContentLoaded", function () {
  console.log("🚀 user.js DOM loaded!");
  console.log("📍 Domain:", window.location.hostname);

  // Cek semua Firebase dependencies
  console.log("🔍 Checking dependencies...");
  console.log("  - firebase:", typeof firebase !== "undefined" ? "✅" : "❌");
  console.log(
    "  - firebaseConfig:",
    typeof firebaseConfig !== "undefined" ? "✅" : "❌",
  );
  console.log("  - db:", typeof db !== "undefined" ? "✅" : "❌");
  console.log("  - auth:", typeof auth !== "undefined" ? "✅" : "❌");

  // Load data
  loadData();

  console.log("👀 Liga Warga - User View");
  console.log("📱 Dibuat oleh Grup Tolongin 🚀");
});
