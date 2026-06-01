// ---------- ZONES (original 50 + 48 post-endgame = 98 total) ----------
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
    "Bean Singularity Collapse", "Eternal Restart Gate", "Simulation Drift Zone", "Corrupted Infinity Field", "Void Arithmetic Plane",
    "Infinite Regression Loop", "Debug Universe Alpha", "Kernel Space", "Stack Overflow Realm", "Memory Leak Dimension",
    "Temporal Rewind Zone", "Quantum Echo Field", "Meta Bean Archive", "Prototype Reality", "Deleted Content Zone",
    "Beta Simulation Layer", "Developer Sandbox", "Ghost Data Plains", "Broken Save File World", "Patch Notes Universe",
    "Hotfix Dimension", "Legacy Code Ruins", "Absolute Zero State"
];
const allZones = [...baseZones, ...postZones]; // 98 zones

// Game state
let gas = 0;
let clickPower = 1;
let bots = 0;
let botEfficiency = 1;   // gas per bot per second
let zoneIndex = 0;
let simulationLayer = 0;
let globalMult = 1.0;
let fracturePoints = 0;
let petActive = false;
let petBonus = 1.0;
let activeThreats = [];   // each {name, effect, resolveCost, resolveFn}

// Upgrade costs (scalable)
let clickCost = 50;
let megaCost = 200;
let botCost = 120;
let turboCost = 300;

// DOM elements
const gasSpan = document.getElementById("gasValue");
const powerSpan = document.getElementById("powerValue");
const zoneSpan = document.getElementById("zoneName");
const botSpan = document.getElementById("botCount");
const prodSpan = document.getElementById("prodValue");
const fractureSpan = document.getElementById("fracturePoints");
const layerSpan = document.getElementById("layerNum");
const petBonusSpan = document.getElementById("petBonusValue");
const zoneFill = document.getElementById("zoneFill");
const eventLogDiv = document.getElementById("eventLog");
const threatPanel = document.getElementById("threatPanel");

// Helper: update UI and save
function updateUI() {
    gasSpan.innerText = Math.floor(gas);
    powerSpan.innerText = clickPower;
    zoneSpan.innerText = allZones[zoneIndex] || "∞ Beyond";
    botSpan.innerText = bots;
    let totalProd = bots * botEfficiency;
    prodSpan.innerText = Math.floor(totalProd * globalMult * (petActive ? petBonus : 1));
    fractureSpan.innerText = fracturePoints;
    layerSpan.innerText = simulationLayer;
    petBonusSpan.innerText = petActive ? `${Math.round((petBonus-1)*100)}%` : "0%";
    let progress = (gas % 100) / 100 * 100;
    zoneFill.style.width = `${progress}%`;
    document.getElementById("clickCost").innerText = clickCost;
    document.getElementById("megaCost").innerText = megaCost;
    document.getElementById("botCost").innerText = botCost;
    document.getElementById("turboCost").innerText = turboCost;
    const layerReq = (zoneIndex < baseZones.length-1) ? "Reach The End..." : "Reset (gain +0.2x mult)";
    document.getElementById("layerCost").innerHTML = layerReq;
    saveGame();
}

// Zone progression
function updateZone() {
    let newZone = Math.floor(gas / 100);
    if (newZone >= allZones.length) newZone = allZones.length - 1;
    if (newZone > zoneIndex) {
        zoneIndex = newZone;
        showToast(`🌌 Reached ${allZones[zoneIndex]}`, 1800);
        if (zoneIndex >= baseZones.length) {
            fracturePoints += 1;
            showToast("🌀 Fracture Point gained!", 1500);
        }
        updateUI();
    } else if (zoneIndex !== newZone) updateUI();
    else updateUI();
}

function addGas(amount) {
    let gain = amount * globalMult;
    if (petActive) gain *= petBonus;
    gas += gain;
    updateZone();
    updateUI();
}

// Upgrades
function buyClickUpgrade() {
    if (gas >= clickCost) {
        gas -= clickCost;
        clickPower++;
        clickCost = Math.floor(clickCost * 1.2);
        updateUI();
        return true;
    }
    return false;
}
function buyMegaUpgrade() {
    if (gas >= megaCost) {
        gas -= megaCost;
        clickPower += 5;
        megaCost = Math.floor(megaCost * 1.25);
        updateUI();
        return true;
    }
    return false;
}
function buyBot() {
    if (gas >= botCost) {
        gas -= botCost;
        bots++;
        botCost = Math.floor(botCost * 1.15);
        updateUI();
        return true;
    }
    return false;
}
function buyTurbo() {
    if (gas >= turboCost) {
        gas -= turboCost;
        botEfficiency++;
        turboCost = Math.floor(turboCost * 1.2);
        updateUI();
        return true;
    }
    return false;
}

// Prestige: Simulation Layer
function performLayerReset() {
    if (zoneIndex < baseZones.length - 1) {
        showToast("❌ Reach 'The End...' first!", 1500);
        return false;
    }
    if (gas < 5000 && simulationLayer === 0) {
        showToast("Need 5000 gas for first reset", 1500);
        return false;
    }
    simulationLayer++;
    globalMult = 1 + simulationLayer * 0.2;
    // reset resources
    gas = 0;
    clickPower = 1;
    bots = 0;
    botEfficiency = 1;
    clickCost = 50;
    megaCost = 200;
    botCost = 120;
    turboCost = 300;
    zoneIndex = 0;
    updateZone();
    showToast(`🌀 Layer ${simulationLayer} | Global mult +${(globalMult*100).toFixed(0)}%`, 3000);
    updateUI();
    return true;
}

// Fracture Shop
function buyFractureUpgrade() {
    if (fracturePoints >= 10) {
        fracturePoints -= 10;
        globalMult *= 1.5;
        showToast("⚡ Fracture Upgrade: +50% global production", 2000);
        updateUI();
    } else showToast("Need 10 Fracture Points", 1200);
}

// Pet system
function summonPet() {
    if (petActive) {
        showToast("You already have a pet!", 1000);
        return;
    }
    if (gas >= 100) {
        gas -= 100;
        petActive = true;
        petBonus = 1.2;
        showToast("🐾 Bean Sprout joins! +20% production", 2000);
        updateUI();
    } else showToast("Not enough gas (100)", 1000);
}

// Random events (every 60–120 seconds)
const eventList = [
    { name: "🌱 Bean Rain", act: () => { addGas(50); return "Gained 50 gas!"; } },
    { name: "✨ Golden Bean", act: () => { addGas(clickPower * 20); return `+${clickPower*20} gas!`; } },
    { name: "💨 Surge", act: () => { let old = globalMult; globalMult *= 1.2; setTimeout(()=>{ globalMult = old; updateUI(); }, 30000); return "Global +20% for 30s"; } },
    { name: "🔧 Sale", act: () => { let oldC=clickCost; clickCost=Math.floor(clickCost*0.7); megaCost=Math.floor(megaCost*0.7); botCost=Math.floor(botCost*0.7); turboCost=Math.floor(turboCost*0.7); setTimeout(()=>{ clickCost=oldC; megaCost=Math.floor(megaCost/0.7); botCost=Math.floor(botCost/0.7); turboCost=Math.floor(turboCost/0.7); updateUI(); }, 45000); return "Upgrades -30% for 45s!"; } },
    { name: "🕒 Time Warp", act: () => { let prod = bots * botEfficiency; addGas(prod * 10); return `+${prod*10} gas from warp!`; } },
    { name: "💥 Glitch", act: () => { let loss = Math.floor(gas * 0.1); gas -= loss; fracturePoints += 2; updateUI(); return `Lost ${loss} gas, +2 Fracture`; } }
];
function triggerRandomEvent() {
    let ev = eventList[Math.floor(Math.random() * eventList.length)];
    let msg = ev.act();
    eventLogDiv.innerHTML = `✨ ${ev.name}: ${msg}`;
    showToast(msg, 2500);
    updateUI();
    setTimeout(() => { eventLogDiv.innerHTML = "✨ Events will appear here"; }, 4000);
}

// Threat system (after zone 20)
const threatLibrary = [
    { name: "🐉 Lag Entity", effect: () => { globalMult *= 0.8; updateUI(); }, resolveCost: 5, resolve: () => { globalMult /= 0.8; updateUI(); } },
    { name: "💰 Inflation Engine", effect: () => { clickCost *= 1.5; megaCost *= 1.5; botCost *= 1.5; turboCost *= 1.5; updateUI(); }, resolveCost: 8, resolve: () => { clickCost /= 1.5; megaCost /= 1.5; botCost /= 1.5; turboCost /= 1.5; updateUI(); } }
];
function trySpawnThreat() {
    if (zoneIndex < 20) return;
    if (activeThreats.length === 0 && Math.random() < 0.3) {
        let threat = JSON.parse(JSON.stringify(threatLibrary[Math.floor(Math.random() * threatLibrary.length)]));
        threat.effect();
        activeThreats.push(threat);
        showToast(`⚠️ THREAT: ${threat.name} appears! ⚠️`, 4000);
        renderThreats();
    }
}
function renderThreats() {
    if (activeThreats.length === 0) {
        threatPanel.innerHTML = "<div style='text-align:center'>No active threats</div>";
        return;
    }
    threatPanel.innerHTML = activeThreats.map((th, idx) => `
        <div class="threat-item">
            <span>😈 ${th.name}</span>
            <button onclick="resolveThreat(${idx})">Defeat (${th.resolveCost} FP)</button>
        </div>
    `).join("");
}
function resolveThreat(idx) {
    let th = activeThreats[idx];
    if (fracturePoints >= th.resolveCost) {
        fracturePoints -= th.resolveCost;
        th.resolve();
        activeThreats.splice(idx, 1);
        showToast(`Defeated ${th.name}!`, 2000);
        renderThreats();
        updateUI();
    } else showToast(`Need ${th.resolveCost} Fracture Points`, 1200);
}
window.resolveThreat = resolveThreat;

// Auto-production & auto-save
let prodInterval, eventInterval, threatInterval;
function startAutoProduction() {
    if (prodInterval) clearInterval(prodInterval);
    prodInterval = setInterval(() => {
        let prod = bots * botEfficiency;
        if (prod > 0) addGas(prod);
    }, 1000);
}
function startEventCycle() {
    if (eventInterval) clearInterval(eventInterval);
    eventInterval = setInterval(() => triggerRandomEvent(), Math.random() * 60000 + 60000);
}
function startThreatCycle() {
    if (threatInterval) clearInterval(threatInterval);
    threatInterval = setInterval(() => trySpawnThreat(), 90000);
}

// Save & Load
function saveGame() {
    let save = {
        gas, clickPower, bots, botEfficiency, zoneIndex, simulationLayer, globalMult, fracturePoints,
        petActive, petBonus, clickCost, megaCost, botCost, turboCost,
        activeThreats: activeThreats.map(t => t.name)
    };
    localStorage.setItem("BeanEmpireSave", JSON.stringify(save));
}
function loadGame() {
    let raw = localStorage.getItem("BeanEmpireSave");
    if (raw) {
        try {
            let d = JSON.parse(raw);
            gas = d.gas ?? 0; clickPower = d.clickPower ?? 1;
            bots = d.bots ?? 0; botEfficiency = d.botEfficiency ?? 1;
            zoneIndex = d.zoneIndex ?? 0; simulationLayer = d.simulationLayer ?? 0;
            globalMult = d.globalMult ?? 1; fracturePoints = d.fracturePoints ?? 0;
            petActive = d.petActive ?? false; petBonus = d.petBonus ?? 1;
            clickCost = d.clickCost ?? 50; megaCost = d.megaCost ?? 200;
            botCost = d.botCost ?? 120; turboCost = d.turboCost ?? 300;
            activeThreats = [];
            updateUI();
            updateZone();
        } catch(e) { console.warn(e); }
    }
    startEventCycle();
    startThreatCycle();
    setInterval(() => saveGame(), 30000);
}

// Click handler with crit
function clickBean(e) {
    let gain = clickPower;
    if (Math.random() < 0.12) gain = Math.floor(clickPower * 2.5);
    addGas(gain);
    e.currentTarget.style.transform = "scale(0.92)";
    setTimeout(() => { if(e.currentTarget) e.currentTarget.style.transform = ""; }, 80);
}

// Event binding
document.getElementById("bean").addEventListener("click", clickBean);
document.getElementById("upgradeClick").onclick = buyClickUpgrade;
document.getElementById("upgradeMega").onclick = buyMegaUpgrade;
document.getElementById("buyBot").onclick = buyBot;
document.getElementById("upgradeBot").onclick = buyTurbo;
document.getElementById("prestigeBtn").onclick = performLayerReset;
document.getElementById("fractureShop").onclick = buyFractureUpgrade;
document.getElementById("petBtn").onclick = summonPet;

// Toast helper
function showToast(msg, duration) {
    let toast = document.createElement("div");
    toast.className = "toast";
    toast.innerText = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), duration);
}

// Initialize
loadGame();
startAutoProduction();
updateUI();
showToast("🐚 Bean Empire Awakens! Click the bean.", 3000);
