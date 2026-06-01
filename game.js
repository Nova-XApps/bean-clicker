// ---------- ZONES (full journey) ----------
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
let gameLoop = null;

// DOM elements
const gasEl = document.getElementById("gasCount");
const powerEl = document.getElementById("powerValue");
const zoneEl = document.getElementById("zoneName");
const botCountEl = document.getElementById("botCount");
const prodPerSecEl = document.getElementById("prodPerSec");
const progressFill = document.getElementById("progressFill");
const cutsceneDiv = document.getElementById("cutscene");
const cutsceneText = document.getElementById("cutsceneText");

// Helper: update UI and save
function updateUI() {
    gasEl.textContent = Math.floor(gas);
    powerEl.textContent = power;
    zoneEl.textContent = zones[zoneIndex];
    botCountEl.textContent = autoCount;
    let totalProd = autoCount * autoGasPerSec;
    prodPerSecEl.textContent = totalProd;
    let progressPercent = (gas % 100) / 100 * 100;
    progressFill.style.width = `${progressPercent}%`;
    saveGame();
}

// Zone advancement (triggers cutscene at final zone)
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

// Upgrade functions
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

// Final cutscene
async function triggerEndCutscene() {
    if (cutscenePlaying) return;
    cutscenePlaying = true;
    cutsceneDiv.classList.remove("hidden");
    const messages = [
        "✨ Congratulations... you reached the end. ✨",
        "🌌 ...or so you think. 🌌",
        "💠 A crack in reality appears... 💠",
        "🌀 The Void has awakened. The cosmos shivers. 🌀"
    ];
    for (let msg of messages) {
        cutsceneText.textContent = msg;
        await wait(2800);
    }
    gas += 1000;
    power += 10;
    autoCount += 3;
    autoGasPerSec += 2;
    zoneIndex = zones.length - 1;
    updateUI();
    cutsceneText.textContent = "⚡ THE BEYOND ACCEPTS YOU ⚡";
    await wait(1800);
    cutsceneDiv.classList.add("hidden");
    cutscenePlaying = false;
    saveGame();
    localStorage.setItem("beanCutsceneDone", "true");
}

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Auto-production every second
function startProduction() {
    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(() => {
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
    if (zoneIndex === zones.length - 1 && !localStorage.getItem("beanCutsceneDone")) {
        localStorage.setItem("beanCutsceneDone", "true");
    }
}

// Click handler with critical hit and visual feedback
function clickBeanHandler(e) {
    if (cutscenePlaying) return;
    let gain = power;
    // 12% chance for critical hit (2.5x power)
    if (Math.random() < 0.12) {
        gain = Math.floor(power * 2.5);
        const bean = document.getElementById("bean");
        bean.style.transform = "scale(0.9)";
        setTimeout(() => { if(bean) bean.style.transform = ""; }, 100);
    }
    addGas(gain);
    // Squash effect
    e.currentTarget.style.transform = "scale(0.95)";
    setTimeout(() => {
        if(e.currentTarget) e.currentTarget.style.transform = "";
    }, 80);
}

// Bind all event listeners (crucial for clickable bean)
function bindEvents() {
    const bean = document.getElementById("bean");
    if (bean) {
        bean.addEventListener("click", clickBeanHandler);
        console.log("Bean click listener attached successfully!");
    } else {
        console.error("Bean element not found!");
    }
    
    document.getElementById("upgradePower").onclick = () => buyPowerUpgrade();
    document.getElementById("upgradeMega").onclick = () => buyMegaPower();
    document.getElementById("buyAuto").onclick = () => buyAutoBot();
    document.getElementById("upgradeAuto").onclick = () => upgradeAutoEfficiency();
}

// Initialize game when DOM is fully loaded
window.addEventListener("DOMContentLoaded", () => {
    loadGame();
    bindEvents();
    startProduction();
    updateUI();
    console.log("Bean Ascension ready – click the giant bean!");
});
