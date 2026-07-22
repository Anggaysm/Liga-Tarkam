// ============================================
// ADMIN.JS - ADMIN PANEL (FIXED - FINAL)
// ============================================

console.log("📦 admin.js loaded!");

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
let groupPlayers = {};
let groupGoalScorers = {};
let selectedTeamForPlayer = "";

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

// ============================================
// INIT ADMIN - DIPANGGIL DARI ADMIN.HTML
// ============================================
function initAdmin() {
  console.log("🚀 initAdmin called!");

  // Cek apakah sudah login dan admin
  const user = auth.currentUser;
  if (!user) {
    console.log("⛔ No user, redirecting to index.html");
    window.location.href = "index.html";
    return;
  }

  db.collection("users")
    .doc(user.uid)
    .get()
    .then((doc) => {
      if (doc.exists && doc.data().role === "admin") {
        adminInfo.textContent = `👋 ${user.email} (Admin)`;
        console.log("✅ Admin verified!");
        loadData();
        setupEventListeners();
      } else {
        console.log("⛔ Not admin!");
        window.location.href = "index.html";
      }
    })
    .catch((err) => {
      console.error("❌ Error checking admin:", err);
      window.location.href = "index.html";
    });
}

// ============================================
// SETUP EVENT LISTENERS
// ============================================
function setupEventListeners() {
  teamsInput.addEventListener("input", () => {
    const count = teamsInput.value.split("\n").filter((t) => t.trim()).length;
    if (groupTeamCount) groupTeamCount.textContent = `${count} tim`;
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

  // Tampilkan loading
  showToast("⏳ Memuat data...", "info");

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
        groupPlayers = data.groupPlayers || {};
        groupGoalScorers = data.groupGoalScorers || {};
        console.log("✅ Data loaded:", groups.length, "groups");
        console.log("📊 GroupTeams:", groupTeams);
        console.log("📊 GroupTeamStats:", groupTeamStats);
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
        groupPlayers = {};
        groupGoalScorers = {};
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
      groupPlayers = {};
      groupGoalScorers = {};
      updateAll();
      showToast("⚠️ Gagal memuat data!", "error");
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
          groupPlayers = data.groupPlayers || {};
          groupGoalScorers = data.groupGoalScorers || {};
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
    groupPlayers,
    groupGoalScorers,
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
  groupMatches[name] = {};
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
  groupMatches[name] = {};
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
// GENERATE MATCHES - DENGAN OPTIMASI
// ============================================

function generateMatchesForGroup(groupName) {
  const teams = groupTeams[groupName] || [];
  if (teams.length < 2) return false;

  const teamNames = [...teams];
  const n = teamNames.length;

  // === BUAT SEMUA PASANGAN MATCH ===
  let allMatches = [];
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      allMatches.push({ home: i, away: j });
    }
  }

  // === BUAT JADWAL DENGAN JEDA ===
  let scheduled = [];
  let teamLastMatch = {};
  for (let i = 0; i < n; i++) {
    teamLastMatch[i] = -3;
  }

  let remainingMatches = allMatches.map((m, idx) => ({ ...m, idx }));
  let attempts = 0;
  const maxAttempts = allMatches.length * 500;

  while (remainingMatches.length > 0 && attempts < maxAttempts) {
    attempts++;
    const currentIdx = scheduled.length;

    let available = remainingMatches.filter((m) => {
      const homeLast = teamLastMatch[m.home] ?? -3;
      const awayLast = teamLastMatch[m.away] ?? -3;
      return currentIdx - homeLast >= 2 && currentIdx - awayLast >= 2;
    });

    if (available.length === 0) {
      available = remainingMatches.filter((m) => {
        const homeLast = teamLastMatch[m.home] ?? -3;
        const awayLast = teamLastMatch[m.away] ?? -3;
        return currentIdx - homeLast >= 1 && currentIdx - awayLast >= 1;
      });
    }

    if (available.length === 0) {
      available = remainingMatches;
    }

    const randomIdx = Math.floor(Math.random() * available.length);
    const selected = available[randomIdx];

    scheduled.push({ home: selected.home, away: selected.away });
    teamLastMatch[selected.home] = scheduled.length - 1;
    teamLastMatch[selected.away] = scheduled.length - 1;

    const remainingIdx = remainingMatches.findIndex(
      (m) => m.idx === selected.idx,
    );
    if (remainingIdx !== -1) {
      remainingMatches.splice(remainingIdx, 1);
    }
  }

  // === OPTIMASI JADWAL ===
  // Tukar match yang berdekatan supaya ga ada tim yang main berturut-turut
  scheduled = optimizeSchedule(scheduled, n);

  // === BAGI KE DALAM PUTARAN ===
  const matches = {};
  let matchIdx = 0;
  let roundIdx = 0;
  const matchesPerRound = Math.min(
    6,
    Math.ceil(scheduled.length / Math.ceil(scheduled.length / 6)),
  );

  while (matchIdx < scheduled.length) {
    const roundKey = `round_${roundIdx}`;
    matches[roundKey] = [];
    for (let i = 0; i < matchesPerRound && matchIdx < scheduled.length; i++) {
      matches[roundKey].push(scheduled[matchIdx]);
      matchIdx++;
    }
    roundIdx++;
  }

  groupMatches[groupName] = matches;
  groupCurrentRound[groupName] = 0;
  groupCurrentMatch[groupName] = 0;
  groupPreviousRank[groupName] = {};
  groupHistory[groupName] = [];
  groupTeamStats[groupName] = {};
  groupMatchResults[groupName] = [];

  // Initialize stats
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

  // Log hasil jadwal
  console.log(
    `📋 Jadwal untuk ${groupName} (${n} tim, ${scheduled.length} match):`,
  );
  const sortedKeys = Object.keys(matches).sort();
  sortedKeys.forEach((key) => {
    const round = matches[key];
    console.log(`  ${key}: ${round.length} match`);
    round.forEach((m, idx) => {
      console.log(
        `    ${idx + 1}. ${teamNames[m.home]} vs ${teamNames[m.away]}`,
      );
    });
  });

  return true;
}

// ============================================
// OPTIMASI JADWAL - TUKAR MATCH AGAR GA BERDEKATAN
// ============================================
function optimizeSchedule(schedule, numTeams) {
  console.log("🔧 Optimasi jadwal...");

  let improved = true;
  let maxIterations = 1000;
  let iteration = 0;

  while (improved && iteration < maxIterations) {
    improved = false;
    iteration++;

    // Cek setiap tim
    for (let team = 0; team < numTeams; team++) {
      // Cari posisi match tim ini
      let positions = [];
      schedule.forEach((match, idx) => {
        if (match.home === team || match.away === team) {
          positions.push(idx);
        }
      });

      // Cek ada yang berdekatan (jarak <= 1)
      for (let i = 0; i < positions.length - 1; i++) {
        const gap = positions[i + 1] - positions[i];

        if (gap <= 1) {
          // Ada match berdekatan! Coba tuker dengan match lain
          const matchIdx1 = positions[i];
          const matchIdx2 = positions[i + 1];

          // Cari match lain yang bisa ditukar
          for (let j = 0; j < schedule.length; j++) {
            if (j === matchIdx1 || j === matchIdx2) continue;

            // Coba tuker matchIdx2 dengan j
            const temp = schedule[matchIdx2];
            schedule[matchIdx2] = schedule[j];
            schedule[j] = temp;

            // Cek apakah ini memperbaiki jadwal
            let newPositions = [];
            schedule.forEach((m, idx) => {
              if (m.home === team || m.away === team) {
                newPositions.push(idx);
              }
            });

            // Cek apakah tim ini masih ada yang berdekatan
            let stillBad = false;
            for (let k = 0; k < newPositions.length - 1; k++) {
              if (newPositions[k + 1] - newPositions[k] <= 1) {
                stillBad = true;
                break;
              }
            }

            if (!stillBad) {
              // Berhasil!
              improved = true;
              console.log(`✅ Tim ${team} diperbaiki`);
              break;
            } else {
              // Kembalikan
              const tempBack = schedule[matchIdx2];
              schedule[matchIdx2] = schedule[j];
              schedule[j] = tempBack;
            }
          }

          if (improved) break;
        }
      }

      if (improved) break;
    }
  }

  return schedule;
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
// ============================================
// SUBMIT SCORE - DENGAN PENCETAK GOL
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

  // ==========================================
  // 🔥 AMBIL DATA PENCETAK GOL DARI INPUT
  // ==========================================
  const scorerInputs = document.querySelectorAll(".scorer-input");
  const scorerData = [];
  let totalCheckedGoals = 0;

  scorerInputs.forEach((input) => {
    const goals = parseInt(input.value) || 0;
    if (goals > 0) {
      totalCheckedGoals += goals;
      scorerData.push({
        playerId: input.dataset.playerId,
        playerName: input.dataset.playerName,
        team: input.dataset.team,
        goals: goals,
      });
    }
  });

  // Validasi: jumlah gol dari checkbox harus sama dengan skor total
  const totalScore = scoreA + scoreB;
  if (totalCheckedGoals !== totalScore) {
    showToast(
      `⚠️ Jumlah gol dari pencetak (${totalCheckedGoals}) tidak sesuai dengan skor (${totalScore})!`,
      "warning",
    );
    return;
  }

  const matchesObj = groupMatches[groupName] || {};
  const roundKeys = Object.keys(matchesObj).sort();

  if (roundKeys.length === 0) {
    showToast("⚠️ Belum ada jadwal! Generate liga dulu!", "warning");
    return;
  }

  const currentRound = groupCurrentRound[groupName] || 0;
  const currentMatch = groupCurrentMatch[groupName] || 0;
  const roundKey = `round_${currentRound}`;
  const round = matchesObj[roundKey] || [];

  if (currentRound >= roundKeys.length) {
    showToast("🏆 Liga sudah selesai!", "info");
    return;
  }

  if (currentMatch >= round.length) {
    groupCurrentMatch[groupName] = 0;
    groupCurrentRound[groupName] = currentRound + 1;
    saveData();
    updateAll();
    showToast("🔄 Lanjut ke putaran berikutnya!", "info");
    return;
  }

  saveToHistory(groupName);

  const match = round[currentMatch];
  const teamNames = groupTeams[groupName] || [];
  const teamA = teamNames[match.home];
  const teamB = teamNames[match.away];

  // ==========================================
  // UPDATE STATISTIK TIM
  // ==========================================
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
  if (!stats[teamA]) {
    stats[teamA] = {
      played: 0,
      win: 0,
      draw: 0,
      loss: 0,
      gf: 0,
      ga: 0,
      points: 0,
    };
  }
  if (!stats[teamB]) {
    stats[teamB] = {
      played: 0,
      win: 0,
      draw: 0,
      loss: 0,
      gf: 0,
      ga: 0,
      points: 0,
    };
  }

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

  // ==========================================
  // 🔥 UPDATE GOL PEMAIN
  // ==========================================
  const goalsByTeam = {};
  scorerData.forEach((s) => {
    if (!goalsByTeam[s.team]) goalsByTeam[s.team] = [];
    goalsByTeam[s.team].push(s);
  });

  Object.keys(goalsByTeam).forEach((team) => {
    const players = groupPlayers[groupName]?.[team] || [];
    goalsByTeam[team].forEach((scorer) => {
      const player = players.find((p) => p.id === scorer.playerId);
      if (player) {
        player.goals = (player.goals || 0) + scorer.goals; // 🔥 PAKE scorer.goals!
        console.log(
          `⚽ ${scorer.playerName} (${team}) mencetak ${scorer.goals} gol! Total: ${player.goals}`,
        );
      }
    });
  });

  // ==========================================
  // 🔥 SIMPAN DATA GOL KE GROUPGOALSCORERS
  // ==========================================
  if (!groupGoalScorers[groupName]) groupGoalScorers[groupName] = [];

  const matchRecord = {
    matchId: groupMatchResults[groupName]?.length || 0,
    round: currentRound,
    matchIndex: currentMatch,
    scorers: scorerData.map((s) => ({
      playerId: s.playerId,
      playerName: s.playerName,
      team: s.team,
      goals: s.goals, // 🔥 PAKE s.goals!
    })),
  };
  groupGoalScorers[groupName].push(matchRecord);

  // ==========================================
  // SIMPAN HASIL MATCH
  // ==========================================
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
  savePlayerData(); // 🔥 SAVE DATA PEMAIN JUGA!
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
  loadPlayerData();
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

  const matchesObj = groupMatches[groupName] || {};
  const roundKeys = Object.keys(matchesObj).sort();

  if (roundKeys.length === 0) {
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
  const roundKey = `round_${currentRound}`;
  const round = matchesObj[roundKey] || [];

  if (currentRound >= roundKeys.length) {
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
  const totalRounds = roundKeys.length;

  // 🔥 AMBIL DATA PEMAIN UNTUK KEDUA TIM
  const playersA = groupPlayers[groupName]?.[teamA] || [];
  const playersB = groupPlayers[groupName]?.[teamB] || [];

  // 🔥 BUAT HTML UNTUK INPUT JUMLAH GOL PER PEMAIN
  let scorersHTML = "";

  if (playersA.length > 0 || playersB.length > 0) {
    scorersHTML = `
            <div style="margin-top: 12px; padding: 12px; background: rgba(255,255,255,0.03); border-radius: 8px; text-align: left;">
                <p style="font-size: 13px; font-weight: 600; color: var(--text-secondary); margin-bottom: 8px;">📝 Pencetak Gol (isi jumlah gol per pemain):</p>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    <div>
                        <p style="font-size: 12px; font-weight: 600; color: #38bdf8; margin-bottom: 4px;">${teamA} (skor: <span id="scoreADisplay">0</span> gol):</p>
                        ${playersA
                          .map(
                            (p) => `
                            <div style="display: flex; align-items: center; gap: 8px; font-size: 13px; padding: 4px 0; flex-wrap: wrap;">
                                <span style="min-width: 100px;">${p.name}</span>
                                <span style="font-size: 11px; color: var(--text-muted); min-width: 55px;">(${p.category} ${p.class})</span>
                                <span style="font-size: 11px; color: var(--text-muted);">⚽</span>
                                <input type="number" class="scorer-input" data-team="${teamA}" data-player-id="${p.id}" data-player-name="${p.name}" 
                                       value="0" min="0" max="10" style="width: 50px; padding: 4px 6px; background: var(--bg-input); border: 1.5px solid var(--border-color); border-radius: 6px; color: var(--text-primary); font-size: 14px; text-align: center;" 
                                       oninput="updateScorerTotals()">
                                <span style="font-size: 11px; color: var(--text-muted);">gol</span>
                            </div>
                        `,
                          )
                          .join("")}
                        ${playersA.length === 0 ? '<p style="font-size: 12px; color: var(--text-muted);">Belum ada pemain di tim ini</p>' : ""}
                    </div>
                    <div>
                        <p style="font-size: 12px; font-weight: 600; color: #fbbf24; margin-bottom: 4px;">${teamB} (skor: <span id="scoreBDisplay">0</span> gol):</p>
                        ${playersB
                          .map(
                            (p) => `
                            <div style="display: flex; align-items: center; gap: 8px; font-size: 13px; padding: 4px 0; flex-wrap: wrap;">
                                <span style="min-width: 100px;">${p.name}</span>
                                <span style="font-size: 11px; color: var(--text-muted); min-width: 55px;">(${p.category} ${p.class})</span>
                                <span style="font-size: 11px; color: var(--text-muted);">⚽</span>
                                <input type="number" class="scorer-input" data-team="${teamB}" data-player-id="${p.id}" data-player-name="${p.name}" 
                                       value="0" min="0" max="10" style="width: 50px; padding: 4px 6px; background: var(--bg-input); border: 1.5px solid var(--border-color); border-radius: 6px; color: var(--text-primary); font-size: 14px; text-align: center;" 
                                       oninput="updateScorerTotals()">
                                <span style="font-size: 11px; color: var(--text-muted);">gol</span>
                            </div>
                        `,
                          )
                          .join("")}
                        ${playersB.length === 0 ? '<p style="font-size: 12px; color: var(--text-muted);">Belum ada pemain di tim ini</p>' : ""}
                    </div>
                </div>
                <div style="margin-top: 8px; font-size: 12px; color: var(--text-muted); display: flex; gap: 16px; flex-wrap: wrap;">
                    <span>✅ Total gol: <strong id="totalCheckedGoals">0</strong></span>
                    <span>📊 Skor total: <strong id="totalScoreDisplay">0</strong></span>
                    <span id="scoreMatchStatus" style="color: #fbbf24;">⚠️ Jumlah gol belum sama dengan skor</span>
                </div>
            </div>
        `;
  }

  let totalMatchesCount = 0;
  roundKeys.forEach((key) => {
    totalMatchesCount += matchesObj[key].length;
  });

  let done = 0;
  for (let i = 0; i < currentRound; i++) {
    const key = `round_${i}`;
    done += (matchesObj[key] || []).length;
  }
  done += currentMatch;

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
                <input type="number" id="scoreA" value="0" min="0" max="99" oninput="updateScorerTotals()">
                <span class="vs-text">⚽</span>
                <input type="number" id="scoreB" value="0" min="0" max="99" oninput="updateScorerTotals()">
            </div>
            
            ${scorersHTML}
            
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

// ============================================
// UPDATE SCORER TOTALS - HITUNG TOTAL GOL DARI INPUT
// ============================================
function updateScorerTotals() {
  const scoreA = parseInt(document.getElementById("scoreA")?.value) || 0;
  const scoreB = parseInt(document.getElementById("scoreB")?.value) || 0;
  const totalScore = scoreA + scoreB;

  // Update display skor
  const scoreADisplay = document.getElementById("scoreADisplay");
  const scoreBDisplay = document.getElementById("scoreBDisplay");
  if (scoreADisplay) scoreADisplay.textContent = scoreA;
  if (scoreBDisplay) scoreBDisplay.textContent = scoreB;

  // Hitung total gol dari semua input
  const inputs = document.querySelectorAll(".scorer-input");
  let totalGoals = 0;
  inputs.forEach((input) => {
    const val = parseInt(input.value) || 0;
    if (val > 0) totalGoals += val;
  });

  // Update display total
  const totalCheckedGoals = document.getElementById("totalCheckedGoals");
  const totalScoreDisplay = document.getElementById("totalScoreDisplay");
  const scoreMatchStatus = document.getElementById("scoreMatchStatus");

  if (totalCheckedGoals) totalCheckedGoals.textContent = totalGoals;
  if (totalScoreDisplay) totalScoreDisplay.textContent = totalScore;

  // Cek apakah total gol sama dengan skor
  if (scoreMatchStatus) {
    if (totalGoals === totalScore) {
      scoreMatchStatus.innerHTML = "✅ Jumlah gol sudah sesuai dengan skor!";
      scoreMatchStatus.style.color = "#10b981";
    } else if (totalGoals > totalScore) {
      scoreMatchStatus.innerHTML = `⚠️ Total gol (${totalGoals}) melebihi skor (${totalScore})! Kurangi beberapa gol.`;
      scoreMatchStatus.style.color = "#ef4444";
    } else {
      scoreMatchStatus.innerHTML = `⚠️ Jumlah gol (${totalGoals}) belum sama dengan skor (${totalScore})! Tambahkan gol.`;
      scoreMatchStatus.style.color = "#fbbf24";
    }
  }
}

// ============================================
// ON TEAM CHANGE - DIPANGGIL DARI DROPDOWN
// ============================================
function onTeamChange() {
  const teamSelector = document.getElementById("teamSelector");
  if (!teamSelector) return;

  selectedTeamForPlayer = teamSelector.value;

  const teamSelectorBadge = document.getElementById("teamSelectorBadge");
  if (teamSelectorBadge) {
    teamSelectorBadge.textContent = `Tim: ${selectedTeamForPlayer || "-"}`;
  }

  updatePlayerUI();
}
// ============================================
// UPDATE CLASS OPTIONS - DINAMIS SESUAI KATEGORI
// ============================================
function updateClassOptions() {
  const categorySelect = document.getElementById("playerCategoryInput");
  const classSelect = document.getElementById("playerClassInput");

  if (!categorySelect || !classSelect) return;

  const category = categorySelect.value;

  // Kosongkan dropdown kelas
  classSelect.innerHTML = "";

  let classes = [];
  if (category === "SD") {
    classes = ["4", "5", "6"];
  } else if (category === "SMP") {
    classes = ["7", "8", "9"];
  }

  // Tambahkan option ke dropdown kelas
  classes.forEach((cls) => {
    const option = document.createElement("option");
    option.value = cls;
    option.textContent = cls;
    classSelect.appendChild(option);
  });
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

  const matchesObj = groupMatches[groupName] || {};
  const roundKeys = Object.keys(matchesObj).sort();

  if (roundKeys.length === 0) {
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

  roundKeys.forEach((roundKey, roundIdx) => {
    const round = matchesObj[roundKey] || [];
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
// PLAYER MANAGEMENT FUNCTIONS
// ============================================

// Load player data dari Firestore
function loadPlayerData() {
  console.log("👥 Loading player data...");

  // Ambil nama grup yang sedang dipilih
  const groupName = getCurrentGroupName();
  if (!groupName) {
    // Kalo ga ada grup, sembunyikan section pemain
    const playerManagement = document.getElementById("playerManagement");
    if (playerManagement) playerManagement.style.display = "none";
    return;
  }

  // Ambil daftar tim di grup ini
  const teams = groupTeams[groupName] || [];
  if (teams.length === 0) {
    const playerManagement = document.getElementById("playerManagement");
    if (playerManagement) playerManagement.style.display = "none";
    return;
  }

  // Tampilkan section pemain
  const playerManagement = document.getElementById("playerManagement");
  if (playerManagement) playerManagement.style.display = "block";

  // Update dropdown pilih tim
  updateTeamSelector(teams);

  // Set default tim (pilih tim pertama)
  if (!selectedTeamForPlayer || !teams.includes(selectedTeamForPlayer)) {
    selectedTeamForPlayer = teams[0];
  }

  // Set value di dropdown
  const teamSelector = document.getElementById("teamSelector");
  const teamSelectorBadge = document.getElementById("teamSelectorBadge");
  if (teamSelector) teamSelector.value = selectedTeamForPlayer;
  if (teamSelectorBadge)
    teamSelectorBadge.textContent = `Tim: ${selectedTeamForPlayer}`;

  // Render daftar pemain
  updatePlayerUI();
  updateClassOptions();
}

function updateTeamSelector(teams) {
  const teamSelector = document.getElementById("teamSelector");
  if (!teamSelector) return;

  // Kosongkan dropdown
  teamSelector.innerHTML = '<option value="">-- Pilih Tim --</option>';

  // Tambahkan option untuk setiap tim
  teams.forEach((team) => {
    const option = document.createElement("option");
    option.value = team;
    option.textContent = team;
    teamSelector.appendChild(option);
  });
}

// Update daftar pemain di UI
function updatePlayerUI() {
  const groupName = getCurrentGroupName();
  const teamName = selectedTeamForPlayer || getCurrentTeamName();
  const playerList = document.getElementById("playerList");
  const playerCount = document.getElementById("playerCount");

  // Kalo ga ada grup atau tim, kosongkan
  if (
    !groupName ||
    !teamName ||
    !groupPlayers[groupName] ||
    !groupPlayers[groupName][teamName]
  ) {
    if (playerCount) playerCount.textContent = "0 pemain";
    if (playerList) {
      playerList.innerHTML = `
                <div class="empty-state" style="padding:20px;">
                    <span class="empty-icon">👤</span>
                    <h3>Belum ada pemain</h3>
                    <p>Tambah pemain untuk tim ini</p>
                </div>
            `;
    }
    return;
  }

  // Ambil daftar pemain dari tim yang dipilih
  const players = groupPlayers[groupName][teamName] || [];
  if (playerCount) playerCount.textContent = `${players.length} pemain`;

  // Kalo ga ada pemain
  if (players.length === 0) {
    playerList.innerHTML = `
            <div class="empty-state" style="padding:20px;">
                <span class="empty-icon">👤</span>
                <h3>Belum ada pemain</h3>
                <p>Tambah pemain untuk tim ini</p>
            </div>
        `;
    return;
  }

  // Render daftar pemain
  let html = "";
  players.forEach((player, index) => {
    const categoryClass = player.category.toLowerCase();
    html += `
            <div class="player-item">
                <div class="player-info">
                    <span style="color:var(--text-muted); font-size:12px; min-width:25px;">${index + 1}.</span>
                    <span class="player-name">${player.name}</span>
                    <span class="player-badge ${categoryClass}">${player.category}</span>
                    <span style="font-size:12px; color:var(--text-muted);">Kelas ${player.class}</span>
                    <span class="player-goals">⚽ <strong>${player.goals || 0}</strong> gol</span>
                </div>
                <button class="player-delete" onclick="deletePlayer('${player.id}')" title="Hapus pemain">✕</button>
            </div>
        `;
  });

  playerList.innerHTML = html;
}

// Helper: ambil nama tim pertama dari grup
function getCurrentTeamName() {
  const groupName = getCurrentGroupName();
  if (!groupName) return null;
  const teams = groupTeams[groupName] || [];
  if (teams.length === 0) return null;
  return teams[0];
}

function addPlayer() {
  const groupName = getCurrentGroupName();
  const teamName = selectedTeamForPlayer || getCurrentTeamName();

  // Validasi
  if (!groupName || !teamName) {
    showToast("⚠️ Pilih grup dan tim terlebih dahulu!", "warning");
    return;
  }

  // Ambil nilai dari form
  const nameInput = document.getElementById("playerNameInput");
  const categoryInput = document.getElementById("playerCategoryInput");
  const classInput = document.getElementById("playerClassInput");

  const name = nameInput.value.trim();
  const category = categoryInput.value;
  const classVal = classInput.value;

  // Validasi nama
  if (!name) {
    showToast("⚠️ Masukkan nama pemain!", "warning");
    nameInput.focus();
    return;
  }

  // Generate ID unik
  const id = `p_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

  // Inisialisasi struktur data
  if (!groupPlayers[groupName]) groupPlayers[groupName] = {};
  if (!groupPlayers[groupName][teamName])
    groupPlayers[groupName][teamName] = [];

  // Tambah pemain
  groupPlayers[groupName][teamName].push({
    id: id,
    name: name,
    category: category,
    class: classVal,
    goals: 0, // Gol awal 0
  });

  // Reset form
  nameInput.value = "";
  nameInput.focus();

  // Update UI & save
  updatePlayerUI();
  savePlayerData();
  showToast(`✅ ${name} berhasil ditambahkan!`, "success");
}

// Hapus pemain dari tim
function deletePlayer(playerId) {
  if (!confirm("Hapus pemain ini?")) return;

  const groupName = getCurrentGroupName();
  const teamName = selectedTeamForPlayer || getCurrentTeamName();

  if (!groupName || !teamName) return;

  const players = groupPlayers[groupName]?.[teamName] || [];
  const index = players.findIndex((p) => p.id === playerId);

  if (index === -1) return;

  const playerName = players[index].name;
  players.splice(index, 1);

  updatePlayerUI();
  savePlayerData();
  showToast(`🗑️ ${playerName} dihapus`, "info");
}

// Simpan data pemain ke Firebase
function savePlayerData() {
  console.log("💾 Saving player data...");

  // Data yang akan disimpan (merge dengan data yang sudah ada)
  const data = {
    groupPlayers: groupPlayers,
    groupGoalScorers: groupGoalScorers,
    updatedAt: new Date().toISOString(),
  };

  db.collection("groups")
    .doc("data")
    .set(data, { merge: true })
    .then(() => {
      console.log("✅ Player data saved");
    })
    .catch((err) => {
      console.error("❌ Error saving players:", err);
      showToast("⚠️ Gagal menyimpan data pemain!", "error");
    });
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
