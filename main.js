"use strict";
import "./styles/style.scss";

window.addEventListener("DOMContentLoaded", () => {
  getData();
});

//Const of included beers
const beersToInclude = ["El Hefe", "Fairy Tale Ale", "GitHop", "Hollaback Lager", "Hoppily Ever After", "Mowintime", "Sleighride"];

function getData() {
  const dataURL = "https://group-7-foo-bar.herokuapp.com/";
  fetch(dataURL)
    //fetches data from json
    .then((res) => res.json())
    //then this ...
    .then((data) => {
      showBartenders(data.bartenders);
      showQueue(data.queue);
      showServing(data.serving);
      getKegs(data.taps);

      //Recall functin after 2s
      setTimeout(getData, 10000);
    });
}

function showBartenders(bartenders) {
  bartenders.forEach((bartender) => {
    const bartenderServing = document.querySelector(`article[data-bartender="${bartender.name}"] .bartender-serving`);
    const bartenderStatus = document.querySelector(`article[data-bartender="${bartender.name}"] .bartender-status`);

    if (bartender.servingCustomer === null) {
      bartenderServing.textContent = "Not serving";
    } else {
      bartenderServing.textContent = `Serving: ${bartender.servingCustomer}`;
    }

    bartenderStatus.textContent = `Status: ${bartender.status}`;
  });
}

function getKegs(taps) {
  const beersUrl = "https://group-7-foo-bar.herokuapp.com/beertypes";
  fetch(beersUrl)
    //fetches data from json
    .then((res) => res.json())
    //then this ...
    .then((kegs) => {
      //Filter through beers
      const filteredBeers = kegs.filter((beer) => {
        //Go through beers to include for each beer
        return beersToInclude.some((inclBeer) => {
          //Return true only for beers in beersToInclude
          return inclBeer === beer.name ? true : false;
        });
      });
      //go to showKegs and with data from filteredBeers (only 7 beers not 10)
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
    //clone template
    const kegClone = document.querySelector("#template-keg").cloneNode(true).content;
    //each template get image, name and remaining
    kegClone.querySelector("img").src = `./images/kegs/${beer.label}`;
    kegClone.querySelector("h4").textContent = beer.name;
    kegClone.querySelector("h5").textContent = `${beer.level} cl`;
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
    orderClone.querySelector(".order-id").textContent = order.id;
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
    const hours = time.getHours();
    const minutes = time.getMinutes().toString().padStart(2, "0");

    //Insert order id and time stamp
    orderClone.querySelector(".order-id").textContent = order.id;
    orderClone.querySelector(".order-time").textContent = `${hours}:${minutes}`;

    container.appendChild(orderClone);
  });
}

function replaceBeer(beer) {
  beer === "Ruined Childhood" ? (beer = "GitHop") : beer;
  beer === "Steampunk" ? (beer = "El Hefe") : beer;
  beer === "Row 26" ? (beer = "Sleighride") : beer;

  return beer;
}
