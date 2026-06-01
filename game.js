let gas = 0;
let power = 1;
let zoneIndex = 0;

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

const gasEl = document.getElementById("gas");
const powerEl = document.getElementById("power");
const zoneEl = document.getElementById("zone");

const cutscene = document.getElementById("cutscene");
const cutsceneText = document.getElementById("cutsceneText");

document.getElementById("beanBtn").onclick = () => {
    gas += power;
    update();
    checkZone();
};

document.getElementById("upgradeBtn").onclick = () => {
    if (gas >= 50) {
        gas -= 50;
        power++;
        update();
    }
};

function update() {
    gasEl.textContent = gas;
    powerEl.textContent = power;
    zoneEl.textContent = zones[zoneIndex];
    save();
}

function checkZone() {
    let newZone = Math.floor(gas / 100);

    if (newZone >= zones.length - 1 && zoneIndex !== zones.length - 1) {
        zoneIndex = zones.length - 1;
        update();
        playCutscene();
        return;
    }

    if (newZone > zoneIndex) {
        zoneIndex = newZone;
        update();
    }
}

async function playCutscene() {
    cutscene.style.display = "flex";

    cutsceneText.textContent = "Congratulations... you reached the end.";

    await wait(3000);

    cutsceneText.textContent = "...or so you think.";

    await wait(3000);

    cutsceneText.textContent = "A crack in reality appears...";

    await wait(3000);

    cutsceneText.textContent = "The Void has awakened.";

    await wait(3000);

    gas += 1000;
    zoneIndex = zones.length - 1;

    cutscene.style.display = "none";
    update();
}

function wait(ms) {
    return new Promise(res => setTimeout(res, ms));
}

/* SAVE SYSTEM */
function save() {
    localStorage.setItem("beanGame", JSON.stringify({
        gas,
        power,
        zoneIndex
    }));
}

function load() {
    let data = JSON.parse(localStorage.getItem("beanGame"));
    if (!data) return;

    gas = data.gas;
    power = data.power;
    zoneIndex = data.zoneIndex;

    update();
}

load();


