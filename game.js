let coins = 0;
let altitude = 0;

let upgrades = {
  mult: 1,
  power: 1
};

const coinEl = document.getElementById("coins");
const altEl = document.getElementById("altitude");
const bean = document.getElementById("bean");

function update() {
  coinEl.innerText = Math.floor(coins);
  altEl.innerText = Math.floor(altitude);
}

bean.onclick = () => {
  const earned = 1 * upgrades.mult;
  const launch = 10 * upgrades.power;

  coins += earned;
  altitude += launch;

  setTimeout(() => {
    altitude -= launch * 0.4;
    update();
  }, 400);

  update();
};

function buyUpgrade(type) {
  const cost = type === "mult" ? 10 : 25;

  if (coins < cost) return;

  coins -= cost;

  if (type === "mult") upgrades.mult += 1;
  if (type === "power") upgrades.power += 1;

  update();
}

update();
