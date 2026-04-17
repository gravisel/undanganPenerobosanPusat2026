// ========== ROUTING: ?to=admin → Dashboard, ?to=Nama → Undangan ==========
const params = new URLSearchParams(window.location.search);
const guest = params.get("to");

const dashboardWrap = document.getElementById("dashboardWrap");
const cover = document.getElementById("cover");
const main = document.getElementById("mainContent");

if (guest && guest.toLowerCase() === "admin") {
  // Mode admin: tampilkan dashboard (login dulu)
  if (cover) cover.classList.add("hidden");
  if (main) main.classList.add("hidden");
  if (dashboardWrap) dashboardWrap.classList.remove("hidden");
  document.body.classList.remove("overflow-hidden");

  // --- Dashboard: Password (ubah sesuai keinginan) ---
  const DASHBOARD_PASSWORD = "admin2026";
  const STORAGE_KEY = "ivory_dashboard_links";

  const dashboardLogin = document.getElementById("dashboardLogin");
  const dashboardPanel = document.getElementById("dashboardPanel");
  const dashboardPassword = document.getElementById("dashboardPassword");
  const dashboardLoginError = document.getElementById("dashboardLoginError");
  const dashboardLoginBtn = document.getElementById("dashboardLoginBtn");
  const dashboardLogout = document.getElementById("dashboardLogout");
  const dashboardGuestName = document.getElementById("dashboardGuestName");
  const dashboardGenerateBtn = document.getElementById("dashboardGenerateBtn");
  const dashboardGeneratedBox = document.getElementById("dashboardGeneratedBox");
  const dashboardGeneratedName = document.getElementById("dashboardGeneratedName");
  const dashboardGeneratedLink = document.getElementById("dashboardGeneratedLink");
  const dashboardCopyBtn = document.getElementById("dashboardCopyBtn");
  const dashboardLinkList = document.getElementById("dashboardLinkList");
  const dashboardLinkListEmpty = document.getElementById("dashboardLinkListEmpty");

  function getStoredLinks() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function saveLinks(links) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
  }

  function renderLinkList() {
    const links = getStoredLinks();
    if (dashboardLinkListEmpty) dashboardLinkListEmpty.classList.toggle("hidden", links.length > 0);
    if (!dashboardLinkList) return;
    dashboardLinkList.querySelectorAll(".dashboard-link-item").forEach(el => el.remove());
    links.forEach((item, i) => {
      const div = document.createElement("div");
      div.className = "dashboard-link-item flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10";
      div.innerHTML = `
        <div class="flex-1 min-w-0">
          <p class="text-white font-medium truncate">${escapeHtml(item.name)}</p>
          <p class="text-white/50 text-xs truncate">${escapeHtml(item.link)}</p>
        </div>
        <button type="button" class="dashboard-copy-item shrink-0 px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs transition-all" data-index="${i}">Salin</button>
      `;
      dashboardLinkList.appendChild(div);
    });
    dashboardLinkList.querySelectorAll(".dashboard-copy-item").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.getAttribute("data-index"), 10);
        const links = getStoredLinks();
        if (links[idx]) {
          copyToClipboard(links[idx].link);
          showDashboardToast("Link disalin!");
        }
      });
    });
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text);
    } else {
      const input = document.createElement("input");
      input.value = text;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
    }
  }

  function showDashboardToast(message) {
    const toast = document.getElementById("dashboardToast");
    if (!toast) return;
    const textEl = toast.querySelector("p");
    if (textEl) textEl.textContent = message;
    toast.classList.remove("opacity-0");
    toast.classList.add("pointer-events-none");
    clearTimeout(showDashboardToast._tid);
    showDashboardToast._tid = setTimeout(() => {
      toast.classList.add("opacity-0");
    }, 2000);
  }

  function showPanel() {
    if (dashboardLogin) dashboardLogin.classList.add("hidden");
    if (dashboardPanel) dashboardPanel.classList.remove("hidden");
    renderLinkList();
  }

  function showLogin() {
    if (dashboardPanel) dashboardPanel.classList.add("hidden");
    if (dashboardLogin) dashboardLogin.classList.remove("hidden");
    if (dashboardPassword) dashboardPassword.value = "";
    if (dashboardLoginError) dashboardLoginError.classList.add("hidden");
  }

  if (sessionStorage.getItem("dashboardAuth") === "1") {
    showPanel();
  } else {
    showLogin();
  }

  if (dashboardLoginBtn && dashboardPassword) {
    dashboardLoginBtn.addEventListener("click", () => {
      const pwd = dashboardPassword.value.trim();
      if (dashboardLoginError) dashboardLoginError.classList.add("hidden");
      if (pwd === DASHBOARD_PASSWORD) {
        sessionStorage.setItem("dashboardAuth", "1");
        showPanel();
      } else {
        if (dashboardLoginError) {
          dashboardLoginError.classList.remove("hidden");
          dashboardLoginError.textContent = "Password salah.";
        }
      }
    });
    dashboardPassword.addEventListener("keydown", (e) => {
      if (e.key === "Enter") dashboardLoginBtn.click();
    });
  }

  if (dashboardLogout) {
    dashboardLogout.addEventListener("click", () => {
      sessionStorage.removeItem("dashboardAuth");
      showLogin();
    });
  }

  if (dashboardGenerateBtn && dashboardGuestName) {
    dashboardGenerateBtn.addEventListener("click", () => {
      const name = dashboardGuestName.value.trim();
      if (!name) {
        showDashboardToast("Masukkan nama tamu.");
        return;
      }
      const baseUrl = window.location.origin + window.location.pathname;
      const link = baseUrl + "?to=" + encodeURIComponent(name);
      if (dashboardGeneratedName) dashboardGeneratedName.textContent = name;
      if (dashboardGeneratedLink) dashboardGeneratedLink.value = link;
      if (dashboardGeneratedBox) dashboardGeneratedBox.classList.remove("hidden");
      const links = getStoredLinks();
      links.unshift({ name, link });
      saveLinks(links);
      renderLinkList();
      copyToClipboard(link);
      showDashboardToast("Link disalin ke clipboard!");
    });
  }

  if (dashboardCopyBtn && dashboardGeneratedLink) {
    dashboardCopyBtn.addEventListener("click", () => {
      copyToClipboard(dashboardGeneratedLink.value);
      showDashboardToast("Link disalin!");
    });
  }
} else {
  // Mode undangan biasa
  if (guest) {
    const formattedName = guest.replace(/\+/g, " ");
    const guestEl = document.getElementById("guestName");
    if (guestEl) guestEl.textContent = formattedName;
  }

  const btnOpen = document.getElementById("openInvitation");
  const bgMusic = document.getElementById("bgMusic");
  document.body.classList.add("overflow-hidden");

  if (btnOpen) {
    btnOpen.addEventListener("click", () => {
      if (bgMusic) {
        bgMusic.volume = 0.5;
        bgMusic.play().catch(() => {});
      }
      if (cover) cover.classList.add("opacity-0", "scale-110");
      setTimeout(() => {
        if (cover) cover.classList.add("hidden");
        if (main) main.classList.remove("hidden");
        document.body.classList.remove("overflow-hidden");
      }, 700);
    });
  }

  // Mute / unmute musik (overlay di samping)
  const musicToggle = document.getElementById("musicToggle");
  const musicToggleIconOn = document.getElementById("musicToggleIconOn");
  const musicToggleIconOff = document.getElementById("musicToggleIconOff");
  if (musicToggle && bgMusic) {
    function updateMusicToggleUI() {
      const isMuted = bgMusic.muted;
      if (musicToggleIconOn) musicToggleIconOn.classList.toggle("hidden", isMuted);
      if (musicToggleIconOff) musicToggleIconOff.classList.toggle("hidden", !isMuted);
      musicToggle.setAttribute("aria-label", isMuted ? "Nyalakan musik" : "Matikan musik");
      musicToggle.setAttribute("title", isMuted ? "Nyalakan musik" : "Matikan musik");
    }
    musicToggle.addEventListener("click", () => {
      bgMusic.muted = !bgMusic.muted;
      updateMusicToggleUI();
    });
    updateMusicToggleUI();
  }
}



//animasi

const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const anim = entry.target.dataset.animate || "fade-up";
      entry.target.classList.add(`animate-${anim}`);

      observer.unobserve(entry.target); // animasi sekali
    });
  },
  {
    threshold: 0.5
  }
);

document.querySelectorAll(".animate-on-scroll").forEach(el => {
  observer.observe(el);
});

// Bottom navbar: klik icon scroll ke section
const bottomNavbar = document.getElementById("bottomNavbar");
const navButtons = document.querySelectorAll(".nav-btn");

// ambil semua section dari data-target
const sections = [...navButtons].map(btn =>
  document.querySelector(btn.dataset.target)
);

if (bottomNavbar) {
  bottomNavbar.addEventListener("click", (e) => {

    const btn = e.target.closest(".nav-btn");
    if (!btn) return;

    const targetId = btn.getAttribute("data-target");
    const section = document.querySelector(targetId);

    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    // set active saat diklik
    navButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

  });
}


// 🔥 Update active saat scroll
window.addEventListener("scroll", () => {

  let currentSection = "";

  sections.forEach(section => {

    if (!section) return;

    const top = section.getBoundingClientRect().top;

    if (top <= window.innerHeight * 0.4) {
      currentSection = section.id;
    }

  });

  if (currentSection) {

    navButtons.forEach(btn => {

      btn.classList.toggle(
        "active",
        btn.dataset.target === "#" + currentSection
      );

    });

  }

});



//countdown

const targetDate = new Date("2026-04-26T07:30:00").getTime();

const countdown = setInterval(() => {
  const now = new Date().getTime();
  const distance = targetDate - now;

  if (distance < 0) {
    clearInterval(countdown);
    document.getElementById("days").innerText = "00";
    document.getElementById("hours").innerText = "00";
    document.getElementById("minutes").innerText = "00";
    document.getElementById("seconds").innerText = "00";
    return;
  }

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  document.getElementById("days").innerText = days.toString().padStart(2, "0");
  document.getElementById("hours").innerText = hours.toString().padStart(2, "0");
  document.getElementById("minutes").innerText = minutes.toString().padStart(2, "0");
  document.getElementById("seconds").innerText = seconds.toString().padStart(2, "0");
}, 1000);


//our Galery
const images = document.querySelectorAll(".gallery-img");
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");
const downloadBtn = document.getElementById("downloadBtn");
const navbar = document.getElementById("bottomNavbar");
let isLightboxOpen = false;

let currentIndex = 0;
let scrollY = 0;

const imageSources = Array.from(images).map(img => img.src);

images.forEach((img, index) => {
  img.addEventListener("click", () => {
    currentIndex = index;
    openLightbox();
  });
});

function openLightbox() {

  isLightboxOpen = true; // 🔥 tambahkan ini

  scrollY = window.scrollY;
  document.body.style.position = "fixed";
  document.body.style.top = `-${scrollY}px`;
  document.body.style.width = "100%";

  lightbox.classList.remove("hidden");
  updateImage();

  navbar.classList.add("translate-y-24", "opacity-0", "pointer-events-none");

  history.pushState({ lightbox: true }, "");
}

function closeLightbox() {

  isLightboxOpen = false; // 🔥 tambahkan ini

  lightbox.classList.add("hidden");

  document.body.style.position = "";
  document.body.style.top = "";
  document.body.style.width = "";

  window.scrollTo(0, scrollY);

  navbar.classList.remove("translate-y-24", "opacity-0", "pointer-events-none");

  if (history.state?.lightbox) history.back();
}

function updateImage() {
  lightboxImg.src = imageSources[currentIndex];
  downloadBtn.href = imageSources[currentIndex];
}

function nextImage() {
  currentIndex = (currentIndex + 1) % imageSources.length;
  updateImage();
}

function prevImage() {
  currentIndex =
    (currentIndex - 1 + imageSources.length) % imageSources.length;
  updateImage();
}

// 🔥 Close dengan tombol ESC (bonus premium)
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !lightbox.classList.contains("hidden")) {
    closeLightbox();
  }

  if (e.key === "ArrowRight") nextImage();
  if (e.key === "ArrowLeft") prevImage();
});



// Kirim komentar
const API_URL = "https://script.google.com/macros/s/AKfycbxZ6TgnEslpSNpejudfcvZn4bh_QI9AKYF9fx4qM7wZL2-gXtYSo6IMHXDYUARH7kxU/exec"; // gunakan URL Web App


const nameInput = document.getElementById("nameUcapan");
const messageInput = document.getElementById("messageUcapan");
const sendBtn = document.getElementById("sendUcapan");
const statusUcapan = document.getElementById("statusUcapan");
const commentsEl = document.getElementById("comments");

// Kirim komentar
sendBtn.addEventListener("click", async () => {
  const name = nameInput.value.trim() || "Tamu Undangan";
  const message = messageInput.value.trim();

  if (!message) {
    statusUcapan.textContent = "Tulis komentarnya dulu 🙏";
    statusUcapan.className = "text-sm text-red-500";
    return;
  }

  // 🔒 DISABLE BUTTON
  sendBtn.disabled = true;
  sendBtn.textContent = "Mengirim...";
  sendBtn.classList.add("opacity-60", "cursor-not-allowed");

  statusUcapan.textContent = "Mengirim...";
  statusUcapan.className = "text-sm text-gray-500";

  const data = {
  name: name || "Tamu Undangan",
  message: message,
  timestamp: Date.now()
  };

  try {
    await fetch(API_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify(data)
    });

    statusUcapan.textContent = "Terkirim ✅";
    statusUcapan.className = "text-sm text-green-600";

    messageInput.value = "";
    nameInput.value = "";

    setTimeout(loadComments, 500);
  } catch (err) {
    statusUcapan.textContent = "Gagal mengirim ❌";
    statusUcapan.className = "text-sm text-red-500";
    console.error(err);
  } finally {
    // 🔓 AKTIFKAN LAGI
    setTimeout(() => {
      sendBtn.disabled = false;
      sendBtn.textContent = "Kirim";
      sendBtn.classList.remove("opacity-60", "cursor-not-allowed");
    }, 1200);
  }
});

// Ambil komentar
async function loadComments() {
  commentsEl.textContent = "Memuat komentar...";

  try {
    const res = await fetch(API_URL);
    const data = await res.json();

    if (!data.length) {
      commentsEl.textContent = "Belum ada komentar";
      return;
    }

    // 1️⃣ RENDER KOMENTAR (HTML)
    commentsEl.innerHTML = data.reverse().map((c, i) => `
      <div class="flex flex-col bg-grey-100 rounded-xl p-2 shadow-sm opacity-0 translate-y-4 transition-all duration-500 ease-out" style="transition-delay:${i * 60}ms">
        <div class="text-sm font-semibold text-gray-800">
          ${c.name || "Tamu Undangan"}
        </div>
        <div class="text-xs text-gray-400 mb-2">
          ${new Date(c.timestamp).toLocaleString("id-ID")}
        </div>
        <div class="text-gray-700 text-sm">
          ${c.message}
        </div>
      </div>
    `).join("");

    // 2️⃣ TRIGGER ANIMASI (INI WAJIB DI BAWAH innerHTML)
    requestAnimationFrame(() => {
      commentsEl.querySelectorAll("div").forEach(el => {
        el.classList.remove("opacity-0", "translate-y-4");
      });
    });

  } catch (err) {
    commentsEl.textContent = "Gagal memuat komentar.";
    console.error(err);
  }
}

// Load pertama
loadComments();

//shadow scroll koment
const scrollBox = document.getElementById("comment-scroll");
const shadowTop = document.getElementById("shadow-top");
const shadowBottom = document.getElementById("shadow-bottom");

function updateScrollShadows() {
  const scrollTop = scrollBox.scrollTop;
  const scrollHeight = scrollBox.scrollHeight;
  const clientHeight = scrollBox.clientHeight;

  // Shadow atas
  if (scrollTop > 0) {
    shadowTop.classList.remove("opacity-0");
    shadowTop.classList.add("opacity-100");
  } else {
    shadowTop.classList.add("opacity-0");
    shadowTop.classList.remove("opacity-100");
  }

  // Shadow bawah
  if (scrollTop + clientHeight < scrollHeight - 1) {
    shadowBottom.classList.remove("opacity-0");
    shadowBottom.classList.add("opacity-100");
  } else {
    shadowBottom.classList.add("opacity-0");
    shadowBottom.classList.remove("opacity-100");
  }
}

// update saat scroll
scrollBox.addEventListener("scroll", updateScrollShadows);

// update saat pertama load / setelah komentar masuk
updateScrollShadows();


//footer
document.getElementById("year").textContent = new Date().getFullYear();


//overlay button
// overlay button
let lastScrollY = window.scrollY;
let hideTimeout = null;

window.addEventListener("scroll", () => {

  const currentScroll = window.scrollY;

  // ==============================
  // 1️⃣ Update Active Section
  // ==============================
  let currentSection = "";

  sections.forEach(section => {
    if (!section) return;

    const top = section.getBoundingClientRect().top;

    if (top <= window.innerHeight * 0.4) {
      currentSection = section.id;
    }
  });

  if (currentSection && navButtons.length) {
    navButtons.forEach(btn => {
      btn.classList.toggle("active", btn.dataset.target === "#" + currentSection);
    });
  }

  // ==============================
  // 2️⃣ Hide / Show Navbar: scroll ke atas = hilang, scroll ke bawah = muncul
  // ==============================
  if (navbar && !isLightboxOpen) {

    const pageHeight = document.documentElement.scrollHeight;
    const viewportBottom = window.innerHeight + currentScroll;
  
    const isBottom = viewportBottom >= pageHeight - 10; // tolerance 10px
  
    if (isBottom) {
      // 🔥 jika sudah di bawah halaman
      navbar.classList.add("nav-hidden");
      navbar.classList.remove("nav-show");
    }
  
    else if (currentScroll < lastScrollY && currentScroll > 60) {
      // scroll ke atas → sembunyikan navbar
      clearTimeout(hideTimeout);
  
      hideTimeout = setTimeout(() => {
        navbar.classList.remove("nav-hidden");
        navbar.classList.add("nav-show");
      }, 150);
  
    } 
  
    else if (currentScroll > lastScrollY || currentScroll <= 60) {
      // scroll ke bawah atau di atas
      clearTimeout(hideTimeout);
  
      navbar.classList.add("nav-hidden");
      navbar.classList.remove("nav-show");
    }
  
  }
  
  lastScrollY = currentScroll;

});


  // ===== MOBILE KEYBOARD DETECTION =====
  if (window.visualViewport && navbar) {
    const initialHeight = window.visualViewport.height;
    window.visualViewport.addEventListener("resize", () => {
      const currentHeight = window.visualViewport.height;
      if (currentHeight < initialHeight - 100) {
        navbar.classList.add("nav-hidden");
      } else {
        navbar.classList.remove("nav-hidden");
        navbar.classList.add("nav-show");
      }
    });
  }