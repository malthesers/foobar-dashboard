"use strict";
import "./styles/style.scss";

window.addEventListener("DOMContentLoaded",()=>{

    getData();
});

function getData (){
    const dataURL = "https://group-7-foo-bar.herokuapp.com/";
    fetch(dataURL)
    //fetches data from json
    .then(res => res.json())
    //then this ...
    .then(data => {
        console.log(data);

        showBartenders(data.bartenders);
        getKegs(data.taps);

        //Recall functin after 2s
        setTimeout(getData, 2000);
    })
}

function showBartenders(bartenders){
    bartenders.forEach(bartender => {
        const p = document.querySelector(`article[data-bartender="${bartender.name}"] p`);
        
        p.textContent = `Serving: ${bartender.servingCustomer}`;
    })
}

function getKegs(taps){
    const beersUrl = "https://group-7-foo-bar.herokuapp.com/beertypes";
    fetch(beersUrl)
    //fetches data from json
    .then(res => res.json())
    //then this ...
    .then(kegs => {
        //Const of included beers
        const beersToInclude = ["El Hefe", "Fairy Tale Ale", "GitHop", "Hollaback Lager", "Hoppily Ever After", "Mowintime", "Sleighride"];

        //Filter through beers
        const filteredBeers = kegs.filter((beer) => {
            //Go through beers to include for each beer
            return beersToInclude.some((inclBeer) => {
                //Return true only for beers in beersToInclude
                return inclBeer === beer.name ? true : false;
        });
    });
    //go to showKegs and with data from filteredBeers (only 7 beers not 10)
    showKegs(filteredBeers, taps);
    })
}

function showKegs(beers, taps){
    console.log(beers, taps);

    let currentTap = 0;

    beers.forEach(beer => {
        beer.level = taps[currentTap].level;

        currentTap++;
    })

    const sortedBeers = beers.sort(function (a, b){
        return a.level - b.level
    })

    displayCapacity(sortedBeers);
}

function displayCapacity (beers) {
    console.log(beers);
    const container = document.querySelector(".storage-articles")
    container.innerHTML = " "
    //Laver et nyt array, som kun består af de 4 første øl
    beers.slice(0, 4).forEach(beer => {
        //clone template 
        const kegClone = document.querySelector("#template-keg").cloneNode(true).content;
        //each template get image, name and remaining
        kegClone.querySelector("img").src = `./images/kegs/${beer.label}`;
        kegClone.querySelector("h5").textContent = beer.name;
        kegClone.querySelector("p").textContent = `Remaining: ${beer.level} cl`;
        // insert/append content in container
        container.appendChild(kegClone);
    })
}
