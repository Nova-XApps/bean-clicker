let beans = 0;
let gas = 0;
let beansPerClick = 1;

// click system
function clickBean() {
  beans += beansPerClick;
  updateUI();
}

// gas generation system
setInterval(() => {
  gas += Math.floor(beans / 10);
  updateUI();
}, 1000);

// update screen
function updateUI() {
  document.getElementById("beans").textContent = beans;
  document.getElementById("gas").textContent = gas;
}
