// BEAN CLICKER: FART ASCENT – Full game logic with save/load

// ----- DATA STRUCTURES -----
let gameState = {
    beans: 0,
    totalBeansEarned: 0,
    totalClicks: 0,
    altitude: 0,
    maxAltitude: 0,
    rebirthCount: 0,
    rebirthMultiplier: 1.0,
    combo: 1,
    lastClickTime: 0
};

const upgrades = [
    { id: 'click', name: 'Bean Multiplier', emoji: '✨', baseCost: 15, costMultiplier: 1.5, level: 0, maxLevel: 20, effect: (lvl) => ({ clickMult: 1 + lvl * 0.5 }) },
    { id: 'fart', name: 'Fart Strength', emoji: '💨', baseCost: 30, costMultiplier: 1.6, level: 0, maxLevel: 15, effect: (lvl) => ({ fartPower: 10 + lvl * 8 }) },
    { id: 'combo', name: 'Combo Amplifier', emoji: '🔥', baseCost: 45, costMultiplier: 1.7, level: 0, maxLevel: 10, effect: (lvl) => ({ comboBonus: lvl * 0.3 }) },
    { id: 'core', name: 'Golden Bean Core', emoji: '🌟', baseCost: 250, costMultiplier: 2.0, level: 0, maxLevel: 8, effect: (lvl) => ({ globalMult: 1 + lvl * 0.5 }) }
];

const producers = [
    { id: 'auto1', name: 'Sole Farter', emoji: '👞💨', baseCost: 50, costMultiplier: 1.4, count: 0, baseProd: 1, desc: '1 bean/sec' },
    { id: 'auto2', name: 'Bean Blower', emoji: '🌬️🫘', baseCost: 200, costMultiplier: 1.5, count: 0, baseProd: 5, desc: '5 beans/sec' },
    { id: 'auto3', name: 'Fart Factory', emoji: '🏭💨', baseCost: 800, costMultiplier: 1.6, count: 0, baseProd: 25, desc: '25 beans/sec' },
    { id: 'auto4', name: 'Bean Rocket', emoji: '🚀🫘', baseCost: 3000, costMultiplier: 1.7, count: 0, baseProd: 120, desc: '120 beans/sec' },
    { id: 'auto5', name: 'Galactic Fart', emoji: '🌌💨', baseCost: 12000, costMultiplier: 1.8, count: 0, baseProd: 600, desc: '600 beans/sec' }
];

const skins = [
    { id: 'classic', name: 'Classic Bean', emoji: '🫘', cost: 0, owned: true, equipped: true },
    { id: 'golden', name: 'Golden Bean', emoji: '🌟🫘', cost: 500, owned: false, equipped: false },
    { id: 'toxic', name: 'Toxic Bean', emoji: '☢️🫘', cost: 1200, owned: false, equipped: false },
    { id: 'galaxy', name: 'Galaxy Bean', emoji: '🌌🫘', cost: 3500, owned: false, equipped: false },
    { id: 'diamond', name: 'Diamond Bean', emoji: '💎🫘', cost: 8000, owned: false, equipped: false }
];

const characters = [
    { id: 'dude', emoji: '🧍', name: 'Dude', cost: 0, owned: true, active: true },
    { id: 'lady', emoji: '🧍‍♀️', name: 'Lady', cost: 1000, owned: false, active: false },
    { id: 'dancer', emoji: '🕺', name: 'Dancer', cost: 2500, owned: false, active: false },
    { id: 'disco', emoji: '💃', name: 'Disco', cost: 5000, owned: false, active: false },
    { id: 'athlete', emoji: '🤸', name: 'Athlete', cost: 10000, owned: false, active: false },
    { id: 'astronaut', emoji: '👨‍🚀', name: 'Astronaut', cost: 20000, owned: false, active: false }
];

// ----- DOM Elements -----
const elements = {
    beans: document.getElementById('stat-beans'),
    perClick: document.getElementById('stat-perclick'),
    perSecond: document.getElementById('stat-persecond'),
    altitude: document.getElementById('stat-altitude'),
    maxAlt: document.getElementById('stat-maxalt'),
    totalClicks: document.getElementById('stat-clicks'),
    fartPowerVal: document.getElementById('fart-power-val'),
    fartMeterFill: document.getElementById('fart-meter-fill'),
    comboMultiplier: document.getElementById('combo-multiplier'),
    zoneName: document.getElementById('zone-name'),
    zoneEmoji: document.getElementById('zone-emoji'),
    rebirthCountSpan: document.getElementById('rebirth-count'),
    rebirthMultiplierSpan: document.getElementById('rebirth-multiplier'),
    beanBtn: document.getElementById('bean-btn'),
    characterDiv: document.getElementById('character'),
    fartCloud: document.getElementById('fart-cloud'),
    upgradesList: document.getElementById('upgrades-list'),
    producersList: document.getElementById('producers-list'),
    skinsList: document.getElementById('skins-list'),
    charsList: document.getElementById('chars-list'),
    allStatsContainer: document.getElementById('all-stats-container'),
    milestonePopup: document.getElementById('milestone-popup')
};

// ----- Helper Functions -----
function formatNumber(num) {
    if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return Math.floor(num).toString();
}

function calculateClickValue() {
    let clickBonus = 1, globalBonus = 1, comboBonus = 0;
    upgrades.forEach(upg => {
        if (upg.id === 'click') clickBonus += upg.level * 0.5;
        if (upg.id === 'core') globalBonus += upg.level * 0.5;
        if (upg.id === 'combo') comboBonus = upg.level * 0.3;
    });
    const total = clickBonus * globalBonus * gameState.rebirthMultiplier;
    return total * gameState.combo;
}

function getFartPower() {
    const fartUpg = upgrades.find(u => u.id === 'fart');
    return fartUpg ? 10 + fartUpg.level * 8 : 10;
}

function getAutoRate() {
    return producers.reduce((sum, p) => sum + p.count * p.baseProd, 0);
}

function updateUI() {
    elements.beans.textContent = formatNumber(gameState.beans);
    elements.perClick.textContent = calculateClickValue().toFixed(1);
    elements.perSecond.textContent = getAutoRate().toFixed(1);
    elements.altitude.textContent = Math.floor(gameState.altitude);
    elements.maxAlt.textContent = Math.floor(gameState.maxAltitude);
    elements.totalClicks.textContent = gameState.totalClicks;
    elements.fartPowerVal.textContent = getFartPower();
    const percent = Math.min(100, (gameState.altitude / 1000) * 100);
    elements.fartMeterFill.style.width = percent + '%';
    elements.comboMultiplier.textContent = gameState.combo.toFixed(1);
    elements.rebirthCountSpan.textContent = gameState.rebirthCount;
    elements.rebirthMultiplierSpan.textContent = gameState.rebirthMultiplier.toFixed(1);

    // Zone logic
    let zone = { name: 'Ground Level', emoji: '🌍', stars: false };
    if (gameState.altitude >= 15000) zone = { name: 'OUTER SPACE!', emoji: '🚀🌠', stars: true };
    else if (gameState.altitude >= 8000) zone = { name: 'Stratosphere', emoji: '☁️✨', stars: true };
    else if (gameState.altitude >= 3000) zone = { name: 'Cloud City', emoji: '☁️🏰', stars: false };
    else if (gameState.altitude >= 800) zone = { name: 'High Sky', emoji: '🪶', stars: false };
    else if (gameState.altitude >= 150) zone = { name: 'Low Orbit', emoji: '🎈', stars: false };
    elements.zoneName.textContent = zone.name;
    elements.zoneEmoji.textContent = zone.emoji;
    document.getElementById('sky-stars').style.opacity = zone.stars ? '0.7' : '0';
}

function addBeans(amount) {
    gameState.beans += amount;
    gameState.totalBeansEarned += amount;
    updateUI();
    saveGame();
    renderUpgrades();
    renderProducers();
    renderSkins();
    renderCharacters();
    checkMilestones();
}

function showMilestone(text) {
    const popup = elements.milestonePopup;
    popup.textContent = text;
    popup.classList.remove('hidden');
    setTimeout(() => popup.classList.add('hidden'), 2500);
}

function checkMilestones() {
    const milestones = [100, 500, 1000, 5000, 10000, 50000, 100000, 500000, 1000000];
    for (let m of milestones) {
        if (gameState.totalBeansEarned >= m && !window[`ms_${m}`]) {
            window[`ms_${m}`] = true;
            showMilestone(`🏆 ${formatNumber(m)} Beans! 🏆`);
        }
    }
    if (gameState.altitude >= 15000 && !window.ms_space) {
        window.ms_space = true;
        showMilestone('🚀 YOU REACHED OUTER SPACE! 🚀');
    }
}

// ----- Visual Effects -----
function createParticles() {
    const container = document.getElementById('particles');
    for (let i = 0; i < 10; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.style.left = Math.random() * 100 + '%';
        p.style.top = Math.random() * 100 + '%';
        p.style.width = p.style.height = Math.random() * 8 + 4 + 'px';
        p.style.background = `hsl(${Math.random() * 60 + 30}, 70%, 60%)`;
        p.style.setProperty('--px', (Math.random() - 0.5) * 180 + 'px');
        p.style.setProperty('--py', (Math.random() - 0.5) * 120 - 60 + 'px');
        container.appendChild(p);
        setTimeout(() => p.remove(), 900);
    }
}

function createFloatingText(text, color) {
    const container = document.getElementById('floats');
    const el = document.createElement('div');
    el.className = 'float-text';
    el.textContent = text;
    el.style.color = color;
    el.style.left = (window.innerWidth / 2 + (Math.random() - 0.5) * 200) + 'px';
    el.style.top = (window.innerHeight / 2 - 50) + 'px';
    container.appendChild(el);
    setTimeout(() => el.remove(), 1200);
}

// ----- Core Game Actions -----
function clickBean() {
    const earned = calculateClickValue();
    addBeans(earned);
    gameState.totalClicks++;

    // Combo
    const now = Date.now();
    if (now - gameState.lastClickTime < 1500) {
        gameState.combo = Math.min(20, gameState.combo + 0.2);
    } else {
        gameState.combo = 1;
    }
    gameState.lastClickTime = now;

    // Altitude gain
    const gain = getFartPower() * gameState.combo * (0.3 + gameState.rebirthMultiplier * 0.2);
    gameState.altitude += gain;
    if (gameState.altitude > gameState.maxAltitude) gameState.maxAltitude = gameState.altitude;

    // Visual feedback
    elements.beanBtn.classList.add('clicking');
    setTimeout(() => elements.beanBtn.classList.remove('clicking'), 150);
    elements.fartCloud.classList.add('puffing');
    setTimeout(() => elements.fartCloud.classList.remove('puffing'), 400);
    createParticles();
    createFloatingText(`+${Math.floor(earned)}`, '#d4a843');

    updateUI();
    saveGame();
    renderUpgrades();
    renderProducers();
}

function buyUpgrade(upgrade) {
    if (upgrade.level >= upgrade.maxLevel) return;
    let cost = Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, upgrade.level));
    if (gameState.beans >= cost) {
        gameState.beans -= cost;
        upgrade.level++;
        addBeans(0);
        showMilestone(`⬆️ ${upgrade.name} Lv.${upgrade.level}!`);
        updateUI();
        renderUpgrades();
        saveGame();
    }
}

function buyProducer(producer) {
    let cost = Math.floor(producer.baseCost * Math.pow(producer.costMultiplier, producer.count));
    if (gameState.beans >= cost) {
        gameState.beans -= cost;
        producer.count++;
        addBeans(0);
        showMilestone(`🏭 Bought ${producer.name} #${producer.count}!`);
        updateUI();
        renderProducers();
        saveGame();
    }
}

function buySkin(skin) {
    if (skin.owned) {
        skins.forEach(s => s.equipped = false);
        skin.equipped = true;
        elements.beanBtn.textContent = skin.emoji;
        renderSkins();
        saveGame();
    } else if (gameState.beans >= skin.cost) {
        gameState.beans -= skin.cost;
        skin.owned = true;
        skin.equipped = true;
        skins.forEach(s => { if (s.id !== skin.id) s.equipped = false; });
        elements.beanBtn.textContent = skin.emoji;
        renderSkins();
        showMilestone(`🎨 Unlocked ${skin.name}!`);
        updateUI();
        saveGame();
    }
}

function buyCharacter(char) {
    if (char.owned) {
        characters.forEach(c => c.active = false);
        char.active = true;
        elements.characterDiv.textContent = char.emoji;
        renderCharacters();
        saveGame();
    } else if (gameState.beans >= char.cost) {
        gameState.beans -= char.cost;
        char.owned = true;
        char.active = true;
        characters.forEach(c => { if (c.id !== char.id) c.active = false; });
        elements.characterDiv.textContent = char.emoji;
        renderCharacters();
        showMilestone(`🎭 Got ${char.name}!`);
        updateUI();
        saveGame();
    }
}

function rebirth() {
    const requiredAlt = 5000;
    if (gameState.maxAltitude < requiredAlt) {
        showMilestone(`❌ Need ${requiredAlt}m altitude to rebirth!`);
        return;
    }
    gameState.rebirthCount++;
    gameState.rebirthMultiplier = 1 + gameState.rebirthCount * 0.4;
    gameState.beans = 0;
    gameState.altitude = 0;
    gameState.combo = 1;
    upgrades.forEach(upg => upg.level = 0);
    producers.forEach(prod => prod.count = 0);
    updateUI();
    renderUpgrades();
    renderProducers();
    renderSkins();
    renderCharacters();
    showMilestone(`⭐ REBIRTH #${gameState.rebirthCount}! +${(gameState.rebirthMultiplier * 100).toFixed(0)}% bonus! ⭐`);
    saveGame();
}

// ----- Rendering Functions -----
function renderUpgrades() {
    let html = '';
    upgrades.forEach(upg => {
        const cost = Math.floor(upg.baseCost * Math.pow(upg.costMultiplier, upg.level));
        const canAfford = gameState.beans >= cost;
        const maxed = upg.level >= upg.maxLevel;
        html += `<div class="upgrade-card ${canAfford && !maxed ? 'affordable' : ''} ${maxed ? 'maxed' : ''}" onclick="buyUpgrade(upgrades.find(u=>u.id=='${upg.id}'))">
            <div class="upg-emoji">${upg.emoji}</div>
            <div class="upg-info">
                <div class="upg-name">${upg.name} Lv.${upg.level}/${upg.maxLevel}</div>
                <div class="upg-desc">${upg.id==='click'?'+50% click':upg.id==='fart'?'+8 power':upg.id==='combo'?'+0.3x combo':'+50% global'}</div>
            </div>
            <div class="upg-cost ${canAfford && !maxed ? 'can' : ''}">${maxed ? 'MAX' : cost}</div>
        </div>`;
    });
    elements.upgradesList.innerHTML = html;
}

function renderProducers() {
    let html = '';
    producers.forEach(prod => {
        const cost = Math.floor(prod.baseCost * Math.pow(prod.costMultiplier, prod.count));
        const canAfford = gameState.beans >= cost;
        html += `<div class="producer-card ${canAfford ? 'affordable' : ''}" onclick="buyProducer(producers.find(p=>p.id=='${prod.id}'))">
            <div class="prod-emoji">${prod.emoji}</div>
            <div class="prod-info">
                <div class="prod-name">${prod.name}</div>
                <div class="prod-count">Owned: ${prod.count}</div>
                <div class="prod-desc">${prod.desc}</div>
            </div>
            <div class="prod-cost ${canAfford ? 'can' : ''}">${cost}</div>
        </div>`;
    });
    elements.producersList.innerHTML = html;
}

function renderSkins() {
    let html = '';
    skins.forEach(skin => {
        const owned = skin.owned;
        const equipped = skin.equipped;
        html += `<div class="skin-card ${equipped ? 'active' : ''}" onclick="buySkin(skins.find(s=>s.id=='${skin.id}'))">
            <div class="skin-emoji">${skin.emoji}</div>
            <div class="skin-info">
                <div class="skin-name">${skin.name}</div>
                <div class="skin-cost ${owned ? (equipped ? 'equipped' : 'owned') : ''}">${owned ? (equipped ? '✅ Equipped' : 'Owned') : skin.cost}</div>
            </div>
        </div>`;
    });
    elements.skinsList.innerHTML = html;
}

function renderCharacters() {
    let html = '';
    characters.forEach(char => {
        const owned = char.owned;
        const active = char.active;
        html += `<div class="char-card ${active ? 'active' : ''}" onclick="buyCharacter(characters.find(c=>c.id=='${char.id}'))">
            <div>${char.emoji}</div>
            <div style="font-size:0.7rem; margin-top:4px;">${char.name}</div>
            <div style="font-size:0.6rem; color:#6fcf6f;">${owned ? (active ? '✔️' : 'Owned') : char.cost}</div>
        </div>`;
    });
    elements.charsList.innerHTML = html;
}

function renderAllStats() {
    let html = '';
    const stats = [
        ['Total Beans Earned', formatNumber(gameState.totalBeansEarned)],
        ['Total Clicks', formatNumber(gameState.totalClicks)],
        ['Max Altitude', Math.floor(gameState.maxAltitude) + ' m'],
        ['Current Altitude', Math.floor(gameState.altitude) + ' m'],
        ['Rebirth Count', gameState.rebirthCount],
        ['Rebirth Multiplier', '×' + gameState.rebirthMultiplier.toFixed(1)],
        ['Skins Owned', skins.filter(s => s.owned).length + ' / ' + skins.length],
        ['Characters Owned', characters.filter(c => c.owned).length + ' / ' + characters.length],
        ['Auto Rate', getAutoRate().toFixed(1) + '/s']
    ];
    stats.forEach(([k, v]) => { html += `<div class="all-stat-row"><span class="k">${k}</span><span class="v">${v}</span></div>`; });
    elements.allStatsContainer.innerHTML = html;
}

// ----- Save / Load -----
function saveGame() {
    const saveData = {
        gameState,
        upgrades: upgrades.map(u => ({ id: u.id, level: u.level })),
        producers: producers.map(p => ({ id: p.id, count: p.count })),
        skins: skins.map(s => ({ id: s.id, owned: s.owned, equipped: s.equipped })),
        characters: characters.map(c => ({ id: c.id, owned: c.owned, active: c.active }))
    };
    localStorage.setItem('beanClickerSave', JSON.stringify(saveData));
}

function loadGame() {
    const raw = localStorage.getItem('beanClickerSave');
    if (!raw) return;
    try {
        const data = JSON.parse(raw);
        Object.assign(gameState, data.gameState);
        // Restore upgrades
        data.upgrades.forEach(savedUpg => {
            const upg = upgrades.find(u => u.id === savedUpg.id);
            if (upg) upg.level = savedUpg.level;
        });
        // Restore producers
        data.producers.forEach(savedProd => {
            const prod = producers.find(p => p.id === savedProd.id);
            if (prod) prod.count = savedProd.count;
        });
        // Restore skins
        data.skins.forEach(savedSkin => {
            const skin = skins.find(s => s.id === savedSkin.id);
            if (skin) {
                skin.owned = savedSkin.owned;
                skin.equipped = savedSkin.equipped;
            }
        });
        // Restore characters
        data.characters.forEach(savedChar => {
            const ch = characters.find(c => c.id === savedChar.id);
            if (ch) {
                ch.owned = savedChar.owned;
                ch.active = savedChar.active;
            }
        });
        // Apply equipped skin and character
        const equippedSkin = skins.find(s => s.equipped);
        if (equippedSkin) elements.beanBtn.textContent = equippedSkin.emoji;
        const activeChar = characters.find(c => c.active);
        if (activeChar) elements.characterDiv.textContent = activeChar.emoji;
        updateUI();
        renderUpgrades();
        renderProducers();
        renderSkins();
        renderCharacters();
        renderAllStats();
    } catch(e) { console.warn("Failed to load save", e); }
}

// ----- Auto Income & Decay -----
setInterval(() => {
    const rate = getAutoRate();
    if (rate > 0) {
        const income = rate * gameState.rebirthMultiplier;
        gameState.beans += income;
        gameState.totalBeansEarned += income;
        updateUI();
        saveGame();
        createFloatingText(`+${income.toFixed(0)} auto`, '#6fcf6f');
        renderUpgrades();
        renderProducers();
        checkMilestones();
    }
}, 1000);

setInterval(() => {
    if (gameState.altitude > 0) {
        let decay = Math.max(0.3, gameState.altitude * 0.0015);
        gameState.altitude = Math.max(0, gameState.altitude - decay);
        updateUI();
        saveGame();
    }
}, 1000);

setInterval(() => {
    if (Date.now() - gameState.lastClickTime > 1500 && gameState.combo > 1) {
        gameState.combo = Math.max(1, gameState.combo - 0.25);
        updateUI();
        saveGame();
    }
}, 500);

// ----- Tab Switching -----
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
        if (btn.dataset.tab === 'stats') renderAllStats();
    });
});

// ----- Event Listeners & Initialization -----
elements.beanBtn.addEventListener('click', clickBean);
document.getElementById('rebirth-btn').addEventListener('click', rebirth);

loadGame();
updateUI();
renderUpgrades();
renderProducers();
renderSkins();
renderCharacters();
renderAllStats();
setInterval(() => { if (document.querySelector('.tab-btn.active').dataset.tab === 'stats') renderAllStats(); }, 1000);
