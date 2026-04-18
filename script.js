let teams = [];
let matches = [];
let currentRound = 0;
let currentMatch = 0;
let previousRank = {};

// HISTORY untuk fitur UNDO
let historyStack = []; // Menyimpan state sebelum submit

// Fungsi untuk menyimpan state saat ini ke history
function saveToHistory() {
  // Simpan snapshot data sebelum perubahan
  const snapshot = {
    teams: JSON.parse(JSON.stringify(teams)), // Deep copy
    currentRound: currentRound,
    currentMatch: currentMatch,
    previousRank: JSON.parse(JSON.stringify(previousRank)),
  };
  historyStack.push(snapshot);

  // Batasi history maksimal 50 langkah
  if (historyStack.length > 50) {
    historyStack.shift();
  }

  console.log("History tersimpan, total history:", historyStack.length);
}

// Fungsi UNDO
function undoLastMatch() {
  if (historyStack.length === 0) {
    alert("Tidak ada yang bisa di-undo!");
    return false;
  }

  const lastState = historyStack.pop();

  // Restore data
  teams = lastState.teams;
  currentRound = lastState.currentRound;
  currentMatch = lastState.currentMatch;
  previousRank = lastState.previousRank;

  // Update tampilan
  updateStandings();
  showMatch();

  console.log("Undo berhasil! History tersisa:", historyStack.length);
  return true;
}

// Fungsi untuk menyimpan data ke localStorage
function saveData() {
  const dataToSave = {
    teams: teams,
    matches: matches,
    currentRound: currentRound,
    currentMatch: currentMatch,
    previousRank: previousRank,
    historyStack: historyStack, // Simpan history juga
    lastUpdated: new Date().toISOString(),
  };
  localStorage.setItem("leagueData", JSON.stringify(dataToSave));
  console.log("Data tersimpan:", dataToSave.lastUpdated);
}

// Fungsi untuk memuat data dari localStorage
function loadData() {
  const savedData = localStorage.getItem("leagueData");

  if (savedData) {
    try {
      const data = JSON.parse(savedData);

      // Pastikan data lengkap sebelum dimuat
      if (
        data.teams &&
        data.matches &&
        typeof data.currentRound !== "undefined" &&
        typeof data.currentMatch !== "undefined"
      ) {
        teams = data.teams;
        matches = data.matches;
        currentRound = data.currentRound;
        currentMatch = data.currentMatch;
        previousRank = data.previousRank || {};
        historyStack = data.historyStack || []; // Load history

        updateStandings();
        showMatch();

        console.log("Data dimuat dari localStorage");
        return true;
      }
    } catch (e) {
      console.error("Gagal memuat data:", e);
    }
  }
  return false;
}

// Fungsi untuk menghapus data (reset liga)
function clearData() {
  localStorage.removeItem("leagueData");
  historyStack = []; // Kosongkan history
  console.log("Data localStorage dihapus");
}

function generateLeague() {
  const input = document.getElementById("teamsInput").value;
  const teamNames = input.split("\n").filter((t) => t.trim() !== "");

  if (teamNames.length < 2) {
    alert("Minimal 2 tim!");
    return;
  }

  teams = teamNames.map((name) => ({
    name: name.trim(),
    played: 0,
    win: 0,
    draw: 0,
    loss: 0,
    gf: 0,
    ga: 0,
    points: 0,
  }));

  // Hapus data lama saat generate baru
  clearData();

  generateMatches();
  currentRound = 0;
  currentMatch = 0;
  previousRank = {};
  historyStack = []; // Reset history

  updateStandings();
  showMatch();

  // Simpan data setelah generate
  saveData();
}

function generateMatches() {
  matches = [];
  const totalPutaran = 2;

  for (let p = 0; p < totalPutaran; p++) {
    let putaranMatches = [];

    // Buat semua pasangan unik (i < j)
    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        if (p === 0) {
          putaranMatches.push({ home: i, away: j });
        } else {
          putaranMatches.push({ home: j, away: i });
        }
      }
    }

    // ACAK urutan pertandingan dalam putaran ini
    for (let i = putaranMatches.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [putaranMatches[i], putaranMatches[j]] = [
        putaranMatches[j],
        putaranMatches[i],
      ];
    }

    matches.push(putaranMatches);
  }

  // Debug: cek jadwal hasil acakan
  console.log("=== JADWAL SETELAH DIACAK ===");
  for (let p = 0; p < matches.length; p++) {
    console.log(`Putaran ${p + 1}:`);
    for (let m of matches[p]) {
      console.log(`  ${teams[m.home].name} vs ${teams[m.away].name}`);
    }

    let countPerTim = Array(teams.length).fill(0);
    for (let m of matches[p]) {
      countPerTim[m.home]++;
      countPerTim[m.away]++;
    }
    console.log(`  Jumlah main per tim: ${countPerTim}`);
  }
}

function updateStandings() {
  const tbody = document.querySelector("#standingsTable tbody");
  if (!tbody) return;

  tbody.innerHTML = "";

  const sortedTeams = [...teams];

  sortedTeams.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;

    const gdA = a.gf - a.ga;
    const gdB = b.gf - b.ga;

    if (gdB !== gdA) return gdB - gdA;

    return b.gf - a.gf;
  });

  sortedTeams.forEach((team, index) => {
    let color = "white";
    let arrow = "";

    const prev = previousRank[team.name];

    if (prev !== undefined) {
      if (index < prev) {
        color = "#22c55e";
        arrow = " ↑";
      } else if (index > prev) {
        color = "#ef4444";
        arrow = " ↓";
      }
    }

    const row = `
      <tr style="color: ${color}">
        <td>${index + 1}${arrow}</td>
        <td>${team.name}</td>
        <td>${team.played}</td>
        <td>${team.win}</td>
        <td>${team.draw}</td>
        <td>${team.loss}</td>
        <td>${team.gf}</td>
        <td>${team.ga}</td>
        <td>${team.points}</td>
      </tr>
    `;

    tbody.innerHTML += row;

    previousRank[team.name] = index;
  });

  // Simpan setiap kali standings diupdate
  saveData();
}

function showMatch() {
  const area = document.getElementById("matchArea");
  if (!area) return;

  if (currentRound >= matches.length) {
    area.innerHTML = `
      <div style="text-align: center; padding: 40px;">
        <h3>🏆 Liga Selesai! 🏆</h3>
        <div style="margin-top: 20px; display: flex; gap: 10px; justify-content: center;">
          <button onclick="resetLeague()" style="width: auto; padding: 10px 30px; background: #3b82f6;">
            🔄 Buat Liga Baru
          </button>
          <button onclick="undoLastMatch()" style="width: auto; padding: 10px 30px; background: #f59e0b;">
            ↩️ Undo
          </button>
        </div>
      </div>
    `;
    return;
  }

  const round = matches[currentRound];

  if (currentMatch >= round.length) {
    currentRound++;
    currentMatch = 0;
    showMatch();
    return;
  }

  const match = round[currentMatch];
  const teamA = teams[match.home];
  const teamB = teams[match.away];

  area.innerHTML = `
    <div style="text-align: center;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
        <button onclick="undoLastMatch()" style="width: auto; padding: 8px 16px; background: #f59e0b; margin: 0;">
          ↩️ Undo
        </button>
        <h3 style="margin: 0;">🎯 Putaran ${currentRound + 1} - Pertandingan ${currentMatch + 1} dari ${round.length}</h3>
        <div style="width: 80px;"></div>
      </div>
      <h4 style="font-size: 24px; margin: 20px 0;">⚽ ${teamA.name} vs ${teamB.name} ⚽</h4>
      <div class="match-inputs">
        <input type="number" id="scoreA" placeholder="0" value="0" min="0">
        <span>vs</span>
        <input type="number" id="scoreB" placeholder="0" value="0" min="0">
      </div>
      <div style="display: flex; gap: 10px; justify-content: center; margin-top: 20px;">
        <button onclick="submitScore()" style="width: auto; padding: 10px 30px; background: #22c55e;">
          ✅ Submit Skor
        </button>
        <button onclick="quickDraw()" style="width: auto; padding: 10px 30px; background: #3b82f6;">
          🤝 Draw (0-0)
        </button>
      </div>
    </div>
  `;
}

// Fitur quick draw untuk memudahkan testing
function quickDraw() {
  document.getElementById("scoreA").value = 0;
  document.getElementById("scoreB").value = 0;
  submitScore();
}

function submitScore() {
  const scoreA = parseInt(document.getElementById("scoreA").value);
  const scoreB = parseInt(document.getElementById("scoreB").value);

  if (isNaN(scoreA) || isNaN(scoreB)) {
    alert("Isi skor dulu!");
    return;
  }

  // SIMPAN KE HISTORY SEBELUM MERUBAH DATA
  saveToHistory();

  const match = matches[currentRound][currentMatch];
  const teamA = teams[match.home];
  const teamB = teams[match.away];

  teamA.played++;
  teamB.played++;

  teamA.gf += scoreA;
  teamA.ga += scoreB;

  teamB.gf += scoreB;
  teamB.ga += scoreA;

  if (scoreA > scoreB) {
    teamA.win++;
    teamB.loss++;
    teamA.points += 3;
  } else if (scoreA < scoreB) {
    teamB.win++;
    teamA.loss++;
    teamB.points += 3;
  } else {
    teamA.draw++;
    teamB.draw++;
    teamA.points += 1;
    teamB.points += 1;
  }

  currentMatch++;

  updateStandings();
  showMatch();

  // Simpan setelah submit score
  saveData();
}

// Fungsi untuk reset liga (opsional)
function resetLeague() {
  if (confirm("Yakin ingin mereset liga? Semua data akan hilang!")) {
    clearData();
    location.reload(); // Reload halaman untuk reset total
  }
}

// Fungsi untuk menampilkan info data tersimpan
function showSaveInfo() {
  const savedData = localStorage.getItem("leagueData");
  if (savedData) {
    const data = JSON.parse(savedData);
    console.log(
      `Data tersimpan: ${data.teams.length} tim, ${data.matches.length} putaran`,
    );
    console.log(
      `Progress: Round ${data.currentRound + 1}, Match ${data.currentMatch + 1}`,
    );
    console.log(`History tersedia: ${data.historyStack?.length || 0} langkah`);
  } else {
    console.log("Belum ada data tersimpan");
  }
}

// Auto-save setiap 30 detik (opsional)
setInterval(() => {
  if (teams.length > 0 && matches.length > 0) {
    saveData();
    console.log("Auto-save berjalan...");
  }
}, 30000);

// Keyboard shortcut untuk Undo (Ctrl+Z)
document.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === "z") {
    e.preventDefault();
    undoLastMatch();
  }
});

// Inisialisasi saat halaman dimuat
document.addEventListener("DOMContentLoaded", () => {
  // Coba load data yang tersimpan
  const hasData = loadData();

  if (!hasData) {
    // Jika tidak ada data, tampilkan form kosong
    document.getElementById("matchArea").innerHTML = `
      <div style="text-align: center; padding: 40px;">
        <p style="color: #94a3b8;">Belum ada liga yang berjalan</p>
        <p style="color: #22c55e; margin-top: 10px;">Silahkan generate liga baru di atas ⬆️</p>
      </div>
    `;
  }

  // Tambahkan tombol reset di UI (opsional)
  const container = document.querySelector(".container");
  if (container && !document.getElementById("resetBtn")) {
    const resetBtn = document.createElement("button");
    resetBtn.id = "resetBtn";
    resetBtn.textContent = "🗑️ Reset Semua Data";
    resetBtn.style.background = "#ef4444";
    resetBtn.style.marginTop = "10px";
    resetBtn.onclick = resetLeague;

    // Tambahkan di bawah tombol generate
    const generateBtn = document.querySelector("#generateBtn");
    if (generateBtn) {
      generateBtn.parentNode.appendChild(resetBtn);
    }
  }
});

// Tambahkan tombol generate di HTML jika belum ada
window.onload = function () {
  // Pastikan tombol generate ada
  const generateBtn = document.querySelector(
    "button[onclick='generateLeague()']",
  );
  if (generateBtn) {
    generateBtn.id = "generateBtn";
  }
};
