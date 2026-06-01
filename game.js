
// ---------- ZONES ----------
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
    "Beyond Infinity", "Outside The Game", "You Are Here (But Not Really)", "Hidden Layer 51", "Final Finality"
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
let critChance = 0.05;
let doubleChance = 0;
let autoClickActive = false;
let autoClickInterval = null;

// Upgrade data (scalable)
let upgradeData = [
    { id: "click", name: "💨 Stronger Farts", baseCost: 50, cost: 50, effect: () => { clickPower++; }, desc: "+1 click power", multiplier: 1.2 },
    { id: "mega", name: "✨ Mega Burst", baseCost: 200, cost: 200, effect: () => { clickPower += 5; }, desc: "+5 click power", multiplier: 1.25 },
    { id: "bot", name: "🤖 Auto Bot", baseCost: 120, cost: 120, effect: () => { bots++; }, desc: "+1 gas/sec", multiplier: 1.15 },
    { id: "turbo", name: "⚡ Turbo Nozzle", baseCost: 300, cost: 300, effect: () => { botEfficiency++; }, desc: "+1 per bot/sec", multiplier: 1.2 },
    { id: "crit", name: "🎯 Critical Eye", baseCost: 500, cost: 500, effect: () => { if(critChance<0.5) critChance+=0.05; }, desc: "+5% crit chance", multiplier: 1.3 },
    { id: "double", name: "💎 Double Tap", baseCost: 800, cost: 800, effect: () => { if(doubleChance<0.5) doubleChance+=0.1; }, desc: "+10% double gas", multiplier: 1.4 },
    { id: "autoclick", name: "🖱️ Auto-Clicker", baseCost: 1000, cost: 1000, effect: () => { if(!autoClickActive){ autoClickActive=true; if(autoClickInterval) clearInterval(autoClickInterval); autoClickInterval=setInterval(()=>{ addGas(clickPower); },1000); } }, desc: "1 click/sec", multiplier: 1.5 }
];
const pageSize = 4;
let currentPage = 1;
let totalPages = Math.ceil(upgradeData.length / pageSize);

// Pets
const petRarities = ["Common","Rare","Epic","Legendary","Ultimate"];
const petBonuses = [0.005, 0.02, 0.08, 0.15, 0.3];
const petNames = ["Sprout","Beanling","Cosmic Pup","Void Bunny","Elder Bean","Golden Sprout","Nebula Cat"];
let ownedPets = [];
let petBonusMult = 1;

// Leaderboard
let leaderboard = [];

// DOM elements
const gasSpan = document.getElementById("gasValue");
const powerSpan = document.getElementById("powerValue");
const worldSpan = document.getElementById("worldName");
const botSpan = document.getElementById("botCount");
const prodSpan = document.getElementById("prodValue");
const fractureSpan = document.getElementById("fracturePoints");
const prestigeSpan = document.getElementById("prestigeLv");
const zoneFill = document.getElementById("zoneFill");
const nextZoneSpan = document.getElementById("nextZoneGas");
const eventDiv = document.getElementById("eventMessage");
const bossAlert = document.getElementById("bossAlert");
const comboDisplay = document.getElementById("comboDisplay");

// Helper functions
function getRequiredGasForZone() { return Math.min(100 + zoneIndex * 8, 500); }

function updateUI() {
    gasSpan.innerText = Math.floor(gas);
    powerSpan.innerText = clickPower;
    worldSpan.innerText = allZones[zoneIndex] || "Infinity";
    botSpan.innerText = bots;
    prodSpan.innerText = Math.floor(bots * botEfficiency * globalMult);
    fractureSpan.innerText = fracturePoints;
    prestigeSpan.innerText = prestigeLevel;
    let required = getRequiredGasForZone();
    zoneFill.style.width = `${(gas % required) / required * 100}%`;
    nextZoneSpan.innerText = required;
    saveGame();
}

function updateZone() {
    let required = getRequiredGasForZone();
    if (gas >= required && zoneIndex < allZones.length - 1) {
        gas -= required;
        zoneIndex++;
        flashEffect("world", `🌍 Reached ${allZones[zoneIndex]}!`);
        if (zoneIndex === baseZones.length - 1) playCutscene();
        if (zoneIndex >= baseZones.length) { fracturePoints++; flashEffect("fracture", "+1 Fracture!"); }
        updateUI();
        updateZone(); // cascade
    } else updateUI();
}

// Main addGas (includes pet bonus)
function addGas(amount) {
    let gain = amount * globalMult * petBonusMult;
    if (Math.random() < doubleChance) gain *= 2;
    gas += gain;
    updateZone();
    updateUI();
}

// Combo & click
function incrementCombo() {
    if (comboTimeout) clearTimeout(comboTimeout);
    combo++;
    comboDisplay.innerText = `⚡ Combo: ${combo}`;
    comboTimeout = setTimeout(() => { combo = 0; comboDisplay.innerText = "⚡ Combo: 0"; }, 3000);
}

function clickBean(e) {
    let gain = clickPower;
    if (combo > 0) gain = Math.floor(gain * (1 + combo * 0.03));
    if (Math.random() < critChance) gain = Math.floor(gain * 2.5);
    addGas(gain);
    incrementCombo();
    // visual squash
    const beanEl = document.getElementById("bean");
    beanEl.style.transform = "scale(0.92)";
    setTimeout(() => { beanEl.style.transform = ""; }, 80);
    console.log("Bean clicked!"); // debug
}

// Upgrade rendering (paginated)
function renderUpgrades() {
    const container = document.getElementById("upgradeList");
    if (!container) return;
    const start = (currentPage-1)*pageSize;
    const pageUpgrades = upgradeData.slice(start, start+pageSize);
    container.innerHTML = pageUpgrades.map(up => `
        <div class="upgrade" data-id="${up.id}">
            <span>${up.name}</span>
            <span class="cost">${Math.floor(up.cost)}</span>
            <div class="desc">${up.desc}</div>
        </div>
    `).join("");
    document.querySelectorAll("#upgradeList .upgrade").forEach(el => {
        const id = el.dataset.id;
        const up = upgradeData.find(u => u.id === id);
        el.onclick = () => {
            if(gas >= up.cost) {
                gas -= up.cost;
                up.effect();
                up.cost = Math.floor(up.cost * up.multiplier);
                renderUpgrades();
                updateUI();
                flashEffect("upgrade", `Bought ${up.name}`);
            } else flashEffect("error", "Not enough gas", true);
        };
    });
    document.getElementById("pageNum").innerText = currentPage;
    document.getElementById("totalPages").innerText = totalPages;
    document.getElementById("prevPageBtn").disabled = currentPage === 1;
    document.getElementById("nextPageBtn").disabled = currentPage === totalPages;
}

function nextPage() { if(currentPage < totalPages) { currentPage++; renderUpgrades(); } }
function prevPage() { if(currentPage > 1) { currentPage--; renderUpgrades(); } }

// Prestige
function performPrestige() {
    if (zoneIndex < baseZones.length - 1) { flashEffect("error","Reach 'The End...' first!", true); return; }
    let gained = 5 + Math.floor(gas / 1000);
    fracturePoints += gained;
    prestigeLevel++;
    globalMult = 1 + prestigeLevel * 0.2;
    // reset
    gas = 0; clickPower = 1; bots = 0; botEfficiency = 1; zoneIndex = 0;
    upgradeData.forEach(u => u.cost = u.baseCost);
    if(autoClickInterval) clearInterval(autoClickInterval);
    autoClickActive = false;
    critChance = 0.05; doubleChance = 0;
    updateZone(); updateUI(); renderUpgrades();
    flashEffect("prestige", `Prestige Lv ${prestigeLevel} | +${gained} Fracture!`);
    submitLeaderboardScore();
}

// Random events
const events = [
    { name:"🌱 Bean Rain", act:()=>{ addGas(100); return "+100 gas!"; } },
    { name:"✨ Golden Bean", act:()=>{ addGas(clickPower*40); return `+${clickPower*40} gas!`; } },
    { name:"💨 Surge", act:()=>{ let old=globalMult; globalMult*=1.3; setTimeout(()=>{ globalMult=old; updateUI(); }, 30000); return "Global +30% for 30s!"; } },
    { name:"🔧 Cheap Parts", act:()=>{ upgradeData.forEach(u=>u.cost=Math.floor(u.cost*0.8)); renderUpgrades(); setTimeout(()=>{ upgradeData.forEach(u=>u.cost=Math.floor(u.cost/0.8)); renderUpgrades(); }, 45000); return "Upgrades -20% for 45s!"; } }
];
function triggerRandomEvent() {
    let ev = events[Math.floor(Math.random()*events.length)];
    let msg = ev.act();
    eventDiv.innerHTML = `✨ ${ev.name}: ${msg}`;
    flashEffect("event", ev.name);
    setTimeout(()=>{ eventDiv.innerHTML = "✨ Events appear here ✨"; }, 4000);
    updateUI();
}

// Boss system
let activeBoss = null;
function trySpawnBoss() {
    if (zoneIndex < 15 || activeBoss) return;
    if (Math.random() < 0.2) {
        activeBoss = { name:"🐉 Lag Entity", resolveCost:5 };
        globalMult *= 0.8;
        updateUI();
        bossAlert.innerHTML = `⚠️ BOSS: ${activeBoss.name}! -20% prod. Click to defeat (${activeBoss.resolveCost} FP)`;
        bossAlert.classList.remove("hidden");
    }
}
function defeatBoss() {
    if (activeBoss && fracturePoints >= activeBoss.resolveCost) {
        fracturePoints -= activeBoss.resolveCost;
        globalMult /= 0.8;
        activeBoss = null;
        bossAlert.classList.add("hidden");
        flashEffect("boss", "Boss defeated!");
        updateUI();
    } else flashEffect("error", "Not enough Fracture Points", true);
}
setInterval(trySpawnBoss, 90000);
window.defeatBoss = defeatBoss;
bossAlert.onclick = defeatBoss;

// Pets & Crates
function getRandomPet() {
    let rarityRoll = Math.random();
    let rarityIdx = 0;
    if (rarityRoll < 0.5) rarityIdx = 0;
    else if (rarityRoll < 0.75) rarityIdx = 1;
    else if (rarityRoll < 0.9) rarityIdx = 2;
    else if (rarityRoll < 0.98) rarityIdx = 3;
    else rarityIdx = 4;
    let name = petNames[Math.floor(Math.random() * petNames.length)] + ` (${petRarities[rarityIdx]})`;
    let bonus = petBonuses[rarityIdx];
    return { id: Date.now() + Math.random(), name, bonus, rarity: rarityIdx, equipped: false };
}
function openCrate() {
    if (gas < 100) { flashEffect("error", "Need 100 gas", true); return; }
    gas -= 100;
    let pet = getRandomPet();
    ownedPets.push(pet);
    document.getElementById("crateResult").innerHTML = `🎁 You got: ${pet.name} (+${(pet.bonus*100).toFixed(1)}% production)!`;
    renderPetInventory();
    updateUI();
    setTimeout(()=>{ document.getElementById("crateResult").innerHTML = ""; }, 3000);
}
function renderPetInventory() {
    const container = document.getElementById("petInventory");
    if (!container) return;
    container.innerHTML = ownedPets.map((p, idx) => `
        <div class="pet-card ${p.equipped ? 'equipped' : ''}" onclick="toggleEquip(${idx})">
            <strong>${p.name}</strong><br>
            +${(p.bonus*100).toFixed(1)}%<br>
            ${p.equipped ? '✔️' : '🔘'}
        </div>
    `).join("");
    let equipped = ownedPets.filter(p => p.equipped).map(p => p.name).join(", ");
    document.getElementById("equippedList").innerText = equipped || "None";
    updatePetBonus();
}
function toggleEquip(idx) {
    let pet = ownedPets[idx];
    if (pet.equipped) {
        pet.equipped = false;
    } else {
        if (ownedPets.filter(p => p.equipped).length >= 3) {
            flashEffect("error", "Max 3 pets equipped", true);
            return;
        }
        pet.equipped = true;
    }
    renderPetInventory();
}
function autoEquipBest() {
    ownedPets.forEach(p => p.equipped = false);
    let sorted = [...ownedPets].sort((a,b) => b.bonus - a.bonus);
    for (let i = 0; i < Math.min(3, sorted.length); i++) sorted[i].equipped = true;
    renderPetInventory();
}
function updatePetBonus() {
    let totalBonus = ownedPets.filter(p=>p.equipped).reduce((sum,p)=>sum + p.bonus, 0);
    petBonusMult = 1 + totalBonus;
}

// Leaderboard
function loadLeaderboard() {
    let stored = localStorage.getItem("beanLeaderboard");
    leaderboard = stored ? JSON.parse(stored) : [];
    renderLeaderboard();
}
function renderLeaderboard() {
    let sorted = [...leaderboard].sort((a,b)=>b.score - a.score).slice(0,10);
    let html = sorted.map(entry => `<div class="leaderboard-entry"><span>${escapeHtml(entry.name)}</span><span>${entry.score} pts</span></div>`).join("");
    if (!html) html = "<div>No scores yet. Submit yours!</div>";
    document.getElementById("leaderboardList").innerHTML = html;
}
function submitLeaderboardScore() {
    let nameInput = document.getElementById("playerName");
    let playerName = nameInput.value.trim();
    if (playerName === "") playerName = "BeanMaster";
    let score = fracturePoints + prestigeLevel * 10;
    leaderboard.push({ name:playerName, score:score });
    leaderboard.sort((a,b)=>b.score - a.score);
    leaderboard = leaderboard.slice(0, 20);
    localStorage.setItem("beanLeaderboard", JSON.stringify(leaderboard));
    renderLeaderboard();
    flashEffect("leaderboard", "Score submitted!");
}
function escapeHtml(str) { return str.replace(/[&<>]/g, function(m){ return {'&':'&amp;','<':'&lt;','>':'&gt;'}[m]; }); }

// Cutscene
function playCutscene() {
    let overlay = document.getElementById("cutsceneOverlay");
    let textDiv = document.getElementById("cutsceneText");
    overlay.classList.remove("hidden");
    textDiv.innerText = "🌀 You reached The End...\nBut the simulation continues...\n✨ Endless worlds await ✨";
    setTimeout(() => { overlay.classList.add("hidden"); }, 5000);
}

// Save / Load
function saveGame() {
    let save = { gas, clickPower, bots, botEfficiency, zoneIndex, prestigeLevel, globalMult, fracturePoints,
                 upgradeCosts: upgradeData.map(u=>u.cost), ownedPets, critChance, doubleChance, autoClickActive };
    localStorage.setItem("beanEmpireSave", JSON.stringify(save));
}
function loadGame() {
    let raw = localStorage.getItem("beanEmpireSave");
    if (raw) {
        let d = JSON.parse(raw);
        gas = d.gas ?? 0; clickPower = d.clickPower ?? 1; bots = d.bots ?? 0; botEfficiency = d.botEfficiency ?? 1;
        zoneIndex = d.zoneIndex ?? 0; prestigeLevel = d.prestigeLevel ?? 0; globalMult = d.globalMult ?? 1;
        fracturePoints = d.fracturePoints ?? 0; critChance = d.critChance ?? 0.05; doubleChance = d.doubleChance ?? 0;
        autoClickActive = d.autoClickActive ?? false;
        if (d.upgradeCosts) upgradeData.forEach((u,i)=> u.cost = d.upgradeCosts[i] || u.baseCost);
        if (d.ownedPets) ownedPets = d.ownedPets;
        if (autoClickActive && !autoClickInterval) autoClickInterval = setInterval(()=>{ addGas(clickPower); },1000);
        renderUpgrades();
        renderPetInventory();
        updateZone();
        updateUI();
    }
    setInterval(saveGame, 30000);
}

// Tabs
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.add('hidden'));
    document.getElementById(`${tabId}Tab`).classList.remove('hidden');
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`.tab-btn[data-tab="${tabId}"]`).classList.add('active');
}

// Flash effect
function flashEffect(type, message, isError = false) {
    let toast = document.createElement("div");
    toast.className = "toast";
    toast.innerText = message;
    toast.style.background = isError ? "#a12222cc" : "#2a5a2acc";
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
}

// Wait for DOM to be fully loaded before binding events
document.addEventListener("DOMContentLoaded", () => {
    // Bind click handler to bean
    const beanElement = document.getElementById("bean");
    if (beanElement) {
        beanElement.addEventListener("click", clickBean);
        console.log("Bean click listener attached!");
    } else {
        console.error("Bean element not found!");
    }

    // Bind other UI buttons
    document.getElementById("prestigeBtn").onclick = performPrestige;
    document.getElementById("openCrateBtn").onclick = openCrate;
    document.getElementById("autoEquipBtn").onclick = autoEquipBest;
    document.getElementById("submitScoreBtn").onclick = submitLeaderboardScore;
    document.getElementById("prevPageBtn").onclick = prevPage;
    document.getElementById("nextPageBtn").onclick = nextPage;

    // Tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.onclick = () => switchTab(btn.dataset.tab);
    });

    // Load data and start loops
    loadGame();
    loadLeaderboard();
    renderUpgrades();
    renderPetInventory();
    updateUI();
    updatePetBonus();

    setInterval(() => { if (!document.hidden) triggerRandomEvent(); }, 75000);
    setInterval(() => { if (!document.hidden) addGas(bots * botEfficiency); }, 1000);
    flashEffect("welcome", "Bean Empire Awakened! Click the bean.", false);
});
