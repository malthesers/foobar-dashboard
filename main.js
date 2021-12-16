"use strict";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);
//import "./styles/style.scss";

window.addEventListener("DOMContentLoaded", () => {
  getData();

  getTheme();
  document.querySelector(".theme-switch").addEventListener("change", switchTheme);

  document.querySelectorAll("nav a").forEach((a) => {
    a.addEventListener("click", (e) => {
      document.querySelector(".active").classList.remove("active");
      e.target.classList.add("active");
    });
  });
});

//Const of included beers
const beersToInclude = ["El Hefe", "Fairy Tale Ale", "GitHop", "Hollaback Lager", "Hoppily Ever After", "Mowintime", "Sleighride"];

function getData() {
  const dataURL = "https://group-7-foo-bar.herokuapp.com/";
  fetch(dataURL)
    .then((res) => res.json())
    .then((data) => {
      showBartenders(data.bartenders);
      showQueue(data.queue);
      showServing(data.serving);
      showTime(data.timestamp, data.bar.closingTime);
      getKegs(data.taps);
      showTotalOrders(data.queue);
      showOrderNumbers(data.queue, data.serving);
      showInventory(data.storage);
      showSales(data.queue);

      //Recall functin after 1s
      setTimeout(getData, 1000);
    });
}

function showBartenders(bartenders) {
  bartenders.forEach((bartender) => {
    const bartenderServing = document.querySelector(`#section-bartenders article[data-bartender="${bartender.name}"] .bartender-serving`);
    const bartenderStatus = document.querySelector(`#section-bartenders article[data-bartender="${bartender.name}"] .bartender-status-dot`);

    if (bartender.servingCustomer === null) {
      bartenderServing.textContent = "Not serving";
    } else {
      bartenderServing.textContent = `Serving: #${bartender.servingCustomer}`;
    }

    if (bartender.status === "WORKING") {
      bartenderStatus.classList.add("dot-working");
    } else if (bartender.status === "READY") {
      bartenderStatus.classList.add("dot-ready");
    }
  });

  bartenders.forEach((bartender) => {
    const bartenderServing = document.querySelector(`#section-manager article[data-bartender="${bartender.name}"] .bartender-serving`);
    const bartenderStatus = document.querySelector(`#section-manager article[data-bartender="${bartender.name}"] .bartender-status-dot`);

    if (bartender.servingCustomer === null) {
      bartenderServing.textContent = "Not serving";
    } else {
      bartenderServing.textContent = `Serving: #${bartender.servingCustomer}`;
    }

    if (bartender.status === "WORKING") {
      bartenderStatus.classList.add("dot-working");
    } else if (bartender.status === "READY") {
      bartenderStatus.classList.add("dot-ready");
    }

    //bartenderStatus.textContent = `Status: ${bartender.status}`;
  });
}

function getKegs(taps) {
  const beersUrl = "https://group-7-foo-bar.herokuapp.com/beertypes";
  fetch(beersUrl)
    .then((res) => res.json())
    .then((kegs) => {
      //Filter through beers
      const filteredBeers = kegs.filter((beer) => {
        //Go through beers to include for each beer
        return beersToInclude.some((inclBeer) => {
          //Return true only for beers in beersToInclude
          return inclBeer === beer.name ? true : false;
        });
      });
      //Call sortBeers with parameters filteredBeers and taps
      sortBeers(filteredBeers, taps);
    });
}

function sortBeers(beers, taps) {
  let currentTap = 0;

  beers.forEach((beer) => {
    beer.level = taps[currentTap].level;

    currentTap++;
  });

  const sortedBeers = beers.sort(function (a, b) {
    return a.level - b.level;
  });

  showRemaining(sortedBeers);
}

function showRemaining(beers) {
  const container = document.querySelector(".storage-articles");
  container.innerHTML = " ";

  //Laver et nyt array, som kun består af de 4 første øl
  beers.slice(0, 4).forEach((beer) => {
    //Update beer labels to webp from png
    beer.label = beer.label.replace(".png", ".webp");

    //clone template
    const kegClone = document.querySelector("#template-keg").cloneNode(true).content;

    //each template get image, name and remaining
    kegClone.querySelector("img").src = `./images/kegs/${beer.label}`;
    kegClone.querySelector("h4").textContent = beer.name;
    kegClone.querySelector("h5").textContent = `${beer.level} cl`;

    const shadow = kegClone.querySelector(".keg-image-shadow");

    if (beer.level < 101) {
      shadow.classList.add("shadow-low");
    } else if (beer.level < 501) {
      shadow.classList.add("shadow-middle");
    } else if (beer.level > 500) {
      shadow.classList.add("shadow-high");
    }

    // insert/append content in container
    container.appendChild(kegClone);
  });
}

function showQueue(orders) {
  const container = document.querySelector(".queue-container");
  container.innerHTML = " ";

  orders.forEach((order) => {
    //Clone order template
    const orderClone = document.querySelector("#template-order").cloneNode(true).content;

    //Make count of beers in each order
    const beers = {};
    order.order.forEach((beer) => {
      const newBeer = replaceBeer(beer);

      beers[newBeer] = (beers[newBeer] || 0) + 1;
    });

    //Create h4 for each beer and append to items
    for (const property in beers) {
      const beerItem = document.createElement("h4");
      beerItem.textContent = `${beers[property]} ${property}`;
      orderClone.querySelector(".order-items").appendChild(beerItem);
    }

    //Convert UNIX to time stamp
    const time = new Date(order.startTime);
    const hours = time.getHours();
    const minutes = time.getMinutes().toString().padStart(2, "0");

    //Insert order id and time stamp
    orderClone.querySelector(".order-id").textContent = `#${order.id}`;
    orderClone.querySelector(".order-time").textContent = `${hours}:${minutes}`;

    container.appendChild(orderClone);
  });
}

function showServing(orders) {
  const container = document.querySelector(".serving-container");
  container.innerHTML = " ";

  orders.forEach((order) => {
    //Clone order template
    const orderClone = document.querySelector("#template-order").cloneNode(true).content;

    //Make count of beers in each order
    const beers = {};
    order.order.forEach((beer) => {
      const newBeer = replaceBeer(beer);

      beers[newBeer] = (beers[newBeer] || 0) + 1;
    });

    //Create h4 for each beer and append to items
    for (const property in beers) {
      const beerItem = document.createElement("h4");
      beerItem.textContent = `${beers[property]} ${property}`;
      orderClone.querySelector(".order-items").appendChild(beerItem);
    }

    //Convert UNIX to time stamp
    const time = new Date(order.startTime);
    const hours = getTime(time, "hours");
    const minutes = getTime(time, "minutes");

    //Insert order id and time stamp
    orderClone.querySelector(".order-id").textContent = `#${order.id}`;
    orderClone.querySelector(".order-time").textContent = `${hours}:${minutes}`;

    container.appendChild(orderClone);
  });
}

function showTime(timestamp, closingTime) {
  const date = new Date(timestamp);
  const hours = getTime(date, "hours");
  const minutes = getTime(date, "minutes");
  const seconds = getTime(date, "seconds");

  const time = `${hours}:${minutes}:${seconds}`;

  document.querySelector(".header-current-time").textContent = time;

  showRemainingTime(time, closingTime);
}

function showRemainingTime(currentTime, closingTime) {
  //Split time into hours, min and sec
  const currentTimes = currentTime.split(":");
  const closingTimes = closingTime.split(":");

  //Convert to dates
  const currentDate = new Date(0, 0, 0, currentTimes[0], currentTimes[1], currentTimes[2]);
  const closingDate = new Date(0, 0, 0, closingTimes[0], closingTimes[1], closingTimes[2]);

  //Get difference in UNIX
  const timeDiff = closingDate.getTime() - currentDate.getTime();

  //Calculate hours, min and sec based on difference
  const remainingHours = Math.floor(timeDiff / 1000 / 60 / 60)
    .toString()
    .padStart(2, "0");
  const remainingMin = Math.floor(timeDiff / 1000 / 60 - remainingHours * 60)
    .toString()
    .padStart(2, "0");
  const remainingSec = Math.floor(timeDiff / 1000 - remainingHours * 60 * 60 - remainingMin * 60)
    .toString()
    .padStart(2, "0");

  const remainingTime = `${remainingHours}:${remainingMin}:${remainingSec}`;

  document.querySelector(".header-remaining-time").textContent = `Closing in: ${remainingTime}`;
}

function getTime(time, unit) {
  unit === "hours" ? (time = time.getHours().toString().padStart(2, "0")) : time;
  unit === "minutes" ? (time = time.getMinutes().toString().padStart(2, "0")) : time;
  unit === "seconds" ? (time = time.getSeconds().toString().padStart(2, "0")) : time;

  return time;
}

function showTotalOrders(queue) {
  if (queue.length > 0) {
    const index = queue.length - 1;

    const totalOrders = queue[index].id;

    document.querySelector("#section-bartenders .total-orders").textContent = totalOrders;
  }

  if (queue.length > 0) {
    const index = queue.length - 1;

    const totalOrders = queue[index].id;

    document.querySelector("#section-manager .total-orders").textContent = totalOrders;
  }
}

function getTheme() {
  //Get locally stored theme
  const theme = localStorage.getItem("theme") ? localStorage.getItem("theme") : "dark";

  //Change theme if not default/dark
  if (theme === "light") {
    document.querySelector("input").checked = true;
    switchTheme();
  }
}

function switchTheme() {
  const html = document.querySelector("html");
  const logo = document.querySelector(".foobar-logo");

  //Change theme based on previous theme and update logo
  if (html.dataset.theme === "dark") {
    html.dataset.theme = "light";
    logo.style.backgroundImage = "url(./images/icons/foobar-logo-light.svg)";
  } else if (html.dataset.theme === "light") {
    html.dataset.theme = "dark";
    logo.style.backgroundImage = "url(./images/icons/foobar-logo-dark.svg)";
  }

  //Store new theme locally
  localStorage.setItem("theme", html.dataset.theme);
}

function showOrderNumbers(queue, serving) {
  const totalQueue = queue.length;
  const totalServing = serving.length;

  document.querySelector(".in-queue-number").textContent = totalQueue;
  document.querySelector(".being-served-number").textContent = totalServing;
}

function showInventory(kegs) {
  const container = document.querySelector(".inventory-articles");
  container.innerHTML = " ";

  //Filter through beers
  const filteredKegs = kegs.filter((keg) => {
    //Go through beers to include for each beer
    return beersToInclude.some((inclBeer) => {
      //Return true only for beers in beersToInclude
      return inclBeer === keg.name ? true : false;
    });
  });

  //Empty canvas container
  document.querySelector("#inventory-chart-container").innerHTML = " ";

  //Create new canvas element
  const inventoryChart = document.createElement("canvas");
  inventoryChart.id = "inventory-chart";
  inventoryChart.width = "auto";
  inventoryChart.height = "auto";
  document.querySelector("#inventory-chart-container").appendChild(inventoryChart);

  const labels = ["El Hefe", "Fairy Tale Ale", "GitHop", "Hollaback Lager", "Hoppily Ever After", "Mowintime", "Sleighride"];
  const data = {
    labels: labels,
    datasets: [
      {
        label: "Inventory",
        data: [
          filteredKegs[0].amount,
          filteredKegs[1].amount,
          filteredKegs[2].amount,
          filteredKegs[3].amount,
          filteredKegs[4].amount,
          filteredKegs[5].amount,
          filteredKegs[6].amount,
        ],
        backgroundColor: ["#FFD750"],
        borderColor: ["#FFD750"],
        borderWidth: 1,
      },
    ],
  };

  const config = {
    type: "bar",
    data: data,
    options: {
      maintainAspectRatio: false,
      animation: {
        duration: 0,
      },
      plugins: {
        legend: {
          display: false,
        },
      },
    },
  };

  let chart = new Chart(document.querySelector("#inventory-chart"), config);
}

const orderCounter = [
  {
    name: "El Hefe",
    amount: 0,
  },
  {
    name: "Fairy Tale Ale",
    amount: 0,
  },
  {
    name: "GitHop",
    amount: 0,
  },
  {
    name: "Hollaback Lager",
    amount: 0,
  },
  {
    name: "Hoppily Ever After",
    amount: 0,
  },
  {
    name: "Mowintime",
    amount: 0,
  },
  {
    name: "Sleighride",
    amount: 0,
  },
];

let latestOrder = 0;

function showSales(queue) {
  const container = document.querySelector(".sales-articles");
  container.innerHTML = " ";

  //Iterate through each order
  queue.forEach((currentOrder) => {
    //Execute only if order is newer than the latest id
    if (latestOrder < currentOrder.id) {
      //Update id to most recent order
      latestOrder = currentOrder.id;

      //Iterate through array of sales
      currentOrder.order.forEach((orderedBeer) => {
        const beer = replaceBeer(orderedBeer);

        //Update sold amount of each beer
        orderCounter.forEach((beerCounter) => {
          if (beer === beerCounter.name) {
            beerCounter.amount++;
          }
        });
      });
    }
  });

  // orderCounter.forEach(beer=>{
  //   const kegClone = document.querySelector("#template-sales").cloneNode(true).content;

  //   kegClone.querySelector(".sales-name").textContent = beer.name;
  //   kegClone.querySelector(".sales-amount").textContent = beer.amount;

  //   container.appendChild(kegClone);
  // })

  //Empty canvas container
  document.querySelector("#sales-chart-container").innerHTML = " ";

  //Create new canvas element
  const salesChart = document.createElement("canvas");
  salesChart.id = "sales-chart";
  salesChart.width = "auto";
  salesChart.height = "auto";
  document.querySelector("#sales-chart-container").appendChild(salesChart);

  const labels = ["El Hefe", "Fairy Tale Ale", "GitHop", "Hollaback Lager", "Hoppily Ever After", "Mowintime", "Sleighride"];
  const data = {
    labels: labels,
    datasets: [
      {
        label: "Todays sale",
        data: [
          orderCounter[0].amount,
          orderCounter[1].amount,
          orderCounter[2].amount,
          orderCounter[3].amount,
          orderCounter[4].amount,
          orderCounter[5].amount,
          orderCounter[6].amount,
        ],
        backgroundColor: ["#70AF70"],
        borderColor: ["#70AF70"],
        borderWidth: 1,
      },
    ],
  };

  const config = {
    type: "bar",
    data: data,
    options: {
      maintainAspectRatio: false,
      animation: {
        duration: 0,
      },
      scales: {
        y: {
          beginAtZero: true,
        },
      },
      plugins: {
        legend: {
          display: false,
        },
      },
    },
  };

  let chart = new Chart(document.querySelector("#sales-chart"), config);
}

function replaceBeer(beer) {
  beer === "Ruined Childhood" ? (beer = "GitHop") : beer;
  beer === "Steampunk" ? (beer = "El Hefe") : beer;
  beer === "Row 26" ? (beer = "Sleighride") : beer;

  return beer;
}
