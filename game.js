// ---------- ZONES (original 50 + post-endless) ----------
const baseZones = [/* same as before, 50 zones up to "The End..." */];
const postZones = [/* 48 post-endgame zones */];
const allZones = [...baseZones, ...postZones];

// Game core state
let gas = 0, clickPower = 1, bots = 0, botEff = 1;
let zoneIdx = 0, layer = 0, globalMult = 1, fracture = 0;
let petActive = false, petBonus = 1.2;
let ownedPets = []; // each {id, name, bonusType, bonusValue, equipped}
let crateRarity = ["Common","Rare","Epic","Legendary","Ultimate"];

// Skill tree (bought flags)
let skills = { prod1:0, prod2:0, autoClick:0, bossKiller:0, petLover:0, chaosLuck:0 };
let autoClickInterval = null;
let activeThreats = [];

// Upgrade costs
let clickCost=50, megaCost=200, botCost=120, turboCost=300;

// DOM elements
const gasSpan=document.getElementById("gasValue"), powerSpan=document.getElementById("powerValue");
const zoneSpan=document.getElementById("zoneName"), botSpan=document.getElementById("botCount");
const prodSpan=document.getElementById("prodValue"), fractureSpan=document.getElementById("fracturePoints");
const layerSpan=document.getElementById("layerNum"), petBonusSpan=document.getElementById("petBonusValue");
const zoneFill=document.getElementById("zoneFill"), eventLog=document.getElementById("eventLog");
const threatPanel=document.getElementById("threatPanel"), petDisplay=document.getElementById("petDisplay");

// Helper functions
function updateUI() {
    gasSpan.innerText = Math.floor(gas);
    powerSpan.innerText = clickPower;
    zoneSpan.innerText = allZones[zoneIdx]||"∞";
    botSpan.innerText = bots;
    let prod = bots*botEff;
    prodSpan.innerText = Math.floor(prod*globalMult*(petActive?petBonus:1));
    fractureSpan.innerText = fracture;
    layerSpan.innerText = layer;
    petBonusSpan.innerText = petActive?`${Math.round((petBonus-1)*100)}%`:"0%";
    zoneFill.style.width = `${(gas%100)/100*100}%`;
    document.getElementById("clickCost").innerText=clickCost;
    document.getElementById("megaCost").innerText=megaCost;
    document.getElementById("botCost").innerText=botCost;
    document.getElementById("turboCost").innerText=turboCost;
    petDisplay.innerText = petActive?`🐾 Equipped: +${(petBonus-1)*100}%`:"No pet";
    saveGame();
}

function addGas(amt) {
    let gain = amt * globalMult;
    if(petActive) gain *= petBonus;
    gas += gain;
    updateZone();
    updateUI();
}

function updateZone() {
    let newZone = Math.floor(gas/100);
    if(newZone>=allZones.length) newZone=allZones.length-1;
    if(newZone>zoneIdx){
        zoneIdx=newZone;
        showToast(`🌌 Reached ${allZones[zoneIdx]}`,1500);
        if(zoneIdx>=baseZones.length) fracture++;
        updateUI();
    }
}

// Upgrades
function buyClick(){ if(gas>=clickCost){ gas-=clickCost; clickPower++; clickCost=Math.floor(clickCost*1.2); updateUI(); } }
function buyMega(){ if(gas>=megaCost){ gas-=megaCost; clickPower+=5; megaCost=Math.floor(megaCost*1.25); updateUI(); } }
function buyBot(){ if(gas>=botCost){ gas-=botCost; bots++; botCost=Math.floor(botCost*1.15); updateUI(); } }
function buyTurbo(){ if(gas>=turboCost){ gas-=turboCost; botEff++; turboCost=Math.floor(turboCost*1.2); updateUI(); } }

// Prestige + Skill Tree
function performPrestige() {
    if(zoneIdx<baseZones.length-1){ showToast("Reach 'The End...' first!",1500); return; }
    let gainedFracture = 10 + Math.floor(gas/1000);
    fracture += gainedFracture;
    showToast(`Quantum Leap! +${gainedFracture} Fracture Points`,2000);
    // Reset resources
    gas=0; clickPower=1; bots=0; botEff=1; zoneIdx=0;
    clickCost=50; megaCost=200; botCost=120; turboCost=300;
    globalMult = 1 + layer*0.2;
    layer++;
    updateZone();
    updateUI();
}

function applySkillTree() {
    let prodBonus = (skills.prod1?0.1:0) + (skills.prod2?0.25:0);
    globalMult = (1 + layer*0.2) * (1+prodBonus);
    if(skills.autoClick && !autoClickInterval){
        autoClickInterval = setInterval(()=>{ addGas(clickPower); },1000);
    } else if(!skills.autoClick && autoClickInterval){ clearInterval(autoClickInterval); autoClickInterval=null; }
    // petLover: increase petBonus multiplier
    if(skills.petLover && petActive) petBonus = 1.2 * 1.5;
    else if(petActive) petBonus=1.2;
    // chaosLuck handled in events
    updateUI();
}

// Pet system: crate opening
function openCrate() {
    let cost = 100;
    if(gas<cost){ showToast("Not enough gas",1000); return; }
    gas-=cost;
    let rarityIdx = Math.min(Math.floor(Math.random()*5) + (zoneIdx>baseZones.length?2:0),4);
    let petName = ["Beanling","Puff Sprout","Cosmic Hatchling","Void Bunny","Elder Bean"][rarityIdx];
    let bonusValue = [0.05,0.1,0.2,0.4,0.8][rarityIdx];
    ownedPets.push({ id:Date.now()+Math.random(), name:petName, bonus:bonusValue, equipped:false, rarity:rarityIdx });
    showToast(`📦 Opened: ${petName} (+${bonusValue*100}% production)`,2000);
    updateUI();
    renderInventory();
}

function renderInventory() {
    let container = document.getElementById("petInventoryList");
    if(!container) return;
    container.innerHTML = ownedPets.map((p,idx)=>`<div class="pet-card"><span>${p.name} (${crateRarity[p.rarity]})<br>+${p.bonus*100}%</span><button onclick="toggleEquip(${idx})">${p.equipped?"Unequip":"Equip"}</button></div>`).join("");
    let equipped = ownedPets.filter(p=>p.equipped).map(p=>p.name).join(", ");
    document.getElementById("equippedList").innerText = equipped||"None";
    let activePet = ownedPets.find(p=>p.equipped);
    petActive = !!activePet;
    petBonus = activePet?1+activePet.bonus:1;
    if(skills.petLover && petActive) petBonus = 1 + (activePet.bonus*1.5);
    updateUI();
}

function toggleEquip(idx){
    if(ownedPets.filter(p=>p.equipped).length>=3 && !ownedPets[idx].equipped){
        showToast("Max 3 pets equipped",1000);
        return;
    }
    ownedPets[idx].equipped = !ownedPets[idx].equipped;
    renderInventory();
}

function autoEquipBest(){
    ownedPets.forEach(p=>p.equipped=false);
    let sorted = [...ownedPets].sort((a,b)=>b.bonus - a.bonus);
    for(let i=0;i<Math.min(3,sorted.length);i++) sorted[i].equipped=true;
    renderInventory();
}

// Boss system
const bossList = [
    { name:"🐉 Lag Entity", effect:()=>{ globalMult*=0.8; updateUI(); }, resolveCost:5, resolve:()=>{ globalMult/=0.8; updateUI(); } },
    { name:"💰 Inflation Engine", effect:()=>{ clickCost*=1.5; megaCost*=1.5; botCost*=1.5; turboCost*=1.5; updateUI(); }, resolveCost:8, resolve:()=>{ clickCost/=1.5; megaCost/=1.5; botCost/=1.5; turboCost/=1.5; updateUI(); } }
];
function trySpawnBoss(){
    if(zoneIdx<20) return;
    if(activeThreats.length===0 && Math.random()<0.25){
        let boss = JSON.parse(JSON.stringify(bossList[Math.floor(Math.random()*bossList.length)]));
        boss.effect();
        activeThreats.push(boss);
        showToast(`⚠️ BOSS: ${boss.name} appears!`,4000);
        renderThreats();
    }
}
function renderThreats(){
    threatPanel.innerHTML = activeThreats.map((b,idx)=>`<div class="threat-item"><span>😈 ${b.name}</span><button onclick="resolveBoss(${idx})">Defeat (${b.resolveCost} FP)</button></div>`).join("");
    if(activeThreats.length===0) threatPanel.innerHTML = "<div>No active threats</div>";
}
function resolveBoss(idx){
    let b=activeThreats[idx];
    if(fracture>=b.resolveCost){
        fracture-=b.resolveCost;
        b.resolve();
        activeThreats.splice(idx,1);
        showToast(`Defeated ${b.name}!`,2000);
        renderThreats();
        updateUI();
    } else showToast(`Need ${b.resolveCost} Fracture Points`,1200);
}
window.resolveBoss = resolveBoss;

// Random events (enhanced)
const eventList = [
    { name:"🌱 Bean Rain", act:()=>{ addGas(50); return "Gained 50 gas!"; } },
    { name:"✨ Golden Bean", act:()=>{ addGas(clickPower*20); return `+${clickPower*20} gas!`; } },
    { name:"💨 Surge", act:()=>{ let old=globalMult; globalMult*=1.2; setTimeout(()=>{ globalMult=old; updateUI(); },30000); return "Global +20% for 30s"; } }
];
function triggerRandomEvent(){
    let ev = eventList[Math.floor(Math.random()*eventList.length)];
    let msg = ev.act();
    if(skills.chaosLuck && Math.random()<0.5) { ev.act(); msg += " (doubled by Chaos!)"; }
    eventLog.innerHTML = `✨ ${ev.name}: ${msg}`;
    showToast(msg,2500);
    setTimeout(()=>{ eventLog.innerHTML="✨ Events will appear here"; },4000);
    updateUI();
}

// Cutscene effect (when reaching final zone)
function playCutscene(){
    let overlay = document.getElementById("cutsceneOverlay");
    let text = document.getElementById("cutsceneText");
    overlay.classList.remove("hidden");
    text.innerText = "🌀 You pierced the veil... The Universe awakens.";
    setTimeout(()=>{ overlay.classList.add("hidden"); },3000);
}

// Modal handling
function openSkillTree(){
    document.getElementById("skillTreeModal").classList.remove("hidden");
    document.getElementById("modalFracture").innerText = fracture;
}
function closeModals(){
    document.getElementById("skillTreeModal").classList.add("hidden");
    document.getElementById("inventoryModal").classList.add("hidden");
}
function buySkill(skillId, cost){
    if(fracture>=cost && !skills[skillId]){
        fracture-=cost;
        skills[skillId]=1;
        applySkillTree();
        updateUI();
        showToast(`Skill ${skillId} unlocked!`,1500);
        document.getElementById("modalFracture").innerText = fracture;
    } else showToast("Not enough FP or already owned",1000);
}

// Save / Load
function saveGame(){
    let save = { gas, clickPower, bots, botEff, zoneIdx, layer, globalMult, fracture, petActive, petBonus, ownedPets, skills, clickCost, megaCost, botCost, turboCost, activeThreats:activeThreats.map(t=>t.name) };
    localStorage.setItem("BeanEmpireSave",JSON.stringify(save));
}
function loadGame(){
    let raw = localStorage.getItem("BeanEmpireSave");
    if(raw){
        let d = JSON.parse(raw);
        gas=d.gas??0; clickPower=d.clickPower??1; bots=d.bots??0; botEff=d.botEff??1;
        zoneIdx=d.zoneIdx??0; layer=d.layer??0; globalMult=d.globalMult??1; fracture=d.fracture??0;
        petActive=d.petActive??false; petBonus=d.petBonus??1; ownedPets=d.ownedPets??[];
        skills=d.skills??{prod1:0,prod2:0,autoClick:0,bossKiller:0,petLover:0,chaosLuck:0};
        clickCost=d.clickCost??50; megaCost=d.megaCost??200; botCost=d.botCost??120; turboCost=d.turboCost??300;
        activeThreats=[];
        applySkillTree();
        updateZone();
        updateUI();
        renderInventory();
    }
    setInterval(()=>saveGame(),30000);
    startGameLoops();
}
function startGameLoops(){
    setInterval(()=>{ if(!document.hidden) addGas(bots*botEff); },1000);
    setInterval(()=>triggerRandomEvent(), 90000);
    setInterval(()=>trySpawnBoss(), 75000);
}

// Click handler
function clickBean(e){
    let gain = clickPower;
    if(Math.random()<0.12) gain = Math.floor(clickPower*2.5);
    addGas(gain);
    e.currentTarget.style.transform="scale(0.92)";
    setTimeout(()=>{ if(e.currentTarget) e.currentTarget.style.transform=""; },80);
}

// Event binding
document.getElementById("bean").addEventListener("click", clickBean);
document.getElementById("upgradeClick").onclick=buyClick;
document.getElementById("upgradeMega").onclick=buyMega;
document.getElementById("buyBot").onclick=buyBot;
document.getElementById("upgradeBot").onclick=buyTurbo;
document.getElementById("prestigeBtn").onclick=performPrestige;
document.getElementById("skillTreeBtn").onclick=openSkillTree;
document.getElementById("openCrateBtn").onclick=openCrate;
document.getElementById("inventoryBtn").onclick=()=>{ renderInventory(); document.getElementById("inventoryModal").classList.remove("hidden"); };
document.getElementById("autoEquipBest").onclick=autoEquipBest;
document.getElementById("clearEquip").onclick=()=>{ ownedPets.forEach(p=>p.equipped=false); renderInventory(); };
document.querySelectorAll(".close-modal").forEach(btn=>btn.onclick=closeModals);
document.querySelectorAll(".buySkill").forEach((btn,idx)=>{
    let skillId = ["prod1","prod2","autoClick","bossKiller","petLover","chaosLuck"][idx];
    let cost = [5,15,20,10,12,18][idx];
    btn.onclick = ()=>buySkill(skillId,cost);
});

function showToast(msg, dur){
    let t = document.createElement("div");
    t.className="toast";
    t.innerText=msg;
    document.body.appendChild(t);
    setTimeout(()=>t.remove(),dur);
}

loadGame();
updateUI();
