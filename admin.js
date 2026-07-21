// ============================================
// ADMIN.JS - ADMIN PANEL (FIXED)
// ============================================

// ============================================
// STATE
// ============================================
let groups = [];
let currentGroupIndex = 0;
let groupTeams = {};
let groupMatches = {};
let groupCurrentRound = {};
let groupCurrentMatch = {};
let groupPreviousRank = {};
let groupHistory = {};
let groupTeamStats = {};
let groupMatchResults = {};

// ============================================
// DOM REFS
// ============================================
const groupTabs = document.getElementById("groupTabs");
const teamsInput = document.getElementById("teamsInput");
const groupNameInput = document.getElementById("groupNameInput");
const standingsBody = document.querySelector("#standingsTable tbody");
const matchArea = document.getElementById("matchArea");
const fixtureArea = document.getElementById("fixtureArea");
const groupCount = document.getElementById("groupCount");
const groupTeamCount = document.getElementById("groupTeamCount");
const currentGroupLabel = document.getElementById("currentGroupLabel");
const totalMatches = document.getElementById("totalMatches");
const totalGoals = document.getElementById("totalGoals");
const avgGoals = document.getElementById("avgGoals");
const topScorer = document.getElementById("topScorer");
const matchProgress = document.getElementById("matchProgress");
const fixtureCount = document.getElementById("fixtureCount");
const undoBtn = document.getElementById("undoBtn");
const historyCount = document.getElementById("historyCount");
const adminInfo = document.getElementById("adminInfo");

console.log("✅ admin.js loaded!");

// ============================================
// AUTH CHECK
// ============================================
function checkAdminAuth() {
  console.log("🔍 checkAdminAuth called");

  auth.onAuthStateChanged((user) => {
    console.log("👤 Auth state changed:", user ? user.email : "Not logged in");

    if (!user) {
      console.log("⛔ No user, redirecting to index.html");
      window.location.href = "index.html";
      return;
    }

    db.collection("users")
      .doc(user.uid)
      .get()
      .then((doc) => {
        console.log("📄 User doc:", doc.exists ? doc.data() : "Not found");
        if (doc.exists && doc.data().role === "admin") {
          adminInfo.textContent = `👋 ${user.email} (Admin)`;
          console.log("✅ Admin verified!");
          loadData();
        } else {
          adminInfo.textContent = "⛔ Akses ditolak! Bukan admin.";
          console.log("⛔ Not admin!");
          setTimeout(() => {
            window.location.href = "index.html";
          }, 2000);
        }
      })
      .catch((err) => {
        console.error("❌ Error cek admin:", err);
        window.location.href = "index.html";
      });
  });
}

// ============================================
// LOGOUT
// ============================================
function logout() {
  console.log("👋 Logout called");
  auth
    .signOut()
    .then(() => {
      window.location.href = "index.html";
    })
    .catch((err) => {
      console.error("❌ Logout error:", err);
    });
}

// ============================================
// LOAD DATA FROM FIREBASE
// ============================================
function loadData() {
  console.log("📥 Loading data from Firebase...");

  // Load groups
  db.collection("groups")
    .doc("data")
    .get()
    .then((doc) => {
      console.log("📄 Groups doc:", doc.exists ? "Exists" : "Not exists");
      if (doc.exists) {
        const data = doc.data();
        groups = data.groups || [];
        groupTeams = data.groupTeams || {};
        groupMatches = data.groupMatches || {};
        groupCurrentRound = data.groupCurrentRound || {};
        groupCurrentMatch = data.groupCurrentMatch || {};
        groupPreviousRank = data.groupPreviousRank || {};
        groupHistory = data.groupHistory || {};
        groupTeamStats = data.groupTeamStats || {};
        groupMatchResults = data.groupMatchResults || {};
        currentGroupIndex = data.currentGroupIndex || 0;
        console.log("✅ Data loaded:", groups.length, "groups");
      } else {
        console.log("📝 No data, initializing empty");
        groups = [];
        groupTeams = {};
        groupMatches = {};
        groupCurrentRound = {};
        groupCurrentMatch = {};
        groupPreviousRank = {};
        groupHistory = {};
        groupTeamStats = {};
        groupMatchResults = {};
        currentGroupIndex = 0;
      }
      updateAll();
    })
    .catch((err) => {
      console.error("❌ Error load data:", err);
      groups = [];
      groupTeams = {};
      groupMatches = {};
      groupCurrentRound = {};
      groupCurrentMatch = {};
      groupPreviousRank = {};
      groupHistory = {};
      groupTeamStats = {};
      groupMatchResults = {};
      currentGroupIndex = 0;
      updateAll();
    });

  // Real-time listener
  db.collection("groups")
    .doc("data")
    .onSnapshot(
      (doc) => {
        console.log("🔄 Real-time update received");
        if (doc.exists) {
          const data = doc.data();
          groups = data.groups || [];
          groupTeams = data.groupTeams || {};
          groupMatches = data.groupMatches || {};
          groupCurrentRound = data.groupCurrentRound || {};
          groupCurrentMatch = data.groupCurrentMatch || {};
          groupPreviousRank = data.groupPreviousRank || {};
          groupHistory = data.groupHistory || {};
          groupTeamStats = data.groupTeamStats || {};
          groupMatchResults = data.groupMatchResults || {};
          currentGroupIndex = data.currentGroupIndex || 0;
          updateAll();
        }
      },
      (err) => {
        console.error("❌ Listener error:", err);
      },
    );
}

// ============================================
// SAVE DATA TO FIREBASE
// ============================================
function saveData() {
  console.log("💾 Saving data to Firebase...");
  const data = {
    groups,
    groupTeams,
    groupMatches,
    groupCurrentRound,
    groupCurrentMatch,
    groupPreviousRank,
    groupHistory,
    groupTeamStats,
    groupMatchResults,
    currentGroupIndex,
    updatedAt: new Date().toISOString(),
  };

  db.collection("groups")
    .doc("data")
    .set(data)
    .then(() => {
      console.log("✅ Data saved to Firebase");
    })
    .catch((err) => {
      console.error("❌ Error saving data:", err);
      showToast("⚠️ Gagal menyimpan data!", "error");
    });
}

// ============================================
// GROUP MANAGEMENT
// ============================================
function addGroup() {
  const name = groupNameInput.value.trim();
  if (!name) {
    showToast("⚠️ Masukkan nama grup!", "warning");
    return;
  }

  if (groups.includes(name)) {
    showToast("⚠️ Grup sudah ada!", "error");
    return;
  }

  groups.push(name);
  groupTeams[name] = [];
  groupMatches[name] = [];
  groupCurrentRound[name] = 0;
  groupCurrentMatch[name] = 0;
  groupPreviousRank[name] = {};
  groupHistory[name] = [];
  groupTeamStats[name] = {};
  groupMatchResults[name] = [];

  groupNameInput.value = "";
  currentGroupIndex = groups.length - 1;

  updateAll();
  saveData();
  showToast(`✅ Grup "${name}" berhasil ditambahkan!`, "success");
}

function deleteGroup(index) {
  const name = groups[index];
  if (!name) return;

  if (!confirm(`Hapus grup "${name}"?`)) return;

  groups.splice(index, 1);
  delete groupTeams[name];
  delete groupMatches[name];
  delete groupCurrentRound[name];
  delete groupCurrentMatch[name];
  delete groupPreviousRank[name];
  delete groupHistory[name];
  delete groupTeamStats[name];
  delete groupMatchResults[name];

  if (currentGroupIndex >= groups.length) {
    currentGroupIndex = Math.max(0, groups.length - 1);
  }

  updateAll();
  saveData();
  showToast(`🗑️ Grup "${name}" dihapus`, "info");
}

function switchGroup(index) {
  if (index < 0 || index >= groups.length) return;
  currentGroupIndex = index;
  updateAll();
  saveData();
}

function getCurrentGroupName() {
  return groups[currentGroupIndex] || null;
}

function updateGroupTeams() {
  const name = getCurrentGroupName();
  if (!name) {
    showToast("⚠️ Pilih grup terlebih dahulu!", "warning");
    return;
  }

  const input = teamsInput.value;
  const teamNames = input.split("\n").filter((t) => t.trim() !== "");

  if (teamNames.length < 2) {
    showToast("⚠️ Minimal 2 tim per grup!", "error");
    return;
  }

  groupTeams[name] = teamNames.map((t) => t.trim());

  // Reset data grup
  groupMatches[name] = [];
  groupCurrentRound[name] = 0;
  groupCurrentMatch[name] = 0;
  groupPreviousRank[name] = {};
  groupHistory[name] = [];
  groupTeamStats[name] = {};
  groupMatchResults[name] = [];

  updateAll();
  saveData();
  showToast(`✅ Tim di grup "${name}" berhasil diupdate!`, "success");
}

function loadExampleTeams() {
  const examples = [
    "Persija",
    "Persib",
    "Arema",
    "Bali United",
    "PSIS",
    "Borneo",
  ];
  teamsInput.value = examples.join("\n");
  updateGroupTeamsInput();
}

// ============================================
// GENERATE
// ============================================
function generateMatchesForGroup(groupName) {
  const teams = groupTeams[groupName] || [];
  if (teams.length < 2) return false;

  const matches = [];
  const totalRounds = 1;

  for (let r = 0; r < totalRounds; r++) {
    const roundMatches = [];
    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        if (r === 0) {
          roundMatches.push({ home: i, away: j });
        } else {
          roundMatches.push({ home: j, away: i });
        }
      }
    }
    // Shuffle
    for (let i = roundMatches.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [roundMatches[i], roundMatches[j]] = [roundMatches[j], roundMatches[i]];
    }
    matches.push(roundMatches);
  }

  groupMatches[groupName] = matches;
  groupCurrentRound[groupName] = 0;
  groupCurrentMatch[groupName] = 0;
  groupPreviousRank[groupName] = {};
  groupHistory[groupName] = [];
  groupTeamStats[groupName] = {};
  groupMatchResults[groupName] = [];

  // Initialize stats
  const teamNames = groupTeams[groupName] || [];
  teamNames.forEach((name) => {
    groupTeamStats[groupName][name] = {
      played: 0,
      win: 0,
      draw: 0,
      loss: 0,
      gf: 0,
      ga: 0,
      points: 0,
    };
  });

  return true;
}

function generateCurrentGroup() {
  const name = getCurrentGroupName();
  if (!name) {
    showToast("⚠️ Tidak ada grup yang dipilih!", "warning");
    return;
  }

  const teams = groupTeams[name] || [];
  if (teams.length < 2) {
    showToast("⚠️ Minimal 2 tim di grup ini!", "error");
    return;
  }

  generateMatchesForGroup(name);
  updateAll();
  saveData();
  showToast(`🚀 Liga grup "${name}" berhasil digenerate!`, "success");
}

function generateAllGroups() {
  if (groups.length === 0) {
    showToast("⚠️ Tambahkan grup terlebih dahulu!", "warning");
    return;
  }

  let successCount = 0;
  groups.forEach((name) => {
    const teams = groupTeams[name] || [];
    if (teams.length >= 2) {
      generateMatchesForGroup(name);
      successCount++;
    }
  });

  if (successCount === 0) {
    showToast("⚠️ Tidak ada grup dengan minimal 2 tim!", "error");
    return;
  }

  updateAll();
  saveData();
  showToast(`🚀 ${successCount} grup berhasil digenerate!`, "success");
}

// ============================================
// SUBMIT SCORE
// ============================================
function submitScore() {
  console.log("📝 submitScore called");
  const groupName = getCurrentGroupName();
  if (!groupName) {
    showToast("⚠️ Pilih grup terlebih dahulu!", "warning");
    return;
  }

  const scoreA = parseInt(document.getElementById("scoreA")?.value);
  const scoreB = parseInt(document.getElementById("scoreB")?.value);

  if (isNaN(scoreA) || isNaN(scoreB)) {
    showToast("⚠️ Isi skor dulu!", "warning");
    return;
  }

  if (scoreA < 0 || scoreB < 0) {
    showToast("⚠️ Skor tidak boleh negatif!", "error");
    return;
  }

  const matches = groupMatches[groupName] || [];
  const currentRound = groupCurrentRound[groupName] || 0;
  const currentMatch = groupCurrentMatch[groupName] || 0;

  if (matches.length === 0) {
    showToast("⚠️ Belum ada jadwal! Generate liga dulu!", "warning");
    return;
  }

  if (currentRound >= matches.length) {
    showToast("🏆 Liga sudah selesai!", "info");
    return;
  }

  const round = matches[currentRound];
  if (currentMatch >= round.length) {
    groupCurrentMatch[groupName] = 0;
    groupCurrentRound[groupName] = currentRound + 1;
    saveData();
    updateAll();
    showToast("🔄 Lanjut ke putaran berikutnya!", "info");
    return;
  }

  // Save to history
  saveToHistory(groupName);

  const match = round[currentMatch];
  const teamNames = groupTeams[groupName] || [];
  const teamA = teamNames[match.home];
  const teamB = teamNames[match.away];

  if (!groupTeamStats[groupName]) {
    groupTeamStats[groupName] = {};
    teamNames.forEach((name) => {
      groupTeamStats[groupName][name] = {
        played: 0,
        win: 0,
        draw: 0,
        loss: 0,
        gf: 0,
        ga: 0,
        points: 0,
      };
    });
  }

  const stats = groupTeamStats[groupName];
  if (!stats[teamA])
    stats[teamA] = {
      played: 0,
      win: 0,
      draw: 0,
      loss: 0,
      gf: 0,
      ga: 0,
      points: 0,
    };
  if (!stats[teamB])
    stats[teamB] = {
      played: 0,
      win: 0,
      draw: 0,
      loss: 0,
      gf: 0,
      ga: 0,
      points: 0,
    };

  const statA = stats[teamA];
  const statB = stats[teamB];

  statA.played++;
  statB.played++;
  statA.gf += scoreA;
  statA.ga += scoreB;
  statB.gf += scoreB;
  statB.ga += scoreA;

  if (scoreA > scoreB) {
    statA.win++;
    statB.loss++;
    statA.points += 3;
  } else if (scoreA < scoreB) {
    statB.win++;
    statA.loss++;
    statB.points += 3;
  } else {
    statA.draw++;
    statB.draw++;
    statA.points += 1;
    statB.points += 1;
  }

  if (!groupMatchResults[groupName]) groupMatchResults[groupName] = [];
  groupMatchResults[groupName].push({
    round: currentRound,
    matchIndex: currentMatch,
    home: teamA,
    away: teamB,
    scoreA: scoreA,
    scoreB: scoreB,
  });

  groupCurrentMatch[groupName] = currentMatch + 1;
  updatePreviousRank(groupName);

  updateAll();
  saveData();
  showToast(`✅ ${teamA} ${scoreA} - ${scoreB} ${teamB}`, "success");
}

function quickDraw() {
  const scoreA = document.getElementById("scoreA");
  const scoreB = document.getElementById("scoreB");
  if (scoreA) scoreA.value = 0;
  if (scoreB) scoreB.value = 0;
  submitScore();
}

function updatePreviousRank(groupName) {
  const teamNames = groupTeams[groupName] || [];
  const stats = groupTeamStats[groupName] || {};

  const sorted = [...teamNames];
  sorted.sort((a, b) => {
    const sa = stats[a] || { points: 0, gf: 0, ga: 0 };
    const sb = stats[b] || { points: 0, gf: 0, ga: 0 };
    if (sb.points !== sa.points) return sb.points - sa.points;
    const gdA = sa.gf - sa.ga;
    const gdB = sb.gf - sb.ga;
    if (gdB !== gdA) return gdB - gdA;
    return sb.gf - sa.gf;
  });

  groupPreviousRank[groupName] = {};
  sorted.forEach((name, index) => {
    groupPreviousRank[groupName][name] = index;
  });
}

// ============================================
// UNDO
// ============================================
function saveToHistory(groupName) {
  if (!groupHistory[groupName]) groupHistory[groupName] = [];

  const snapshot = {
    teams: JSON.parse(JSON.stringify(groupTeamStats[groupName] || {})),
    currentRound: groupCurrentRound[groupName] || 0,
    currentMatch: groupCurrentMatch[groupName] || 0,
    previousRank: JSON.parse(
      JSON.stringify(groupPreviousRank[groupName] || {}),
    ),
    matchResults: JSON.parse(
      JSON.stringify(groupMatchResults[groupName] || []),
    ),
  };

  groupHistory[groupName].push(snapshot);
  if (groupHistory[groupName].length > 50) groupHistory[groupName].shift();
  updateHistoryUI();
}

function undoLastMatch() {
  const groupName = getCurrentGroupName();
  if (!groupName) {
    showToast("⚠️ Pilih grup terlebih dahulu!", "warning");
    return;
  }

  const history = groupHistory[groupName] || [];
  if (history.length === 0) {
    showToast("Tidak ada yang bisa di-undo!", "warning");
    return;
  }

  const lastState = history.pop();

  if (groupTeamStats && groupTeamStats[groupName]) {
    groupTeamStats[groupName] = lastState.teams;
  }
  groupCurrentRound[groupName] = lastState.currentRound;
  groupCurrentMatch[groupName] = lastState.currentMatch;
  groupPreviousRank[groupName] = lastState.previousRank;
  groupMatchResults[groupName] = lastState.matchResults;

  updateAll();
  saveData();
  showToast("✅ Undo berhasil!", "success");
}

// ============================================
// RESET
// ============================================
function resetAll() {
  if (confirm("⚠️ Yakin ingin mereset semua data? Semua grup akan hilang!")) {
    groups = [];
    groupTeams = {};
    groupMatches = {};
    groupCurrentRound = {};
    groupCurrentMatch = {};
    groupPreviousRank = {};
    groupHistory = {};
    groupTeamStats = {};
    groupMatchResults = {};
    currentGroupIndex = 0;
    updateAll();
    saveData();
    showToast("🗑️ Semua data direset!", "info");
  }
}

// ============================================
// EXPORT
// ============================================
function exportStandings() {
  const groupName = getCurrentGroupName();
  if (
    !groupName ||
    !groupTeams[groupName] ||
    groupTeams[groupName].length === 0
  ) {
    showToast("⚠️ Tidak ada data untuk diexport!", "warning");
    return;
  }

  const teamNames = groupTeams[groupName] || [];
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

  const sorted = [...teams].sort((a, b) => b.points - a.points);
  let text = `⚽ KLASEMEN - ${groupName}\n`;
  text += "=".repeat(50) + "\n\n";
  text += "# | Tim | M | W | D | L | GF | GA | SG | Pts\n";
  text += "-".repeat(50) + "\n";

  sorted.forEach((t, i) => {
    const gd = t.gf - t.ga;
    text += `${i + 1} | ${t.name.padEnd(15)} | ${t.played} | ${t.win} | ${t.draw} | ${t.loss} | ${t.gf} | ${t.ga} | ${gd > 0 ? "+" : ""}${gd} | ${t.points}\n`;
  });

  text += "\n" + "=".repeat(50) + "\n";
  text += `Total Gol: ${teams.reduce((s, t) => s + t.gf, 0)}\n`;

  const blob = new Blob([text], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `klasemen_${groupName}_${new Date().toISOString().slice(0, 10)}.txt`;
  a.click();
  URL.revokeObjectURL(a.href);

  showToast(`📥 Klasemen "${groupName}" berhasil diexport!`, "success");
}

// ============================================
// UPDATE UI
// ============================================
function updateAll() {
  updateGroupTabs();
  updateGroupTeamsInput();
  updateStandings();
  updateMatch();
  updateFixture();
  updateStats();
  updateGroupCount();
  updateHistoryUI();
  updateUndoBtn();
}

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
                        <button class="tab-delete" onclick="event.stopPropagation(); deleteGroup(${index})">✕</button>
                    </div>
                `;
  });
  groupTabs.innerHTML = html;
}

function updateGroupTeamsInput() {
  const name = getCurrentGroupName();
  if (!name) {
    teamsInput.value = "";
    if (currentGroupLabel)
      currentGroupLabel.textContent = "📋 Pilih grup terlebih dahulu";
    if (groupTeamCount) groupTeamCount.textContent = "0 tim";
    return;
  }

  const teams = groupTeams[name] || [];
  teamsInput.value = teams.join("\n");
  if (currentGroupLabel) currentGroupLabel.textContent = `📋 Tim di "${name}"`;
  if (groupTeamCount) groupTeamCount.textContent = `${teams.length} tim`;
}

function updateStandings() {
  if (!standingsBody) return;
  standingsBody.innerHTML = "";

  const groupName = getCurrentGroupName();
  if (!groupName) {
    document.getElementById("standingInfo").textContent =
      "Pilih grup terlebih dahulu";
    return;
  }

  const teamNames = groupTeams[groupName] || [];
  if (teamNames.length === 0) {
    document.getElementById("standingInfo").textContent =
      "Belum ada tim di grup ini";
    return;
  }

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

  const sorted = [...teams];
  sorted.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const gdA = a.gf - a.ga;
    const gdB = b.gf - b.ga;
    if (gdB !== gdA) return gdB - gdA;
    return b.gf - a.gf;
  });

  const prevRank = groupPreviousRank[groupName] || {};

  sorted.forEach((team, index) => {
    const prev = prevRank[team.name];
    let arrow = "";
    let color = "";

    if (prev !== undefined && prev !== index) {
      if (index < prev) {
        arrow = " ↑";
        color = "#10b981";
      } else {
        arrow = " ↓";
        color = "#ef4444";
      }
    }

    const gd = team.gf - team.ga;
    const row = document.createElement("tr");
    row.style.color = color || "inherit";
    row.innerHTML = `
                    <td>${index + 1}${arrow}</td>
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

  const totalMatchesPlayed = teams.reduce((sum, t) => sum + t.played, 0) / 2;
  document.getElementById("standingInfo").textContent =
    `${teamNames.length} tim | ${totalMatchesPlayed} pertandingan dimainkan`;
}

function updateMatch() {
  if (!matchArea) return;

  const groupName = getCurrentGroupName();
  if (
    !groupName ||
    !groupTeams[groupName] ||
    groupTeams[groupName].length === 0
  ) {
    matchArea.innerHTML = `
                    <div class="empty-state">
                        <span class="empty-icon">⚽</span>
                        <h3>Belum ada pertandingan</h3>
                        <p>Pilih grup dan generate liga terlebih dahulu</p>
                    </div>
                `;
    return;
  }

  const matches = groupMatches[groupName] || [];
  if (matches.length === 0) {
    matchArea.innerHTML = `
                    <div class="empty-state">
                        <span class="empty-icon">⚽</span>
                        <h3>Belum ada jadwal</h3>
                        <p>Klik "Generate Liga" untuk membuat jadwal</p>
                    </div>
                `;
    return;
  }

  const currentRound = groupCurrentRound[groupName] || 0;
  const currentMatch = groupCurrentMatch[groupName] || 0;

  if (currentRound >= matches.length) {
    const teamNames = groupTeams[groupName] || [];
    const stats = groupTeamStats[groupName] || {};
    let topTeam = teamNames[0] || "";
    let topPoints = -1;

    teamNames.forEach((name) => {
      const s = stats[name] || { points: 0 };
      if (s.points > topPoints) {
        topPoints = s.points;
        topTeam = name;
      }
    });

    matchArea.innerHTML = `
                    <div class="match-finished">
                        <span class="trophy">🏆</span>
                        <h3>Liga Selesai!</h3>
                        <p style="color: var(--text-secondary);">
                            Juara: <strong style="color: #f59e0b;">${topTeam}</strong> dengan ${topPoints} poin
                        </p>
                        <div class="match-actions" style="margin-top:16px;">
                            <button onclick="generateCurrentGroup()" class="btn-primary">🔄 Generate Ulang</button>
                            <button onclick="undoLastMatch()" class="btn-warning">↩️ Undo</button>
                        </div>
                    </div>
                `;
    if (matchProgress) matchProgress.textContent = "100%";
    return;
  }

  const round = matches[currentRound];
  if (currentMatch >= round.length) {
    groupCurrentRound[groupName] = currentRound + 1;
    groupCurrentMatch[groupName] = 0;
    saveData();
    updateMatch();
    return;
  }

  const match = round[currentMatch];
  const teamNames = groupTeams[groupName] || [];
  const teamA = teamNames[match.home];
  const teamB = teamNames[match.away];
  const totalRounds = matches.length;
  const totalMatchesCount = matches.flat().length;

  let done = 0;
  for (let r = 0; r < matches.length; r++) {
    if (r < currentRound) {
      done += matches[r].length;
    } else if (r === currentRound) {
      done += currentMatch;
      break;
    }
  }

  const progress =
    totalMatchesCount > 0 ? Math.round((done / totalMatchesCount) * 100) : 0;

  matchArea.innerHTML = `
                <div style="width:100%;">
                    <div class="match-header">
                        <span class="match-round">🎯 Putaran ${currentRound + 1}/${totalRounds}</span>
                        <span class="match-round">Match ${currentMatch + 1}/${round.length}</span>
                    </div>
                    <div class="match-teams">
                        ${teamA} <span class="vs">vs</span> ${teamB}
                    </div>
                    <div class="match-inputs">
                        <input type="number" id="scoreA" value="0" min="0" max="99">
                        <span class="vs-text">⚽</span>
                        <input type="number" id="scoreB" value="0" min="0" max="99">
                    </div>
                    <div class="match-actions">
                        <button onclick="submitScore()" class="btn-success">✅ Submit</button>
                        <button onclick="quickDraw()" class="btn-primary">🤝 Draw 0-0</button>
                    </div>
                    <div style="text-align:center;margin-top:8px;">
                        <span class="text-muted">Progress: ${progress}%</span>
                    </div>
                </div>
            `;

  if (matchProgress) matchProgress.textContent = `${progress}%`;
}

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
                        <p>Generate liga untuk melihat jadwal</p>
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
                        <p>Generate liga terlebih dahulu</p>
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
    html += `<div class="fixture-round-title">
                        <span>${isPastRound ? "✅" : isCurrentRound ? "▶️" : "📅"} Putaran ${roundIdx + 1}</span>
                        <span>${round.length} match</span>
                    </div>`;

    round.forEach((match, matchIdx) => {
      const teamA = teamNames[match.home];
      const teamB = teamNames[match.away];
      const isPlayed =
        roundIdx < currentRound ||
        (roundIdx === currentRound && matchIdx < currentMatch);
      const isCurrent = roundIdx === currentRound && matchIdx === currentMatch;

      let statusClass = "upcoming";
      let statusText = "Akan datang";
      let scoreText = "vs";
      let scoreClass = "upcoming";

      const result = results.find(
        (r) => r.round === roundIdx && r.matchIndex === matchIdx,
      );

      if (isPlayed || result) {
        statusClass = "played";
        statusText = "Selesai";
        if (result) {
          scoreText = `${result.scoreA} - ${result.scoreB}`;
          scoreClass = "played";
        } else {
          scoreText = "? - ?";
        }
        playedCount++;
      } else if (isCurrent) {
        statusClass = "current";
        statusText = "Sedang berlangsung";
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
                                <span class="fixture-status ${statusClass}">${statusText}</span>
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

function updateStats() {
  const groupName = getCurrentGroupName();
  if (
    !groupName ||
    !groupTeams[groupName] ||
    groupTeams[groupName].length === 0
  ) {
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

function updateGroupCount() {
  if (groupCount) {
    groupCount.textContent = `${groups.length} grup`;
  }
}

function updateHistoryUI() {
  const groupName = getCurrentGroupName();
  if (historyCount) {
    const count = groupName ? groupHistory[groupName]?.length || 0 : 0;
    historyCount.textContent = `History: ${count} langkah`;
  }
}

function updateUndoBtn() {
  const groupName = getCurrentGroupName();
  if (undoBtn) {
    const count = groupName ? groupHistory[groupName]?.length || 0 : 0;
    undoBtn.disabled = count === 0;
    undoBtn.style.opacity = count === 0 ? "0.5" : "1";
  }
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
// INIT
// ============================================
document.addEventListener("DOMContentLoaded", function () {
  console.log("🚀 admin.js DOM loaded!");
  checkAdminAuth();

  teamsInput.addEventListener("input", () => {
    const count = teamsInput.value.split("\n").filter((t) => t.trim()).length;
    if (groupTeamCount) groupTeamCount.textContent = `${count} tim`;
  });
});
