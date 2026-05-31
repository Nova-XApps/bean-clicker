let beans = 0;
let gas = 0;

let beansPerClick = 1;
let autoBeans = 0;

let clickCost = 10;
let autoCost = 25;

let multiplier = 1;
let prestigePoints = 0;

// CLICK
function clickBean() {
  beans += beansPerClick * multiplier;
  update();
}

// UPGRADES
function buyClickPower() {
  if (beans >= clickCost) {
    beans -= clickCost;
    beansPerClick += 1;
    clickCost = Math.floor(clickCost * 1.6);
    update();
  }
}

function buyAutoBean() {
  if (beans >= autoCost) {
    beans -= autoCost;
    autoBeans += 1;
    autoCost = Math.floor(autoCost * 1.7);
    update();
  }
}

// PRESTIGE SYSTEM
function prestige() {
  if (beans < 500) {
    alert("Need at least 500 beans to prestige");
    return;
  }

  prestigePoints += Math.floor(beans / 500);

  multiplier = 1 + prestigePoints * 0.25;

  beans = 0;
  gas = 0;
  beansPerClick = 1;
  autoBeans = 0;
  clickCost = 10;
  autoCost = 25;

  update();
}

// GAME LOOP
setInterval(() => {
  beans += autoBeans * multiplier;

  gas += Math.floor(beans * 0.03);

  // simple "ending trigger"
  if (beans >= 10000) {
    document.getElementById("status").textContent =
      "ENDING REACHED: You became the Bean Emperor 🫘👑";
  }

  update();
  saveGame();
}, 1000);

// UI UPDATE
function update() {
  document.getElementById("beans").textContent = Math.floor(beans);
  document.getElementById("gas").textContent = gas;

  document.getElementById("clickCost").textContent = clickCost;
  document.getElementById("autoCost").textContent = autoCost;

  document.getElementById("mult").textContent =
    "Multiplier: " + multiplier.toFixed(2) + "x";
}

// SAVE
function saveGame() {
  localStorage.setItem("beanSave", JSON.stringify({
    beans,
    gas,
    beansPerClick,
    autoBeans,
    clickCost,
    autoCost,
    multiplier,
    prestigePoints
  }));
}

// LOAD
function loadGame() {
  let data = JSON.parse(localStorage.getItem("beanSave"));
  if (!data) return;

  beans = data.beans;
  gas = data.gas;
  beansPerClick = data.beansPerClick;
  autoBeans = data.autoBeans;
  clickCost = data.clickCost;
  autoCost = data.autoCost;
  multiplier = data.multiplier;
  prestigePoints = data.prestigePoints;

  update();
}

loadGame();
