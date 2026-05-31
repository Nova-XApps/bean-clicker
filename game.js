/* ══════════════════════════════════════════════
   BEAN CLICKER: FART ASCENT — game.js
   Cookie Clicker-style incremental game
══════════════════════════════════════════════ */

const game = (() => {

  // ─── GAME DATA ──────────────────────────────────────────────────────────────

  const UPGRADE_DEFS = [
    {
      id: 'beanMult', name: 'Bean Multiplier', emoji: '✨',
      desc: '+50% coins per click',
      baseCost: 15, costScale: 1.55,
    },
    {
      id: 'fartStrength', name: 'Fart Strength', emoji: '💨',
      desc: '+20 launch power',
      baseCost: 30, costScale: 1.65,
    },
    {
      id: 'fartSize', name: 'Fart Cloud Tier', emoji: '☁️',
      desc: 'Bigger, badder clouds',
      baseCost: 60, costScale: 2.0, maxLevel: 4,
    },
    {
      id: 'autoBean', name: 'Auto-Beaner 3000', emoji: '🤖',
      desc: '+0.5 auto-clicks/sec',
      baseCost: 80, costScale: 1.75,
    },
    {
      id: 'combo', name: 'Combo Amplifier', emoji: '🔥',
      desc: '+0.5× combo multiplier',
      baseCost: 45, costScale: 1.6,
    },
    {
      id: 'gravity', name: 'Anti-Gravity Pants', emoji: '🩲',
      desc: '-20% altitude decay',
      baseCost: 120, costScale: 1.8, maxLevel: 4,
    },
    {
      id: 'goldBean', name: 'Golden Bean Core', emoji: '🌟',
      desc: '+2× base coins',
      baseCost: 250, costScale: 2.2,
    },
  ];

  const BEAN_SKINS = [
    { id: 'normal',  emoji: '🫘',      name: 'Classic Bean',  cost: 0 },
    { id: 'golden',  emoji: '✨🫘✨',   name: 'Golden Bean',   cost: 500 },
    { id: 'toxic',   emoji: '☢️🫘',    name: 'Toxic Bean',    cost: 1200 },
    { id: 'galaxy',  emoji: '🌌🫘🌌',  name: 'Galaxy Bean',   cost: 3500 },
    { id: 'diamond', emoji: '💎🫘💎',  name: 'Diamond Bean',  cost: 8000 },
  ];

  const CHARACTERS = [
    { id: 'stand',  emoji: '🧍',  name: 'Dude' },
    { id: 'woman',  emoji: '🧍‍♀️', name: 'Lady' },
    { id: 'dance',  emoji: '🕺',  name: 'Dancer' },
    { id: 'disco',  emoji: '💃',  name: 'Disco' },
    { id: 'gym',    emoji: '🤸', name: 'Athlete' },
    { id: 'astro',  emoji: '👨‍🚀', name: 'Astronaut' },
  ];

  const ZONES = [
    { altitude: 0,     name: 'Ground Level',   emoji: '🌱', bg: ['#1a2e1a', '#2d4a1e'], starOpacity: 0 },
    { altitude: 150,   name: 'Low Sky',         emoji: '🌤️', bg: ['#1a3a5c', '#1e5a8a'], starOpacity: 0 },
    { altitude: 600,   name: 'Cloud Zone',      emoji: '⛅', bg: ['#2a4a6e', '#3d6fa0'], starOpacity: 0 },
    { altitude: 2000,  name: 'High Altitude',   emoji: '🌥️', bg: ['#0f2a5e', '#1a3d8a'], starOpacity: 0.2 },
    { altitude: 6000,  name: 'Stratosphere',    emoji: '🌌', bg: ['#050a2e', '#0a1560'], starOpacity: 0.6 },
    { altitude: 20000, name: 'Space Edge',       emoji: '🚀', bg: ['#020510', '#08082a'], starOpacity: 1 },
    { altitude: 60000, name: '★ DEEP SPACE ★',  emoji: '🌠', bg: ['#000003', '#050510'], starOpacity: 1 },
  ];

  const FART_TIERS = [
    { minPow: 0,   color: '#c8e6c9', size: 1.0, label: 'Tiny Toot',   cloudBg: '#a5d6a7' },
    { minPow: 40,  color: '#81c784', size: 1.3, label: "Lil' Puff",   cloudBg: '#66bb6a' },
    { minPow: 100, color: '#ffb74d', size: 1.7, label: 'Solid Rip',   cloudBg: '#ffa726' },
    { minPow: 220, color: '#ff7043', size: 2.2, label: 'MEGA BLAST',  cloudBg: '#f4511e' },
    { minPow: 450, color: '#ce93d8', size: 2.8, label: '☠️ NUCLEAR',  cloudBg: '#ab47bc' },
  ];

  const NEWS_LINES = [
    '💨 Local man ascends to heaven via bean propulsion',
    '🫘 Scientists baffled: bean energy surpasses fossil fuels',
    '☁️ Cloud Zone residents flee mysterious green fog',
    '🚀 NASA considers bean-powered rocket program',
    '💰 Bean futures hit all-time high on galactic stock exchange',
    '🌌 Astronauts report unusual smell in the stratosphere',
    '🔥 Speed-clickers unionize, demand safer fart working conditions',
    '🧍 Man disappears into sky, only flatulence remains',
    '⭐ Rebirth system discovered — at what cost?',
    '🏆 World record broken: 50,000m altitude via artisanal bean diet',
  ];

  // ─── STATE ──────────────────────────────────────────────────────────────────

  const state = {
    coins: 0,
    totalCoins: 0,
    totalClicks: 0,
    altitude: 0,
    maxAltitude: 0,
    upgrades: { beanMult: 0, fartStrength: 0, fartSize: 0, autoBean: 0, combo: 0, gravity: 0, goldBean: 0 },
    beanSkin: 'normal',
    character: 'stand',
    ownedSkins: ['normal'],
    rebirth: 0,
    rebirthMult: 1,
    comboCount: 0,
    comboTimerId: null,
    autoTimerId: null,
    currentZone: 0,
    currentTab: 'upgrades',
    particleId: 0,
    floatId: 0,
    newsIdx: 0,
    lastSaved: Date.now(),
  };

  // ─── DERIVED STATS ──────────────────────────────────────────────────────────

  function getFartPower() {
    return 10 + state.upgrades.fartStrength * 20;
  }

  function getCoinPerClick() {
    const base = 1 + state.upgrades.goldBean * 2;
    const mult = 1 + state.upgrades.beanMult * 0.5;
    const combo = 1 + state.comboCount * (0.2 + state.upgrades.combo * 0.5);
    return Math.max(1, Math.floor(base * mult * combo * state.rebirthMult));
  }

  function getAutoRate() {
    return state.upgrades.autoBean * 0.5;
  }

  function getDecayRate() {
    const base = 0.4;
    const reduction = state.upgrades.gravity * 0.2;
    return Math.max(0.05, base - reduction);
  }

  function getFartSizeMult() {
    return [1, 1.3, 1.7, 2.2, 2.8][Math.min(state.upgrades.fartSize, 4)];
  }

  function getFartTier(power) {
    let tier = FART_TIERS[0];
    for (const t of FART_TIERS) { if (power >= t.minPow) tier = t; }
    return tier;
  }

  function getZone(altitude) {
    let zone = ZONES[0];
    let idx = 0;
    ZONES.forEach((z, i) => { if (altitude >= z.altitude) { zone = z; idx = i; } });
    return { zone, idx };
  }

  function getUpgradeCost(def, level) {
    return Math.ceil(def.baseCost * Math.pow(def.costScale, level));
  }

  // ─── MAIN CLICK ─────────────────────────────────────────────────────────────

  function click(e) {
    // Get position
    let cx = window.innerWidth / 2;
    let cy = window.innerHeight * 0.6;
    if (e && e.clientX !== undefined) { cx = e.clientX; cy = e.clientY; }

    // Combo
    state.comboCount = Math.min(state.comboCount + 1, 25);
    clearTimeout(state.comboTimerId);
    state.comboTimerId = setTimeout(() => { state.comboCount = 0; updateComboUI(); }, 1500);

    // Earn coins
    const earned = getCoinPerClick();
    state.coins += earned;
    state.totalCoins += earned;
    state.totalClicks++;

    // Launch altitude
    const power = getFartPower();
    const sizeMult = getFartSizeMult();
    const launch = (power + state.comboCount * 4) * sizeMult * 0.5;
    state.altitude += launch;
    state.maxAltitude = Math.max(state.maxAltitude, state.altitude);

    // Effects
    triggerBeanClick();
    triggerFartAnim(power, sizeMult);
    launchCharacter(launch);
    spawnParticles(cx, cy, power, sizeMult);
    spawnFloat(cx, cy - 20, `+${earned} 🪙`, '#FFD700');
    if (state.comboCount > 3) {
      spawnFloat(cx + 50, cy - 55, `${state.comboCount}× COMBO!`, '#FF6B35');
    }

    updateUI();
    checkZoneChange();
    updateRebirth();
  }

  // ─── AUTO CLICK ─────────────────────────────────────────────────────────────

  function startAutoLoop() {
    clearInterval(state.autoTimerId);
    const rate = getAutoRate();
    if (rate <= 0) return;
    state.autoTimerId = setInterval(() => {
      const earned = getCoinPerClick();
      state.coins += earned;
      state.totalCoins += earned;
      const power = getFartPower();
      const launch = power * getFartSizeMult() * 0.3;
      state.altitude += launch;
      state.maxAltitude = Math.max(state.maxAltitude, state.altitude);
      updateUI();
    }, 1000 / rate);
  }

  // ─── GRAVITY LOOP ───────────────────────────────────────────────────────────

  function startGravityLoop() {
    setInterval(() => {
      if (state.altitude > 0) {
        state.altitude = Math.max(0, state.altitude - getDecayRate());
        updateAltitudeUI();
      }
    }, 100);
  }

  // ─── BEAN CLICK ANIMATION ───────────────────────────────────────────────────

  function triggerBeanClick() {
    const btn = document.getElementById('bean-btn');
    btn.classList.add('clicking');
    setTimeout(() => btn.classList.remove('clicking'), 120);
  }

  // ─── FART ANIMATION ─────────────────────────────────────────────────────────

  function triggerFartAnim(power, sizeMult) {
    const tier = getFartTier(power + state.comboCount * 5);
    const cloud = document.getElementById('fart-cloud');
    const finalSize = tier.size * sizeMult * getFartSizeMult();

    cloud.style.width  = `${60 * finalSize}px`;
    cloud.style.height = `${36 * finalSize}px`;
    cloud.style.background = `radial-gradient(ellipse, ${tier.cloudBg}dd, ${tier.cloudBg}66, transparent)`;

    cloud.classList.remove('puffing');
    void cloud.offsetWidth; // reflow
    cloud.classList.add('puffing');
    setTimeout(() => cloud.classList.remove('puffing'), 420);
  }

  // ─── CHARACTER LAUNCH ───────────────────────────────────────────────────────

  function launchCharacter(launch) {
    const wrap = document.getElementById('character-wrap');
    const jumpH = Math.min(launch * 0.35, 120);
    wrap.style.transform = `translateY(-${jumpH}px)`;
    setTimeout(() => { wrap.style.transform = 'translateY(0)'; }, 500);
  }

  // ─── PARTICLES ──────────────────────────────────────────────────────────────

  function spawnParticles(cx, cy, power, sizeMult) {
    const container = document.getElementById('particles');
    const tier = getFartTier(power + state.comboCount * 5);
    const count = Math.min(6 + Math.floor(power / 30), 18);

    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      el.className = 'particle';
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const dist = 40 + Math.random() * 80;
      const size = 8 + Math.random() * 12;
      el.style.cssText = `
        left: ${cx}px; top: ${cy}px;
        width: ${size}px; height: ${size}px;
        background: ${tier.color};
        box-shadow: 0 0 8px ${tier.color};
        --px: ${Math.cos(angle) * dist}px;
        --py: ${Math.sin(angle) * dist - 30}px;
        animation-duration: ${0.7 + Math.random() * 0.5}s;
      `;
      container.appendChild(el);
      setTimeout(() => el.remove(), 1300);
    }
  }

  // ─── FLOATING TEXT ──────────────────────────────────────────────────────────

  function spawnFloat(x, y, text, color) {
    const container = document.getElementById('floats');
    const el = document.createElement('div');
    el.className = 'float-text';
    el.textContent = text;
    el.style.cssText = `left: ${x}px; top: ${y}px; color: ${color};`;
    container.appendChild(el);
    setTimeout(() => el.remove(), 1250);
  }

  // ─── ZONE CHANGE ────────────────────────────────────────────────────────────

  function checkZoneChange() {
    const { zone, idx } = getZone(state.altitude);
    if (idx !== state.currentZone) {
      state.currentZone = idx;
      updateZoneUI(zone);
      showMilestone(`${zone.emoji} Entered ${zone.name}!`);
    }
    updateCenterBg(zone);
  }

  function updateCenterBg(zone) {
    const center = document.getElementById('panel-center');
    center.style.background = `linear-gradient(180deg, ${zone.bg[0]} 0%, ${zone.bg[1]} 100%)`;
    const stars = document.getElementById('sky-stars');
    stars.style.opacity = zone.starOpacity;
  }

  function updateZoneUI(zone) {
    document.getElementById('zone-emoji').textContent = zone.emoji;
    document.getElementById('zone-name').textContent = zone.name;
  }

  function showMilestone(text) {
    const popup = document.getElementById('milestone-popup');
    const label = document.getElementById('milestone-text');
    label.textContent = text;
    popup.classList.remove('hidden');
    setTimeout(() => popup.classList.add('hidden'), 2800);
  }

  // ─── UPGRADES ───────────────────────────────────────────────────────────────

  function buyUpgrade(id) {
    const def = UPGRADE_DEFS.find(d => d.id === id);
    const level = state.upgrades[id];
    if (def.maxLevel && level >= def.maxLevel) return;
    const cost = getUpgradeCost(def, level);
    if (state.coins < cost) return;

    state.coins -= cost;
    state.upgrades[id]++;

    if (id === 'autoBean') startAutoLoop();

    spawnFloat(window.innerWidth / 2, window.innerHeight / 2 - 60, `⬆️ ${def.name}!`, '#6fcf6f');
    renderUpgrades();
    updateUI();
  }

  function renderUpgrades() {
    const list = document.getElementById('upgrades-list');
    list.innerHTML = '';
    UPGRADE_DEFS.forEach(def => {
      const level = state.upgrades[def.id];
      const maxed = def.maxLevel && level >= def.maxLevel;
      const cost = maxed ? 0 : getUpgradeCost(def, level);
      const canAfford = !maxed && state.coins >= cost;

      const card = document.createElement('div');
      card.className = `upgrade-card${canAfford ? ' affordable' : ''}${maxed ? ' maxed' : ''}`;
      card.innerHTML = `
        <div class="upg-emoji">${def.emoji}</div>
        <div class="upg-info">
          <div class="upg-name">${def.name} <span class="upg-level">Lv.${level}${def.maxLevel ? `/${def.maxLevel}` : ''}</span></div>
          <div class="upg-desc">${def.desc}</div>
        </div>
        <div class="upg-cost ${canAfford ? 'can' : ''} ${maxed ? 'maxed-label' : ''}">
          ${maxed ? 'MAX' : `🪙 ${fmtNum(cost)}`}
        </div>`;
      if (!maxed) card.onclick = () => buyUpgrade(def.id);
      list.appendChild(card);
    });
  }

  // ─── SKINS ──────────────────────────────────────────────────────────────────

  function buySkin(id) {
    const skin = BEAN_SKINS.find(s => s.id === id);
    const owned = state.ownedSkins.includes(id);
    if (!owned) {
      if (state.coins < skin.cost) return;
      state.coins -= skin.cost;
      state.ownedSkins.push(id);
    }
    state.beanSkin = id;
    document.getElementById('bean-emoji').textContent = skin.emoji;
    renderSkins();
    updateUI();
  }

  function selectChar(id) {
    state.character = id;
    const ch = CHARACTERS.find(c => c.id === id);
    document.getElementById('character').textContent = ch.emoji;
    renderSkins();
  }

  function renderSkins() {
    // Bean skins
    const skinsList = document.getElementById('skins-list');
    skinsList.innerHTML = '';
    BEAN_SKINS.forEach(skin => {
      const owned = state.ownedSkins.includes(skin.id);
      const active = state.beanSkin === skin.id;
      const card = document.createElement('div');
      card.className = `skin-card${active ? ' active' : ''}`;
      let costLabel = owned
        ? (active ? '<span class="skin-cost equipped">✅ Equipped</span>' : '<span class="skin-cost owned">✔ Owned — Equip</span>')
        : `<span class="skin-cost">🪙 ${fmtNum(skin.cost)}</span>`;
      card.innerHTML = `
        <div class="skin-emoji">${skin.emoji}</div>
        <div class="skin-info">
          <div class="skin-name">${skin.name}</div>
          ${costLabel}
        </div>`;
      card.onclick = () => buySkin(skin.id);
      skinsList.appendChild(card);
    });

    // Characters
    const charsList = document.getElementById('chars-list');
    charsList.innerHTML = '';
    CHARACTERS.forEach(ch => {
      const active = state.character === ch.id;
      const card = document.createElement('div');
      card.className = `char-card${active ? ' active' : ''}`;
      card.innerHTML = `<span>${ch.emoji}</span><small style="font-size:0.6rem;color:#aaa">${ch.name}</small>`;
      card.onclick = () => selectChar(ch.id);
      charsList.appendChild(card);
    });
  }

  // ─── REBIRTH ────────────────────────────────────────────────────────────────

  function doRebirth() {
    if (state.maxAltitude < 10000) return;
    if (!confirm(`⭐ REBIRTH?\n\nYou'll lose all coins, upgrades, and altitude.\nBut you'll gain a permanent ×1.5 coin multiplier!\n\nCurrent rebirths: ${state.rebirth}`)) return;

    state.rebirth++;
    state.rebirthMult *= 1.5;
    state.coins = 0;
    state.totalCoins = 0;
    state.altitude = 0;
    state.maxAltitude = 0;
    state.totalClicks = 0;
    state.upgrades = { beanMult: 0, fartStrength: 0, fartSize: 0, autoBean: 0, combo: 0, gravity: 0, goldBean: 0 };
    state.comboCount = 0;
    state.currentZone = 0;
    startAutoLoop();
    renderUpgrades();
    renderSkins();
    renderAllStats();
    updateUI();
    updateRebirth();
    showMilestone(`⭐ Rebirth ${state.rebirth}! ×${state.rebirthMult.toFixed(1)} bonus active!`);
    setNewsLine('⭐ REBIRTH! The bean cycle continues...');
  }

  function updateRebirth() {
    const btn = document.getElementById('rebirth-btn');
    const info = document.getElementById('rebirth-info');
    if (state.maxAltitude >= 10000) {
      btn.classList.remove('disabled');
    } else {
      btn.classList.add('disabled');
    }
    if (state.rebirth > 0) {
      info.classList.remove('hidden');
      document.getElementById('rebirth-count').textContent = state.rebirth;
      document.getElementById('rebirth-mult').textContent = state.rebirthMult.toFixed(1);
    }
  }

  // ─── UI UPDATES ─────────────────────────────────────────────────────────────

  function updateUI() {
    document.getElementById('stat-coins').textContent    = fmtNum(Math.floor(state.coins));
    document.getElementById('stat-cpc').textContent      = fmtNum(getCoinPerClick());
    document.getElementById('stat-cps').textContent      = getAutoRate().toFixed(1) + '/s';
    document.getElementById('stat-clicks').textContent   = fmtNum(state.totalClicks);
    updateAltitudeUI();
    updateComboUI();
    updateFartMeter();
    updateUpgradeAffordability();
  }

  function updateAltitudeUI() {
    document.getElementById('stat-altitude').textContent = fmtNum(Math.floor(state.altitude)) + ' m';
    document.getElementById('stat-maxalt').textContent   = fmtNum(Math.floor(state.maxAltitude)) + ' m';
  }

  function updateComboUI() {
    const el = document.getElementById('combo-display');
    if (state.comboCount > 1) {
      el.classList.remove('hidden');
      document.getElementById('combo-count').textContent = state.comboCount;
    } else {
      el.classList.add('hidden');
    }
  }

  function updateFartMeter() {
    const power = getFartPower();
    const pct = Math.min((power / 500) * 100, 100);
    document.getElementById('fart-meter').style.width = pct + '%';
    document.getElementById('fart-power-val').textContent = power;
    const tier = getFartTier(power);
    document.getElementById('fart-meter').style.background =
      `linear-gradient(90deg, #6fcf6f, ${tier.color})`;
  }

  function updateUpgradeAffordability() {
    const cards = document.querySelectorAll('.upgrade-card:not(.maxed)');
    cards.forEach(card => {
      // find cost from upg-cost text
      const costEl = card.querySelector('.upg-cost');
      if (!costEl) return;
      const id = UPGRADE_DEFS.find(d => card.querySelector('.upg-name')?.textContent.startsWith(d.name))?.id;
      if (!id) return;
      const def = UPGRADE_DEFS.find(d => d.id === id);
      const cost = getUpgradeCost(def, state.upgrades[id]);
      const can = state.coins >= cost;
      card.classList.toggle('affordable', can);
      costEl.classList.toggle('can', can);
    });
  }

  function renderAllStats() {
    const el = document.getElementById('all-stats-list');
    const rows = [
      ['Total Coins Earned', fmtNum(Math.floor(state.totalCoins))],
      ['Total Clicks', fmtNum(state.totalClicks)],
      ['Max Altitude', fmtNum(Math.floor(state.maxAltitude)) + ' m'],
      ['Current Altitude', fmtNum(Math.floor(state.altitude)) + ' m'],
      ['Coins/Click', fmtNum(getCoinPerClick())],
      ['Auto Rate', getAutoRate().toFixed(1) + '/s'],
      ['Fart Power', getFartPower()],
      ['Fart Cloud Tier', getFartTier(getFartPower()).label],
      ['Rebirth Count', state.rebirth],
      ['Rebirth Multiplier', '×' + state.rebirthMult.toFixed(1)],
      ['Bean Skins Owned', state.ownedSkins.length + ' / ' + BEAN_SKINS.length],
      ['Current Zone', getZone(state.altitude).zone.name],
    ];
    el.innerHTML = rows.map(([k, v]) => `
      <div class="all-stat-row">
        <span class="k">${k}</span>
        <span class="v">${v}</span>
      </div>`).join('');
  }

  // ─── TABS ───────────────────────────────────────────────────────────────────

  function setTab(id) {
    state.currentTab = id;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.getElementById(`tab-${id}`).classList.add('active');
    document.getElementById(`tab-content-${id}`).classList.add('active');
    if (id === 'stats') renderAllStats();
  }

  // ─── NEWS TICKER ────────────────────────────────────────────────────────────

  function rotateNews() {
    state.newsIdx = (state.newsIdx + 1) % NEWS_LINES.length;
    setNewsLine(NEWS_LINES[state.newsIdx]);
  }

  function setNewsLine(text) {
    const el = document.getElementById('news-text');
    el.textContent = text;
    // Reset animation
    const inner = document.getElementById('news-inner');
    inner.style.animation = 'none';
    void inner.offsetWidth;
    inner.style.animation = 'tickerScroll 20s linear infinite';
  }

  // ─── FORMAT HELPERS ─────────────────────────────────────────────────────────

  function fmtNum(n) {
    if (n >= 1e12) return (n / 1e12).toFixed(2) + 'T';
    if (n >= 1e9)  return (n / 1e9).toFixed(2) + 'B';
    if (n >= 1e6)  return (n / 1e6).toFixed(2) + 'M';
    if (n >= 1e3)  return (n / 1e3).toFixed(1) + 'K';
    return n.toLocaleString();
  }

  // ─── SAVE / LOAD ────────────────────────────────────────────────────────────

  function save() {
    try {
      const data = {
        coins: state.coins,
        totalCoins: state.totalCoins,
        totalClicks: state.totalClicks,
        altitude: state.altitude,
        maxAltitude: state.maxAltitude,
        upgrades: { ...state.upgrades },
        beanSkin: state.beanSkin,
        character: state.character,
        ownedSkins: [...state.ownedSkins],
        rebirth: state.rebirth,
        rebirthMult: state.rebirthMult,
      };
      localStorage.setItem('beanClickerSave', JSON.stringify(data));
    } catch(e) { /* no localStorage in some envs */ }
  }

  function load() {
    try {
      const raw = localStorage.getItem('beanClickerSave');
      if (!raw) return;
      const data = JSON.parse(raw);
      Object.assign(state, {
        coins:       data.coins       || 0,
        totalCoins:  data.totalCoins  || 0,
        totalClicks: data.totalClicks || 0,
        altitude:    data.altitude    || 0,
        maxAltitude: data.maxAltitude || 0,
        upgrades:    data.upgrades    || state.upgrades,
        beanSkin:    data.beanSkin    || 'normal',
        character:   data.character   || 'stand',
        ownedSkins:  data.ownedSkins  || ['normal'],
        rebirth:     data.rebirth     || 0,
        rebirthMult: data.rebirthMult || 1,
      });
    } catch(e) { /* corrupt save, ignore */ }
  }

  // ─── INIT ───────────────────────────────────────────────────────────────────

  function init() {
    load();

    // Restore visual state
    const skin = BEAN_SKINS.find(s => s.id === state.beanSkin) || BEAN_SKINS[0];
    document.getElementById('bean-emoji').textContent = skin.emoji;
    const ch = CHARACTERS.find(c => c.id === state.character) || CHARACTERS[0];
    document.getElementById('character').textContent = ch.emoji;
    const { zone } = getZone(state.altitude);
    updateZoneUI(zone);
    updateCenterBg(zone);
    state.currentZone = getZone(state.altitude).idx;

    // Render panels
    renderUpgrades();
    renderSkins();
    renderAllStats();
    updateUI();
    updateRebirth();

    // Loops
    startAutoLoop();
    startGravityLoop();

    // News rotation
    setInterval(rotateNews, 18000);

    // Auto-save every 30 seconds
    setInterval(save, 30000);

    // Periodic upgrade re-render (to update affordability)
    setInterval(renderUpgrades, 2000);

    console.log('%c🫘 Bean Clicker: Fart Ascent loaded!', 'color:#d4a843;font-size:1.2em;font-weight:bold');
  }

  // ─── PUBLIC API ─────────────────────────────────────────────────────────────

  return { click, doRebirth, setTab, init, buyUpgrade, buySkin, selectChar };

})();

// Boot
document.addEventListener('DOMContentLoaded', () => game.init());
