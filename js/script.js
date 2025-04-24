const dropList = document.querySelectorAll("form select"),
fromCurrency = document.querySelector(".from select"),
toCurrency = document.querySelector(".to select"),
getButton = document.querySelector("form button"),
exchangeRateTxt = document.querySelector("form .exchange-rate"),
amountInput = document.querySelector("form input");

const apiKey = "80438b2e9a3fc576d203c095";

// Add animation to wrapper on load
document.addEventListener("DOMContentLoaded", () => {
    // Animate all form elements sequentially
    const formElements = document.querySelectorAll("form > div, form button");
    formElements.forEach((element, index) => {
        setTimeout(() => {
            element.style.opacity = "0";
            element.style.transform = "translateY(20px)";
            element.style.transition = "all 0.4s ease";
            
            setTimeout(() => {
                element.style.opacity = "1";
                element.style.transform = "translateY(0)";
            }, 50);
        }, index * 100);
    });
});

// Initialize currencies
for (let i = 0; i < dropList.length; i++) {
    for(let currency_code in country_list){
        // selecting USD by default as FROM currency and AFN as TO currency
        let selected = i == 0 ? currency_code == "USD" ? "selected" : "" : currency_code == "AFN" ? "selected" : "";
        // creating option tag with passing currency code as a text and value
        let optionTag = `<option value="${currency_code}" ${selected}>${currency_code}</option>`;
        // inserting options tag inside select tag
        dropList[i].insertAdjacentHTML("beforeend", optionTag);
    }
    dropList[i].addEventListener("change", e =>{
        loadFlag(e.target); // calling loadFlag with passing target element as an argument
    });
}

function loadFlag(element){
    for(let code in country_list){
        if(code == element.value){ // if currency code of country list is equal to option value
            let imgTag = element.parentElement.querySelector("img"); // selecting img tag of particular drop list
            // passing country code of a selected currency code in a img url
            imgTag.src = `https://flagcdn.com/48x36/${country_list[code].toLowerCase()}.png`;
            
            // Add a small animation to the flag
            imgTag.style.transform = "scale(1.2)";
            setTimeout(() => {
                imgTag.style.transform = "scale(1)";
            }, 300);
        }
    }
    // Trigger exchange rate update on currency change
    getExchangeRate();
}

window.addEventListener("load", ()=>{
    getExchangeRate();
});

// Add input validation for amount
amountInput.addEventListener("input", () => {
    // Only allow numbers and a single decimal point
    amountInput.value = amountInput.value.replace(/[^0-9.]/g, '');
    
    // Prevent multiple decimal points
    const decimalCount = amountInput.value.split('.').length - 1;
    if (decimalCount > 1) {
        amountInput.value = amountInput.value.replace(/\.+$/, '');
    }
    
    // Update exchange rate in real time as user types
    if (amountInput.value) {
        getExchangeRate();
    }
});

getButton.addEventListener("click", e =>{
    e.preventDefault(); // preventing form from submitting
    
    // Add button animation
    getButton.classList.add('button-clicked');
    setTimeout(() => {
        getButton.classList.remove('button-clicked');
    }, 300);
    
    getExchangeRate();
});

const exchangeIcon = document.querySelector("form .icon");
exchangeIcon.addEventListener("click", ()=>{
    // Add rotation animation
    exchangeIcon.style.transform = "rotate(180deg)";
    
    let tempCode = fromCurrency.value; // temporary currency code of FROM drop list
    fromCurrency.value = toCurrency.value; // passing TO currency code to FROM currency code
    toCurrency.value = tempCode; // passing temporary currency code to TO currency code
    
    // Add transition effect to the currency boxes
    const fromBox = document.querySelector(".from .select-box");
    const toBox = document.querySelector(".to .select-box");
    
    fromBox.style.transform = "translateX(20px)";
    toBox.style.transform = "translateX(-20px)";
    
    setTimeout(() => {
        fromBox.style.transform = "translateX(0)";
        toBox.style.transform = "translateX(0)";
        loadFlag(fromCurrency); // calling loadFlag with passing select element (fromCurrency) of FROM
        loadFlag(toCurrency); // calling loadFlag with passing select element (toCurrency) of TO
        getExchangeRate(); // calling getExchangeRate
        
        // Reset rotation after animation completes
        setTimeout(() => {
            exchangeIcon.style.transform = "rotate(0deg)";
        }, 500);
    }, 300);
});

function getExchangeRate(){
    const amount = document.querySelector("form input");
    let amountVal = amount.value;
    // if user don't enter any value or enter 0 then we'll put 1 value by default in the input field
    if(amountVal == "" || amountVal == "0"){
        amount.value = "1";
        amountVal = 1;
    }
    
    // Add loading animation
    exchangeRateTxt.classList.add('loading');
    exchangeRateTxt.innerText = "Converting...";
    
    let url = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${fromCurrency.value}`;
    // fetching api response and returning it with parsing into js obj and in another then method receiving that obj
    fetch(url).then(response => response.json()).then(result =>{
        let exchangeRate = result.conversion_rates[toCurrency.value]; // getting user selected TO currency rate
        let totalExRate = (amountVal * exchangeRate).toFixed(2); // multiplying user entered value with selected TO currency rate
        
        // Remove loading animation and display result with fade-in effect
        exchangeRateTxt.style.opacity = "0";
        
        setTimeout(() => {
            exchangeRateTxt.classList.remove('loading');
            exchangeRateTxt.innerText = `${amountVal} ${fromCurrency.value} = ${totalExRate} ${toCurrency.value}`;
            exchangeRateTxt.style.opacity = "1";
        }, 500);
        
    }).catch(() =>{ // if user is offline or any other error occured while fetching data then catch function will run
        exchangeRateTxt.innerText = "Something went wrong";
        exchangeRateTxt.classList.remove('loading');
    });
}