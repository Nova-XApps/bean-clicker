// ---------- WORLD ZONES (50 original + 48 post-end) ----------
const baseZones = [
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
const postZones = [
    "Reality Fracture", "Memory Overflow", "Developer Layer", "Code Ocean", "Simulation Backbone",
    "Render Dimension", "Null Space", "Anti-Existence Field", "Broken Continuum", "Lost Variables Zone",
    "Paradox Plains", "Infinite Loop Realm", "God Debug Room", "Pre-Genesis State", "Post-Story World",
    "Unwritten Chapter", "Canvas of Nothing", "Admin Control Plane", "Bean Source Code Core", "True Origin Point",
    "Beyond Infinity", "Outside The Game", "You Are Here (But Not Really)", "Hidden Layer 51", "Final Finality",
    "Bean Singularity Collapse", "Eternal Restart Gate", "Simulation Drift Zone", "Corrupted Infinity Field", "Void Arithmetic Plane"
];
const allZones = [...baseZones, ...postZones];

// Game state
let gas = 0;
let clickPower = 1;
let bots = 0;
let botEfficiency = 1;
let zoneIndex = 0;
let prestigeLevel = 0;
let globalMult = 1.0;
let fracturePoints = 0;
let combo = 0;
let comboTimeout = null;
let lastGasUpdate = 0;

// Upgrade costs (scalable)
let clickCost = 50;
let megaCost = 200;
let botCost = 120;
let turboCost = 300;

// Leaderboard data
let leaderboard = []; // { name, score }
let currentPlayerName = "Guest";

// DOM Elements
const gasSpan = document.getElementById("gasValue");
const powerSpan = document.getElementById("powerValue");
const worldSpan = document.getElementById("worldName");
const botSpan = document.getElementById("botCount");
const prodSpan = document.getElementById("prodValue");
const fractureSpan = document.getElementById("fracturePoints");
const layerSpan = document.getElementById("layerNum");
const zoneFill = document.getElementById("zoneFill");
const nextZoneSpan = document.getElementById("nextZoneGas");
const eventDiv = document.getElementById("eventMessage");
const bossAlert = document.getElementById("bossAlert");
const comboDisplay = document.getElementById("comboDisplay");

// Helper: Update UI & Save
function updateUI() {
    gasSpan.innerText = Math.floor(gas);
    powerSpan.innerText = clickPower;
    worldSpan.innerText = allZones[zoneIndex] || "Infinity";
    botSpan.innerText = bots;
    let prod = bots * botEfficiency;
    prodSpan.innerText = Math.floor(prod * globalMult);
    fractureSpan.innerText = fracturePoints;
    layerSpan.innerText = prestigeLevel;
    let progress = (gas % 100) / 100 * 100;
    zoneFill.style.width = `${progress}%`;
    let nextGas = (Math.floor(gas / 100) + 1) * 100;
    nextZoneSpan.innerText = nextGas;
    document.getElementById("clickCost").innerText = clickCost;
    document.getElementById("megaCost").innerText = megaCost;
    document.getElementById("botCost").innerText = botCost;
    document.getElementById("turboCost").innerText = turboCost;
    saveGame();
}

// Zone progression + cutscene at final
function updateZone() {
    let newZone = Math.floor(gas / 100);
    if (newZone >= allZones.length) newZone = allZones.length - 1;
    if (newZone > zoneIndex) {
        zoneIndex = newZone;
        flashEffect("world", `🌍 Reached ${allZones[zoneIndex]}!`);
        if (zoneIndex === baseZones.length - 1) { // "The End..."
            playCutscene();
        }
        if (zoneIndex >= baseZones.length) {
            fracturePoints += 1;
            flashEffect("fracture", "+1 Fracture Point!");
        }
        updateUI();
    } else {
        updateUI();
    }
}

function addGas(amount) {
    let gain = amount * globalMult;
    gas += gain;
    updateZone();
    updateUI();
}

// Combo system
function incrementCombo() {
    if (comboTimeout) clearTimeout(comboTimeout);
    combo++;
    comboDisplay.innerText = `⚡ Combo: ${combo}`;
    comboDisplay.style.animation = "pulse 0.2s";
    setTimeout(() => { comboDisplay.style.animation = ""; }, 200);
    comboTimeout = setTimeout(() => {
        combo = 0;
        comboDisplay.innerText = "⚡ Combo: 0";
    }, 3000);
}

// Click handler with combo bonus
function clickBean(e) {
    let gain = clickPower;
    if (combo > 0) gain = Math.floor(gain * (1 + combo * 0.05));
    if (Math.random() < 0.12) gain = Math.floor(gain * 2.5);
    addGas(gain);
    incrementCombo();
    e.currentTarget.style.transform = "scale(0.92)";
    setTimeout(() => { if(e.currentTarget) e.currentTarget.style.transform = ""; }, 80);
    // flash effect
    gasSpan.style.transform = "scale(1.1)";
    setTimeout(() => { gasSpan.style.transform = ""; }, 150);
}

// Upgrades
function buyClick() { if(gas>=clickCost){ gas-=clickCost; clickPower++; clickCost=Math.floor(clickCost*1.2); updateUI(); flashEffect("upgrade","Click power +1"); } }
function buyMega() { if(gas>=megaCost){ gas-=megaCost; clickPower+=5; megaCost=Math.floor(megaCost*1.25); updateUI(); flashEffect("upgrade","+5 Click power"); } }
function buyBot() { if(gas>=botCost){ gas-=botCost; bots++; botCost=Math.floor(botCost*1.15); updateUI(); flashEffect("upgrade","Bot acquired"); } }
function buyTurbo() { if(gas>=turboCost){ gas-=turboCost; botEfficiency++; turboCost=Math.floor(turboCost*1.2); updateUI(); flashEffect("upgrade","Efficiency +1"); } }

// Prestige
function performPrestige() {
    if (zoneIndex < baseZones.length - 1) { flashEffect("error","Reach 'The End...' first!", true); return; }
    let gained = 5 + Math.floor(gas / 1000);
    fracturePoints += gained;
    prestigeLevel++;
    globalMult = 1 + prestigeLevel * 0.2;
    // reset progress
    gas = 0;
    clickPower = 1;
    bots = 0;
    botEfficiency = 1;
    zoneIndex = 0;
    clickCost = 50;
    megaCost = 200;
    botCost = 120;
    turboCost = 300;
    updateZone();
    updateUI();
    flashEffect("prestige", `Prestige Lv ${prestigeLevel} | +${gained} Fracture!`);
    submitLeaderboardScore(); // update leaderboard after prestige
}

// Random Events (every 60-90 sec)
const events = [
    { name:"🌱 Bean Rain", act:()=>{ addGas(100); return "+100 gas!"; } },
    { name:"✨ Golden Bean", act:()=>{ addGas(clickPower*30); return `+${clickPower*30} gas!`; } },
    { name:"💨 Surge", act:()=>{ let old=globalMult; globalMult*=1.3; setTimeout(()=>{ globalMult=old; updateUI(); }, 30000); return "Global +30% for 30s!"; } },
    { name:"🔧 Cheap Parts", act:()=>{ clickCost=Math.floor(clickCost*0.8); megaCost=Math.floor(megaCost*0.8); botCost=Math.floor(botCost*0.8); turboCost=Math.floor(turboCost*0.8); setTimeout(()=>{ clickCost*=1.25; megaCost*=1.25; botCost*=1.25; turboCost*=1.25; updateUI(); }, 45000); return "Upgrades -20% for 45s!"; } }
];
function triggerRandomEvent() {
    let ev = events[Math.floor(Math.random()*events.length)];
    let msg = ev.act();
    eventDiv.innerHTML = `✨ ${ev.name}: ${msg}`;
    flashEffect("event", ev.name);
    setTimeout(()=>{ eventDiv.innerHTML = "✨ Events will appear here ✨"; }, 4000);
    updateUI();
}

// Boss system (simple)
let activeBoss = null;
function trySpawnBoss() {
    if (zoneIndex < 20) return;
    if (!activeBoss && Math.random() < 0.25) {
        activeBoss = { name:"🐉 Lag Entity", resolveCost:5, active:true };
        globalMult *= 0.8;
        updateUI();
        bossAlert.innerHTML = `⚠️ BOSS: ${activeBoss.name}! -20% production. Use 5 FP to defeat.`;
        bossAlert.classList.remove("hidden");
    }
}
function defeatBoss() {
    if (activeBoss && fracturePoints >= activeBoss.resolveCost) {
        fracturePoints -= activeBoss.resolveCost;
        globalMult /= 0.8;
        activeBoss = null;
        bossAlert.classList.add("hidden");
        flashEffect("boss", "Boss defeated! Production restored.");
        updateUI();
    } else {
        flashEffect("error", "Not enough Fracture Points!", true);
    }
}
setInterval(trySpawnBoss, 90000);
bossAlert.onclick = defeatBoss;

// Leaderboard System (localStorage global across tabs)
function loadLeaderboard() {
    let stored = localStorage.getItem("beanLeaderboard");
    if (stored) leaderboard = JSON.parse(stored);
    else leaderboard = [
        { name:"BeanMaster", score:120 },
        { name:"CosmicFarmer", score:85 },
        { name:"LuckyBean", score:45 }
    ];
    renderLeaderboard();
}
function renderLeaderboard() {
    let sorted = [...leaderboard].sort((a,b)=>b.score - a.score).slice(0,10);
    let html = sorted.map(entry => `<div class="leaderboard-entry"><span>${entry.name}</span><span>${entry.score} pts</span></div>`).join("");
    document.getElementById("leaderboardList").innerHTML = html || "<div>No scores yet</div>";
}
function submitLeaderboardScore() {
    let nameInput = document.getElementById("playerName");
    let playerName = nameInput.value.trim();
    if (playerName === "") playerName = "Guest";
    currentPlayerName = playerName;
    let prestigeScore = fracturePoints + prestigeLevel * 10;
    leaderboard.push({ name:playerName, score:prestigeScore });
    leaderboard.sort((a,b)=>b.score - a.score);
    leaderboard = leaderboard.slice(0, 20);
    localStorage.setItem("beanLeaderboard", JSON.stringify(leaderboard));
    renderLeaderboard();
    flashEffect("leaderboard", "Score submitted!");
}
document.getElementById("submitScoreBtn").onclick = submitLeaderboardScore;
window.addEventListener("load", () => {
    loadLeaderboard();
    setInterval(() => { if (!document.hidden) triggerRandomEvent(); }, 75000);
    setInterval(() => { addGas(bots * botEfficiency); }, 1000);
});

// Cutscene after reaching "The End..."
function playCutscene() {
    let overlay = document.getElementById("cutsceneOverlay");
    let textDiv = document.getElementById("cutsceneText");
    overlay.classList.remove("hidden");
    textDiv.innerText = "🌀 You have reached The End...\nBut the simulation continues...\n✨ Endless worlds await ✨";
    setTimeout(() => {
        overlay.classList.add("hidden");
    }, 5000);
}

// Flash effect helper
function flashEffect(type, message, isError = false) {
    let toast = document.createElement("div");
    toast.className = "toast";
    toast.innerText = message;
    toast.style.background = isError ? "#a12222cc" : "#2a5a2acc";
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
}

// Auto-save
function saveGame() {
    let save = { gas, clickPower, bots, botEfficiency, zoneIndex, prestigeLevel, globalMult, fracturePoints, clickCost, megaCost, botCost, turboCost };
    localStorage.setItem("beanEmpireSave", JSON.stringify(save));
}
function loadGame() {
    let raw = localStorage.getItem("beanEmpireSave");
    if (raw) {
        let d = JSON.parse(raw);
        gas = d.gas ?? 0; clickPower = d.clickPower ?? 1; bots = d.bots ?? 0; botEfficiency = d.botEfficiency ?? 1;
        zoneIndex = d.zoneIndex ?? 0; prestigeLevel = d.prestigeLevel ?? 0; globalMult = d.globalMult ?? 1;
        fracturePoints = d.fracturePoints ?? 0; clickCost = d.clickCost ?? 50; megaCost = d.megaCost ?? 200;
        botCost = d.botCost ?? 120; turboCost = d.turboCost ?? 300;
        updateZone();
        updateUI();
    }
    setInterval(saveGame, 30000);
}

// Event binding
document.getElementById("bean").addEventListener("click", clickBean);
document.getElementById("upgradeClick").onclick = buyClick;
document.getElementById("upgradeMega").onclick = buyMega;
document.getElementById("buyBot").onclick = buyBot;
document.getElementById("upgradeBot").onclick = buyTurbo;
document.getElementById("prestigeBtn").onclick = performPrestige;

loadGame();
updateUI();
setInterval(() => {
    if (!document.hidden) addGas(bots * botEfficiency);
}, 1000);
flashEffect("welcome", "Bean Empire awakened! Click the bean!", false);
