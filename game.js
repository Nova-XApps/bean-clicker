// BEAN CLICKER: FART ASCENT - Game Logic

// Game State
let gameState = {
    coins: 0,
    totalCoinsEarned: 0,
    totalClicks: 0,
    altitude: 0,
    maxAltitude: 0,
    rebirthCount: 0,
    rebirthMultiplier: 1.0,
    currentSkin: 'classic',
    currentCharacter: '🧍',
    clickMultiplier: 1,
    autoPerSecond: 0,
    fartPower: 10,
    combo: 1,
    lastClickTime: 0,
    comboDecayInterval: null,
    altitudeDecayInterval: null
};

// Upgrades Database
const upgrades = [
    { id: 'click', name: 'Bean Multiplier', emoji: '✨', baseCost: 15, costMultiplier: 1.5, level: 0, maxLevel: 10, effect: (lvl) => ({ clickMultiplier: 1 + lvl * 0.5 }) },
    { id: 'fart', name: 'Fart Strength', emoji: '💨', baseCost: 30, costMultiplier: 1.6, level: 0, maxLevel: 10, effect: (lvl) => ({ fartPower: 10 + lvl * 8 }) },
    { id: 'auto', name: 'Auto-Beaner 3000', emoji: '🤖', baseCost: 80, costMultiplier: 1.4, level: 0, maxLevel: 15, effect: (lvl) => ({ autoPerSecond: lvl * 0.5 }) },
    { id: 'combo', name: 'Combo Amplifier', emoji: '🔥', baseCost: 45, costMultiplier: 1.7, level: 0, maxLevel: 8, effect: (lvl) => ({ comboBonus: lvl * 0.3 }) },
    { id: 'core', name: 'Golden Bean Core', emoji: '🌟', baseCost: 250, costMultiplier: 2.0, level: 0, maxLevel: 5, effect: (lvl) => ({ clickMultiplierBonus: lvl * 1.0 }) }
];

// Skins Database
const skins = [
    { id: 'classic', name: 'Classic Bean', emoji: '🫘', cost: 0, owned: true, equipped: true },
    { id: 'golden', name: 'Golden Bean', emoji: '🌟🫘', cost: 500, owned: false, equipped: false },
    { id: 'toxic', name: 'Toxic Bean', emoji: '☢️🫘', cost: 1200, owned: false, equipped: false },
    { id: 'galaxy', name: 'Galaxy Bean', emoji: '🌌🫘', cost: 3500, owned: false, equipped: false },
    { id: 'diamond', name: 'Diamond Bean', emoji: '💎🫘', cost: 8000, owned: false, equipped: false }
];

// Characters Database
const characters = [
    { id: 'dude', emoji: '🧍', name: 'Dude', owned: true, active: true },
    { id: 'lady', emoji: '🧍‍♀️', name: 'Lady', cost: 1000, owned: false, active: false },
    { id: 'dancer', emoji: '🕺', name: 'Dancer', cost: 2500, owned: false, active: false },
    { id: 'disco', emoji: '💃', name: 'Disco', cost: 5000, owned: false, active: false },
    { id: 'athlete', emoji: '🤸', name: 'Athlete', cost: 10000, owned: false, active: false },
    { id: 'astronaut', emoji: '👨‍🚀', name: 'Astronaut', cost: 20000, owned: false, active: false }
];

// DOM Elements
const elements = {
    coins: document.getElementById('stat-coins'),
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
    rebirthCount: document.getElementById('rebirth-count'),
    rebirthMultiplier: document.getElementById('rebirth-multiplier'),
    beanBtn: document.getElementById('bean-btn'),
    character: document.getElementById('character'),
    fartCloud: document.getElementById('fart-cloud'),
    upgradesList: document.getElementById('upgrades-list'),
    skinsList: document.getElementById('skins-list'),
    charsList: document.getElementById('chars-list'),
    allStatsContainer: document.getElementById('all-stats-container'),
    milestonePopup: document.getElementById('milestone-popup')
};

// Helper Functions
function formatNumber(num) {
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return Math.floor(num).toString();
}

function updateUI() {
    // Calculate current bonuses
    let clickBonus = 1;
    let autoBonus = 0;
    let fartBonus = 10;
    let comboBonus = 0;
    
    upgrades.forEach(upg => {
        if (upg.id === 'click') clickBonus += upg.level * 0.5;
        if (upg.id === 'auto') autoBonus += upg.level * 0.5;
        if (upg.id === 'fart') fartBonus = 10 + upg.level * 8;
        if (upg.id === 'combo') comboBonus = upg.level * 0.3;
        if (upg.id === 'core') clickBonus += upg.level * 1.0;
    });
    
    const totalClickMult = clickBonus * gameState.rebirthMultiplier;
    const coinsPerClick = totalClickMult * gameState.combo;
    
    elements.coins.textContent = formatNumber(gameState.coins);
    elements.perClick.textContent = coinsPerClick.toFixed(1);
    elements.perSecond.textContent = autoBonus.toFixed(1);
    elements.altitude.textContent = Math.floor(gameState.altitude);
    elements.maxAlt.textContent = Math.floor(gameState.maxAltitude);
    elements.totalClicks.textContent = gameState.totalClicks;
    elements.fartPowerVal.textContent = fartBonus;
    
    const fartPercent = Math.min(100, (gameState.altitude / 500) * 100);
    elements.fartMeterFill.style.width = fartPercent + '%';
    elements.comboMultiplier.textContent = gameState.combo.toFixed(1);
    
    // Update zone based on altitude
    let zone = { name: 'Ground Level', emoji: '🌍', stars: false };
    if (gameState.altitude >= 10000) zone = { name: 'SPACE!', emoji: '🚀🌌', stars: true };
    else if (gameState.altitude >= 5000) zone = { name: 'Stratosphere', emoji: '☁️✈️', stars: true };
    else if (gameState.altitude >= 2000) zone = { name: 'Cloud City', emoji: '☁️🏰', stars: false };
    else if (gameState.altitude >= 500) zone = { name: 'High Sky', emoji: '🪶', stars: false };
    else if (gameState.altitude >= 100) zone = { name: 'Low Orbit', emoji: '🎈', stars: false };
    
    elements.zoneName.textContent = zone.name;
    elements.zoneEmoji.textContent = zone.emoji;
    document.getElementById('sky-stars').style.opacity = zone.stars ? '0.6' : '0';
}

function addCoins(amount) {
    gameState.coins += amount;
    gameState.totalCoinsEarned += amount;
    updateUI();
    renderUpgrades();
    renderSkins();
    renderCharacters();
}

function clickBean() {
    // Calculate click value
    let clickBonus = 1;
    upgrades.forEach(upg => {
        if (upg.id === 'click') clickBonus += upg.level * 0.5;
        if (upg.id === 'core') clickBonus += upg.level * 1.0;
    });
    const totalClickMult = clickBonus * gameState.rebirthMultiplier;
    const coinsEarned = totalClickMult * gameState.combo;
    
    addCoins(coinsEarned);
    gameState.totalClicks++;
    
    // Combo system
    const now = Date.now();
    if (now - gameState.lastClickTime < 1500) {
        gameState.combo = Math.min(15, gameState.combo + 0.2);
    } else {
        gameState.combo = 1;
    }
    gameState.lastClickTime = now;
    
    // Add altitude based on fart power
    let fartBonus = 10;
    upgrades.forEach(upg => { if (upg.id === 'fart') fartBonus = 10 + upg.level * 8; });
    const altitudeGain = fartBonus * gameState.combo * (0.5 + gameState.rebirthMultiplier * 0.2);
    gameState.altitude += altitudeGain;
    if (gameState.altitude > gameState.maxAltitude) gameState.maxAltitude = gameState.altitude;
    
    // Visual effects
    elements.beanBtn.classList.add('clicking');
    setTimeout(() => elements.beanBtn.classList.remove('clicking'), 150);
    
    elements.fartCloud.classList.add('puffing');
    setTimeout(() => elements.fartCloud.classList.remove('puffing'), 400);
    
    createParticles();
    createFloatingText(`+${Math.floor(coinsEarned)}`, '#d4a843');
    
    updateUI();
    renderUpgrades();
    checkMilestones();
}

function createParticles() {
    const container = document.getElementById('particles');
    for (let i = 0; i < 8; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.width = particle.style.height = Math.random() * 8 + 4 + 'px';
        particle.style.background = `hsl(${Math.random() * 60 + 30}, 70%, 60%)`;
        particle.style.setProperty('--px', (Math.random() - 0.5) * 150 + 'px');
        particle.style.setProperty('--py', (Math.random() - 0.5) * 100 - 50 + 'px');
        container.appendChild(particle);
        setTimeout(() => particle.remove(), 900);
    }
}

function createFloatingText(text, color) {
    const container = document.getElementById('floats');
    const el = document.createElement('div');
    el.className = 'float-text';
    el.textContent = text;
    el.style.color = color;
    el.style.left = (window.innerWidth / 2 + (Math.random() - 0.5) * 150) + 'px';
    el.style.top = (window.innerHeight / 2 - 50) + 'px';
    container.appendChild(el);
    setTimeout(() => el.remove(), 1200);
}

function checkMilestones() {
    const milestones = [100, 500, 1000, 5000, 10000, 50000, 100000];
    for (let m of milestones) {
        if (gameState.totalCoinsEarned >= m && !window[`milestone_${m}`]) {
            window[`milestone_${m}`] = true;
            showMilestone(`🏆 ${formatNumber(m)} Coins! 🏆`);
        }
    }
    if (gameState.altitude >= 10000 && !window.milestone_space) {
        window.milestone_space = true;
        showMilestone('🚀 YOU REACHED SPACE! 🚀');
    }
}

function showMilestone(text) {
    const popup = elements.milestonePopup;
    popup.textContent = text;
    popup.classList.remove('hidden');
    setTimeout(() => popup.classList.add('hidden'), 2500);
}

// Altitude decay
setInterval(() => {
    if (gameState.altitude > 0) {
        let decay = Math.max(0.5, gameState.altitude * 0.002);
        gameState.altitude = Math.max(0, gameState.altitude - decay);
        updateUI();
    }
}, 1000);

// Auto income
setInterval(() => {
    let autoBonus = 0;
    upgrades.forEach(upg => { if (upg.id === 'auto') autoBonus += upg.level * 0.5; });
    if (autoBonus > 0) {
        const income = autoBonus * gameState.rebirthMultiplier;
        addCoins(income);
        createFloatingText(`+${income.toFixed(0)} auto`, '#6fcf6f');
    }
}, 1000);

// Combo decay
setInterval(() => {
    if (Date.now() - gameState.lastClickTime > 1500 && gameState.combo > 1) {
        gameState.combo = Math.max(1, gameState.combo - 0.3);
        updateUI();
    }
}, 500);

function buyUpgrade(upgrade) {
    if (upgrade.level >= upgrade.maxLevel) return;
    let cost = Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, upgrade.level));
    if (gameState.coins >= cost) {
        gameState.coins -= cost;
        upgrade.level++;
        addCoins(0);
        updateUI();
        renderUpgrades();
        showMilestone(`⬆️ ${upgrade.name} Lv.${upgrade.level}!`);
    }
}

function buySkin(skin) {
    if (skin.owned) {
        // Equip skin
        skins.forEach(s => { s.equipped = false; });
        skin.equipped = true;
        gameState.currentSkin = skin.id;
        elements.beanBtn.textContent = skin.emoji;
        renderSkins();
    } else if (gameState.coins >= skin.cost) {
        gameState.coins -= skin.cost;
        skin.owned = true;
        skin.equipped = true;
        skins.forEach(s => { if (s.id !== skin.id) s.equipped = false; });
        elements.beanBtn.textContent = skin.emoji;
        renderSkins();
        showMilestone(`🎨 Unlocked ${skin.name}!`);
    }
    updateUI();
}

function buyCharacter(char) {
    if (char.owned) {
        characters.forEach(c => { c.active = false; });
        char.active = true;
        gameState.currentCharacter = char.emoji;
        elements.character.textContent = char.emoji;
        renderCharacters();
    } else if (gameState.coins >= char.cost) {
        gameState.coins -= char.cost;
        char.owned = true;
        char.active = true;
        characters.forEach(c => { if (c.id !== char.id) c.active = false; });
        elements.character.textContent = char.emoji;
        renderCharacters();
        showMilestone(`🎭 Got ${char.name}!`);
    }
    updateUI();
}

function rebirth() {
    const requiredAlt = 5000;
    if (gameState.maxAltitude < requiredAlt) {
        showMilestone(`❌ Need ${requiredAlt}m altitude to rebirth!`);
        return;
    }
    
    gameState.rebirthCount++;
    gameState.rebirthMultiplier = 1 + gameState.rebirthCount * 0.5;
    gameState.coins = 0;
    gameState.altitude = 0;
    gameState.combo = 1;
    
    // Reset upgrades but keep skins and characters
    upgrades.forEach(upg => upg.level = 0);
    
    updateUI();
    renderUpgrades();
    renderSkins();
    renderCharacters();
    showMilestone(`⭐ REBIRTH #${gameState.rebirthCount}! +${(gameState.rebirthMultiplier * 100).toFixed(0)}% bonus! ⭐`);
}

function renderUpgrades() {
    let html = '';
    upgrades.forEach(upg => {
        const cost = Math.floor(upg.baseCost * Math.pow(upg.costMultiplier, upg.level));
        const canAfford = gameState.coins >= cost;
        const maxed = upg.level >= upg.maxLevel;
        html += `
            <div class="upgrade-card ${canAfford && !maxed ? 'affordable' : ''} ${maxed ? 'maxed' : ''}" onclick="buyUpgrade(upgrades.find(u=>u.id=='${upg.id}'))">
                <div class="upg-emoji">${upg.emoji}</div>
                <div class="upg-info">
                    <div class="upg-name">${upg.name} Lv.${upg.level}/${upg.maxLevel}</div>
                    <div class="upg-desc">${upg.id === 'click' ? '+50% coins/click' : upg.id === 'fart' ? '+8 launch power' : upg.id === 'auto' ? '+0.5 auto/sec' : upg.id === 'combo' ? '+0.3x combo' : '+1x base coins'}</div>
                </div>
                <div class="upg-cost ${canAfford && !maxed ? 'can' : ''}">${maxed ? 'MAX' : cost}</div>
            </div>
        `;
    });
    elements.upgradesList.innerHTML = html;
}

function renderSkins() {
    let html = '';
    skins.forEach(skin => {
        const owned = skin.owned;
        const equipped = skin.equipped;
        html += `
            <div class="skin-card ${equipped ? 'active' : ''}" onclick="buySkin(skins.find(s=>s.id=='${skin.id}'))">
                <div class="skin-emoji">${skin.emoji}</div>
                <div class="skin-info">
                    <div class="skin-name">${skin.name}</div>
                    <div class="skin-cost ${owned ? (equipped ? 'equipped' : 'owned') : ''}">${owned ? (equipped ? '✅ Equipped' : 'Owned') : skin.cost}</div>
                </div>
            </div>
        `;
    });
    elements.skinsList.innerHTML = html;
}

function renderCharacters() {
    let html = '';
    characters.forEach(char => {
        const owned = char.owned;
        const active = char.active;
        html += `
            <div class="char-card ${active ? 'active' : ''}" onclick="buyCharacter(characters.find(c=>c.id=='${char.id}'))">
                <div>${char.emoji}</div>
                <div style="font-size:0.7rem; margin-top:4px;">${char.name}</div>
                <div style="font-size:0.6rem; color:#6fcf6f;">${owned ? (active ? '✔️' : 'Owned') : char.cost}</div>
            </div>
        `;
    });
    elements.charsList.innerHTML = html;
}

function renderAllStats() {
    let html = '';
    const stats = [
        ['Total Coins Earned', formatNumber(gameState.totalCoinsEarned)],
        ['Total Clicks', formatNumber(gameState.totalClicks)],
        ['Max Altitude', Math.floor(gameState.maxAltitude) + ' m'],
        ['Current Altitude', Math.floor(gameState.altitude) + ' m'],
        ['Rebirth Count', gameState.rebirthCount],
        ['Rebirth Multiplier', '×' + gameState.rebirthMultiplier.toFixed(1)],
        ['Skins Owned', skins.filter(s => s.owned).length + ' / ' + skins.length],
        ['Characters Owned', characters.filter(c => c.owned).length + ' / ' + characters.length]
    ];
    stats.forEach(([k, v]) => {
        html += `<div class="all-stat-row"><span class="k">${k}</span><span class="v">${v}</span></div>`;
    });
    elements.allStatsContainer.innerHTML = html;
}

// Tab switching
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
        if (btn.dataset.tab === 'stats') renderAllStats();
    });
});

// Event listeners
elements.beanBtn.addEventListener('click', clickBean);
document.getElementById('rebirth-btn').addEventListener('click', rebirth);

// Initialize game
function init() {
    updateUI();
    renderUpgrades();
    renderSkins();
    renderCharacters();
    renderAllStats();
    setInterval(() => { if (document.querySelector('.tab-btn.active').dataset.tab === 'stats') renderAllStats(); }, 1000);
}

init();
