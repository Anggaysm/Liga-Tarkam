// ============================================
// SCRIPT.JS - LANDING PAGE + LOGIN (FIXED)
// ============================================

console.log("🚀 script.js loaded!");

// ============================================
// AUTH FUNCTIONS
// ============================================

// Cek status login saat halaman dimuat
function checkAuthState() {
  console.log("🔍 checkAuthState called!");
  const statusDiv = document.getElementById("authStatus");
  const loginCard = document.getElementById("loginCard");
  const adminLink = document.getElementById("adminLink");

  if (!auth) {
    console.error("❌ Auth not defined! Check firebase-config.js");
    return;
  }

  auth.onAuthStateChanged(
    (user) => {
      console.log(
        "👤 Auth state changed:",
        user ? "Logged in" : "Not logged in",
      );

      if (user) {
        // User sudah login
        if (statusDiv) {
          statusDiv.innerHTML = `
                    <span class="auth-status-logged-in">
                        ✅ Logged in as <strong>${user.email}</strong>
                        <button onclick="logout()" style="background:none; border:none; color:#10b981; cursor:pointer; font-weight:600; min-height:auto; min-width:auto; padding:0 8px;">
                            [Logout]
                        </button>
                    </span>
                `;
        }

        // Cek apakah user adalah admin
        checkUserRole(user.uid);
      } else {
        // User belum login
        if (statusDiv) {
          statusDiv.innerHTML = `
                    <span class="auth-status-logged-out">
                        🔒 Belum login
                    </span>
                `;
        }

        // Tampilkan login card
        if (loginCard) loginCard.style.display = "block";
        if (adminLink) {
          adminLink.style.opacity = "0.5";
          adminLink.style.pointerEvents = "none";
        }
      }
    },
    (error) => {
      console.error("❌ Auth state error:", error);
    },
  );
}

// Cek role user
async function checkUserRole(uid) {
  console.log("🔍 checkUserRole called for UID:", uid);
  const adminLink = document.getElementById("adminLink");

  try {
    const doc = await db.collection("users").doc(uid).get();
    if (doc.exists && doc.data().role === "admin") {
      console.log("✅ User is admin!");
      if (adminLink) {
        adminLink.style.opacity = "1";
        adminLink.style.pointerEvents = "auto";
        adminLink.textContent = "⚙️ Admin Panel";
      }

      const loginCard = document.getElementById("loginCard");
      if (loginCard) loginCard.style.display = "none";

      showToast("✅ Selamat datang Admin!", "success");
    } else {
      console.log("⚠️ User is NOT admin");
      if (adminLink) {
        adminLink.style.opacity = "0.5";
        adminLink.style.pointerEvents = "none";
        adminLink.textContent = "⚙️ (Bukan Admin)";
      }
      showToast("⚠️ Akun ini bukan admin", "warning");
    }
  } catch (error) {
    console.error("Error cek role:", error);
  }
}

// ============================================
// LOGIN FUNCTION - INI YANG DIPANGGIL TOMBOL
// ============================================
function login() {
  console.log("🔑 Login function called!");

  const email = document.getElementById("loginEmail");
  const password = document.getElementById("loginPassword");
  const errorDiv = document.getElementById("loginError");

  if (!email || !password) {
    console.error("❌ Email or password input not found!");
    return;
  }

  const emailValue = email.value.trim();
  const passwordValue = password.value.trim();

  console.log("📧 Email:", emailValue);
  console.log("🔑 Password length:", passwordValue.length);

  // Reset error
  if (errorDiv) {
    errorDiv.style.display = "none";
    errorDiv.textContent = "";
  }

  // Validasi
  if (!emailValue || !passwordValue) {
    if (errorDiv) {
      errorDiv.textContent = "⚠️ Email dan password harus diisi!";
      errorDiv.style.display = "block";
    }
    console.log("❌ Validation failed: empty fields");
    return;
  }

  // Show loading
  const btn = document.querySelector(".login-form button");
  if (!btn) {
    console.error("❌ Login button not found!");
    return;
  }

  const originalText = btn.innerHTML;
  btn.innerHTML = '<span class="spinner"></span> Loading...';
  btn.disabled = true;
  console.log("⏳ Loading...");

  // Login ke Firebase
  auth
    .signInWithEmailAndPassword(emailValue, passwordValue)
    .then((userCredential) => {
      console.log("✅ Login success!", userCredential.user.email);
      showToast("✅ Login berhasil!", "success");
      setTimeout(() => {
        window.location.href = "admin.html";
      }, 1000);
    })
    .catch((error) => {
      console.error("❌ Login error:", error.code, error.message);
      let message = "⚠️ Login gagal! ";
      if (error.code === "auth/user-not-found") {
        message += "Email tidak terdaftar.";
      } else if (error.code === "auth/wrong-password") {
        message += "Password salah.";
      } else if (error.code === "auth/too-many-requests") {
        message += "Terlalu banyak percobaan. Coba lagi nanti.";
      } else if (error.code === "auth/network-request-failed") {
        message += "Gagal koneksi ke server. Cek internet!";
      } else {
        message += error.message;
      }
      if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = "block";
      }

      btn.innerHTML = originalText;
      btn.disabled = false;
    });
}

// ============================================
// LOGOUT FUNCTION
// ============================================
function logout() {
  console.log("👋 Logout called");
  auth
    .signOut()
    .then(() => {
      showToast("👋 Logout berhasil!", "info");
      setTimeout(() => {
        window.location.reload();
      }, 500);
    })
    .catch((error) => {
      console.error("Logout error:", error);
      showToast("⚠️ Gagal logout!", "error");
    });
}

// ============================================
// TOAST NOTIFICATION
// ============================================
function showToast(message, type = "info") {
  console.log("📢 Toast:", message, "Type:", type);
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
// KEYBOARD SHORTCUT
// ============================================
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const active = document.activeElement;
    if (
      active &&
      (active.id === "loginEmail" || active.id === "loginPassword")
    ) {
      console.log("⌨️ Enter key pressed, calling login()");
      login();
    }
  }
});

// ============================================
// INIT - JALANKAN SAAT HALAMAN SIAP
// ============================================
document.addEventListener("DOMContentLoaded", function () {
  console.log("🚀 DOM loaded!");

  // Cek apakah Firebase sudah siap
  if (typeof firebaseConfig !== "undefined") {
    console.log("✅ Firebase config loaded!");
  } else {
    console.error("❌ Firebase config NOT loaded!");
  }

  if (typeof auth !== "undefined") {
    console.log("✅ Firebase auth loaded!");
  } else {
    console.error("❌ Firebase auth NOT loaded!");
  }

  checkAuthState();

  const emailInput = document.getElementById("loginEmail");
  if (emailInput) {
    emailInput.focus();
    console.log("👆 Focus on email input");
  } else {
    console.log("⚠️ Email input not found!");
  }

  console.log("⚽ Liga Warga v3.0 - Online");
  console.log("📱 Dibuat oleh Grup Tolongin 🚀");
});
