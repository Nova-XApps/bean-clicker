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

// Upgrade cost multipliers (scalable)
let powerUpgradeCost = 50;
let megaUpgradeCost = 200;
let autoBotCost = 120;
let turboCost = 300;

// DOM elements
const gasEl = document.getElementById("gasCount");
const powerEl = document.getElementById("powerValue");
const zoneEl = document.getElementById("zoneName");
const botCountEl = document.getElementById("botCount");
const prodPerSecEl = document.getElementById("prodPerSec");
const progressFill = document.getElementById("progressFill");
const cutsceneDiv = document.getElementById("cutscene");
const cutsceneText = document.getElementById("cutsceneText");
const zoneMessageDiv = document.getElementById("zoneMessage");

// Cost display spans
const powerCostSpan = document.getElementById("powerCost");
const megaCostSpan = document.getElementById("megaCost");
const autoCostSpan = document.getElementById("autoCost");
const turboCostSpan = document.getElementById("turboCost");

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
    
    // Update displayed costs
    powerCostSpan.textContent = powerUpgradeCost;
    megaCostSpan.textContent = megaUpgradeCost;
    autoCostSpan.textContent = autoBotCost;
    turboCostSpan.textContent = turboCost;
    
    saveGame();
}

// Zone change effect: background gradient, bean style, message
function applyZoneEffects() {
    const zoneNum = zoneIndex;
    const totalZones = zones.length;
    const progress = zoneNum / totalZones;
    
    // Dynamic background: from earthy brown to cosmic purple
    const hueStart = 30; // brown/orange
    const hueEnd = 280;  // purple
    const hue = hueStart + (hueEnd - hueStart) * progress;
    document.body.style.background = `radial-gradient(circle at 20% 30%, hsl(${hue}, 30%, 12%), hsl(${hue}, 40%, 5%))`;
    
    // Change bean emoji based on zone (fun effect)
    const bean = document.getElementById("bean");
    if (zoneNum < 5) bean.textContent = "🫘";
    else if (zoneNum < 15) bean.textContent = "🌱";
    else if (zoneNum < 25) bean.textContent = "🪐";
    else if (zoneNum < 35) bean.textContent = "✨";
    else bean.textContent = "🌀";
    
    // Show floating message
    zoneMessageDiv.textContent = `✦ ${zones[zoneIndex]} ✦`;
    zoneMessageDiv.classList.remove("hidden");
    setTimeout(() => {
        zoneMessageDiv.classList.add("hidden");
    }, 2000);
}

// Zone advancement logic
function recalcZone() {
    let newZone = Math.floor(gas / 100);
    if (newZone >= zones.length - 1 && zoneIndex !== zones.length - 1 && !cutscenePlaying) {
        zoneIndex = zones.length - 1;
        updateUI();
        applyZoneEffects();
        triggerEndCutscene();
        return;
    }
    if (newZone > zoneIndex && newZone < zones.length) {
        zoneIndex = newZone;
        updateUI();
        applyZoneEffects();
    } else if (zoneIndex === zones.length - 1) {
        if (zoneIndex !== zones.length - 1) zoneIndex = zones.length - 1;
        updateUI();
    } else {
        updateUI();
    }
}

function addGas(amount) {
    if (cutscenePlaying) return;
    gas += amount;
    if (gas < 0) gas = 0;
    recalcZone();
    updateUI();
    saveGame();
}

// ---------- SCALABLE UPGRADES ----------
function buyPowerUpgrade() {
    if (cutscenePlaying) return false;
    if (gas >= powerUpgradeCost) {
        gas -= powerUpgradeCost;
        power++;
        // Increase cost by 20% (scalable)
        powerUpgradeCost = Math.floor(powerUpgradeCost * 1.2);
        updateUI();
        recalcZone();
        return true;
    }
    return false;
}

function buyMegaPower() {
    if (cutscenePlaying) return false;
    if (gas >= megaUpgradeCost) {
        gas -= megaUpgradeCost;
        power += 5;
        megaUpgradeCost = Math.floor(megaUpgradeCost * 1.25);
        updateUI();
        recalcZone();
        return true;
    }
    return false;
}

function buyAutoBot() {
    if (cutscenePlaying) return false;
    if (gas >= autoBotCost) {
        gas -= autoBotCost;
        autoCount++;
        autoBotCost = Math.floor(autoBotCost * 1.15);
        updateUI();
        recalcZone();
        return true;
    }
    return false;
}

function upgradeAutoEfficiency() {
    if (cutscenePlaying) return false;
    if (gas >= turboCost) {
        gas -= turboCost;
        autoGasPerSec++;
        turboCost = Math.floor(turboCost * 1.2);
        updateUI();
        recalcZone();
        return true;
    }
    return false;
}

// ---------- FINAL CUTSCENE ----------
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
    applyZoneEffects();
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

// Auto-production loop
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

// Save & Load
function saveGame() {
    const saveData = {
        gas, power, zoneIndex, autoCount, autoGasPerSec,
        powerUpgradeCost, megaUpgradeCost, autoBotCost, turboCost
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
            powerUpgradeCost = data.powerUpgradeCost ?? 50;
            megaUpgradeCost = data.megaUpgradeCost ?? 200;
            autoBotCost = data.autoBotCost ?? 120;
            turboCost = data.turboCost ?? 300;
            if (zoneIndex >= zones.length) zoneIndex = zones.length - 1;
            updateUI();
            recalcZone();
            applyZoneEffects();
        } catch(e) { console.warn(e); }
    } else {
        resetGame();
    }
    if (zoneIndex === zones.length - 1 && !localStorage.getItem("beanCutsceneDone")) {
        localStorage.setItem("beanCutsceneDone", "true");
    }
}

function resetGame() {
    gas = 0;
    power = 1;
    zoneIndex = 0;
    autoCount = 0;
    autoGasPerSec = 1;
    powerUpgradeCost = 50;
    megaUpgradeCost = 200;
    autoBotCost = 120;
    turboCost = 300;
    updateUI();
    applyZoneEffects();
}

// Click handler
function clickBeanHandler(e) {
    if (cutscenePlaying) return;
    let gain = power;
    if (Math.random() < 0.12) {
        gain = Math.floor(power * 2.5);
        const bean = document.getElementById("bean");
        bean.style.transform = "scale(0.9)";
        setTimeout(() => { if(bean) bean.style.transform = ""; }, 100);
    }
    addGas(gain);
    e.currentTarget.style.transform = "scale(0.95)";
    setTimeout(() => {
        if(e.currentTarget) e.currentTarget.style.transform = "";
    }, 80);
}

// Bind events
function bindEvents() {
    const bean = document.getElementById("bean");
    if (bean) bean.addEventListener("click", clickBeanHandler);
    document.getElementById("upgradePower").onclick = () => buyPowerUpgrade();
    document.getElementById("upgradeMega").onclick = () => buyMegaPower();
    document.getElementById("buyAuto").onclick = () => buyAutoBot();
    document.getElementById("upgradeAuto").onclick = () => upgradeAutoEfficiency();
}

// Initialize
window.addEventListener("DOMContentLoaded", () => {
    loadGame();
    bindEvents();
    startProduction();
    updateUI();
    applyZoneEffects();
    console.log("Bean Ascension ready – scalable upgrades & zone changes!");
});
