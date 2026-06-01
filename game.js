// ---------- ZONES (the full journey) ----------
const zones = [
    "Seed Patch","Bean Field","Forest Floor","Forest Canopy","Backyard",
    "Main Street","City Skyline","Skyscraper Roof","Cloud Bridge","Cloud Layer",
    "High Clouds","Wind Corridor","Airplane Route","Jet Stream","Upper Atmosphere",
    "Stratosphere","Mesosphere","Thermosphere","Exosphere","Low Orbit",
    "Satellite Belt","Earth Orbit","Lunar Route","Lunar Zone","Moon Surface",
    "Dark Side of the Moon","Asteroid Belt","Asteroid Highway","Mars Approach","Mars Orbit",
    "Martian Frontier","Outer Planet Route","Ring World","Deep Space","Nebula Edge",
    "Cosmic Clouds","Stellar Nursery","Star Cluster","Supernova Remnant","Galactic Rim",
    "Galactic Highway","Galactic Center","Galactic Core","Intergalactic Void",
    "Cosmic Nexus","Quantum Realm","Black Hole Edge","Universal Throne","Beanfinity",
    "The End..."
];

// Game state
let gas = 0;
let power = 1;
let autoCount = 0;
let autoGasPerSec = 1;
let zoneIndex = 0;
let cutscenePlaying = false;
let gameInterval = null;

// DOM elements
const gasEl = document.getElementById("gas");
const powerEl = document.getElementById("power");
const zoneEl = document.getElementById("zone");
const autoCountEl = document.getElementById("autoCount");
const autoPerSecEl = document.getElementById("autoPerSec");
const zoneFill = document.getElementById("zoneFill");
const cutsceneDiv = document.getElementById("cutsceneOverlay");
const cutsceneMsgSpan = document.getElementById("cutsceneMsg");

// Live player counters (simulated)
let currentPlayersOnline = 3;
let totalPlayersAllTime = 0;
const currentPlayersEl = document.getElementById("currentPlayers");
const totalPlayersAllTimeEl = document.getElementById("totalPlayersAllTime");

// Helper: update all UI + save
function updateUI() {
    gasEl.textContent = Math.floor(gas);
    powerEl.textContent = power;
    zoneEl.textContent = zones[zoneIndex];
    autoCountEl.textContent = autoCount;
    let totalAutoProd = autoCount * autoGasPerSec;
    autoPerSecEl.textContent = totalAutoProd;
    let progressPercent = (gas % 100) / 100 * 100;
    zoneFill.style.width = `${progressPercent}%`;
    saveGame();
}

// Zone advancement logic (triggers cutscene when reaching final zone first time)
function recalcZone() {
    let newZone = Math.floor(gas / 100);
    if (newZone >= zones.length - 1 && zoneIndex !== zones.length - 1 && !cutscenePlaying) {
        zoneIndex = zones.length - 1;
        updateUI();
        triggerEndCutscene();
        return;
    }
    if (newZone > zoneIndex && newZone < zones.length) {
        zoneIndex = newZone;
        updateUI();
    } else if (zoneIndex === zones.length - 1) {
        if (zoneIndex !== zones.length - 1) zoneIndex = zones.length - 1;
        updateUI();
    } else {
        updateUI();
    }
}

// Add gas (main resource)
function addGas(amount) {
    if (cutscenePlaying) return;
    gas += amount;
    if (gas < 0) gas = 0;
    recalcZone();
    updateUI();
    saveGame();
}

// Upgrades
function buyPowerUpgrade() {
    if (cutscenePlaying) return false;
    const cost = 50;
    if (gas >= cost) {
        gas -= cost;
        power++;
        updateUI();
        recalcZone();
        return true;
    }
    return false;
}

function buyMegaPower() {
    if (cutscenePlaying) return false;
    const cost = 200;
    if (gas >= cost) {
        gas -= cost;
        power += 5;
        updateUI();
        recalcZone();
        return true;
    }
    return false;
}

function buyAutoBot() {
    if (cutscenePlaying) return false;
    const cost = 120;
    if (gas >= cost) {
        gas -= cost;
        autoCount++;
        updateUI();
        recalcZone();
        return true;
    }
    return false;
}

function upgradeAutoEfficiency() {
    if (cutscenePlaying) return false;
    const cost = 300;
    if (gas >= cost) {
        gas -= cost;
        autoGasPerSec++;
        updateUI();
        recalcZone();
        return true;
    }
    return false;
}

// Epic final cutscene
async function triggerEndCutscene() {
    if (cutscenePlaying) return;
    cutscenePlaying = true;
    cutsceneDiv.style.display = "flex";
    // Disable interactive elements
    document.getElementById("beanBtn").disabled = true;
    const btns = ["upgradePowerBtn","megaPowerBtn","autoBuyBtn","autoUpgradeBtn"];
    btns.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.pointerEvents = "none";
    });
    
    const messages = [
        "✨ Congratulations... you reached the end. ✨",
        "🌌 ...or so you think. 🌌",
        "💠 A crack in reality appears... 💠",
        "🌀 The Void has awakened. The cosmos shivers. 🌀"
    ];
    for (let msg of messages) {
        cutsceneMsgSpan.textContent = msg;
        await wait(2800);
    }
    // Transcendent reward
    gas += 1000;
    power += 10;
    autoCount += 3;
    autoGasPerSec += 2;
    zoneIndex = zones.length - 1;
    updateUI();
    cutsceneMsgSpan.textContent = "⚡ THE BEYOND ACCEPTS YOU ⚡";
    await wait(1800);
    cutsceneDiv.style.display = "none";
    cutscenePlaying = false;
    document.getElementById("beanBtn").disabled = false;
    btns.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.pointerEvents = "auto";
    });
    saveGame();
    localStorage.setItem("beanCutsceneDone", "true");
    updateUI();
}

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Auto-production loop (every second)
function startProduction() {
    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(() => {
        if (!cutscenePlaying) {
            let production = autoCount * autoGasPerSec;
            if (production > 0) {
                gas += production;
                recalcZone();
                updateUI();
                saveGame();
            }
        }
    }, 1000);
}

// Save & Load (localStorage)
function saveGame() {
    const saveData = {
        gas: gas,
        power: power,
        zoneIndex: zoneIndex,
        autoCount: autoCount,
        autoGasPerSec: autoGasPerSec
    };
    localStorage.setItem("beanAscensionSave", JSON.stringify(saveData));
}

function loadGame() {
    const raw = localStorage.getItem("beanAscensionSave");
    if (raw) {
        try {
            const data = JSON.parse(raw);
            gas = data.gas ?? 0;
            power = data.power ?? 1;
            zoneIndex = data.zoneIndex ?? 0;
            autoCount = data.autoCount ?? 0;
            autoGasPerSec = data.autoGasPerSec ?? 1;
            if (zoneIndex >= zones.length) zoneIndex = zones.length - 1;
            updateUI();
            recalcZone();
        } catch(e) { console.warn(e); }
    } else {
        gas = 0;
        power = 1;
        zoneIndex = 0;
        autoCount = 0;
        autoGasPerSec = 1;
        updateUI();
    }
    // Avoid replaying cutscene on load if already at final zone
    if (zoneIndex === zones.length - 1 && !localStorage.getItem("beanCutsceneDone")) {
        localStorage.setItem("beanCutsceneDone", "true");
    }
}

// Live player counters (updates every 10 seconds)
function initLiveCounters() {
    let storedTotal = localStorage.getItem("beanTotalPlayersAllTime");
    if (storedTotal && !isNaN(parseInt(storedTotal))) {
        totalPlayersAllTime = parseInt(storedTotal);
    } else {
        totalPlayersAllTime = 874;
    }
    currentPlayersOnline = Math.floor(Math.random() * 15) + 4;
    updateLiveDisplay();

    setInterval(() => {
        if (!cutscenePlaying) {
            let deltaCurrent = Math.floor(Math.random() * 7) - 2;
            currentPlayersOnline += deltaCurrent;
            if (currentPlayersOnline < 2) currentPlayersOnline = 2;
            if (currentPlayersOnline > 42) currentPlayersOnline = 42;
            let newMasters = Math.floor(Math.random() * 7) + 1;
            totalPlayersAllTime += newMasters;
            localStorage.setItem("beanTotalPlayersAllTime", totalPlayersAllTime);
            updateLiveDisplay();
        }
    }, 10000);
}

function updateLiveDisplay() {
    currentPlayersEl.textContent = currentPlayersOnline;
    totalPlayersAllTimeEl.textContent = totalPlayersAllTime.toLocaleString();
}

// Click handler with critical hit chance
function clickBeanHandler() {
    if (cutscenePlaying) return;
    let gain = power;
    if (Math.random() < 0.12) {
        gain = Math.floor(power * 2.5);
        const beanBtn = document.getElementById("beanBtn");
        beanBtn.style.transform = "scale(0.96)";
        setTimeout(() => { if(beanBtn) beanBtn.style.transform = ""; }, 100);
    }
    addGas(gain);
}

// Bind event listeners
function bindEvents() {
    document.getElementById("beanBtn").onclick = clickBeanHandler;
    document.getElementById("upgradePowerBtn").onclick = () => { buyPowerUpgrade(); updateUI(); };
    document.getElementById("megaPowerBtn").onclick = () => { buyMegaPower(); updateUI(); };
    document.getElementById("autoBuyBtn").onclick = () => { buyAutoBot(); updateUI(); };
    document.getElementById("autoUpgradeBtn").onclick = () => { upgradeAutoEfficiency(); updateUI(); };
}

// Initialize everything when DOM is ready
window.addEventListener("DOMContentLoaded", () => {
    loadGame();
    bindEvents();
    startProduction();
    initLiveCounters();
    updateUI();
});
