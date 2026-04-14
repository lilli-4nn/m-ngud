let money = 50;
let level = 1;
let customersServed = 0;
let currentPizza = [];
let pizzaBaked = false;
let isBaking = false;
let availableToppings = ['cheese', 'tomato', 'pepperoni'];
let boughtToppings = [];
let customers = [];
let upgradeCost = 50;

const customerTypes = [
    { name: 'Man', img: 'https://via.placeholder.com/100x100/4a90e2/ffffff?text=👨' },
    { name: 'Woman', img: 'https://via.placeholder.com/100x100/e94b3c/ffffff?text=👩' },
    { name: 'Child', img: 'https://via.placeholder.com/100x100/f5a623/ffffff?text=👶' },
    { name: 'Elder', img: 'https://via.placeholder.com/100x100/7ed321/ffffff?text=👴' }
];

const shopToppings = ['pesto', 'basil', 'chicken', 'fish'];

function updateDisplay() {
    document.getElementById('money').textContent = money;
    document.getElementById('level').textContent = level;
    document.getElementById('customersServed').textContent = customersServed;
    const pizzaDisplay = currentPizza.length > 0 ? '🍕 ' + currentPizza.map(t => toppingEmojis[t]).join(' ') : '🍕 (empty)';
    document.getElementById('pizza-toppings').innerHTML = pizzaDisplay;
    document.getElementById('sell-pizza').disabled = !pizzaBaked || customers.length === 0;
    document.getElementById('bake-pizza').disabled = currentPizza.length === 0 || pizzaBaked;
    updateToppingsButtons();
    updateShopButtons();
    updateCustomers();
}

function updateToppingsButtons() {
    const toppingsDiv = document.getElementById('toppings');
    toppingsDiv.innerHTML = '<h3>Available Toppings</h3>';
    availableToppings.forEach(topping => {
        const button = document.createElement('button');
        button.textContent = `Add ${topping.charAt(0).toUpperCase() + topping.slice(1)} (€${toppingsPrices[topping]})`;
        button.addEventListener('click', () => addTopping(topping));
        toppingsDiv.appendChild(button);
    });
}

function updateShopButtons() {
    shopToppings.forEach(topping => {
        const button = document.getElementById(`buy-${topping}`);
        if (button) {
            button.disabled = boughtToppings.includes(topping) || money < toppingsPrices[topping];
        }
    });
    document.getElementById('upgrade-restaurant').disabled = money < upgradeCost;
}

function addTopping(topping) {
    if (money >= toppingsPrices[topping]) {
        money -= toppingsPrices[topping];
        currentPizza.push(topping);
        pizzaBaked = false;
        updateDisplay();
    }
}

function bakePizza() {
    if (currentPizza.length > 0 && !pizzaBaked && money >= 5) {
        money -= 5;
        pizzaBaked = true;
        updateDisplay();
    }
}

function sellPizza() {
    if (pizzaBaked && customers.length > 0) {
        const customer = customers.shift();
        money += Math.floor(Math.random() * 6) + 15; // 15 to 20 euros
        customersServed++;
        currentPizza = [];
        pizzaBaked = false;
        updateDisplay();
        setTimeout(spawnCustomer, 2000);
    }
}

function buyTopping(topping) {
    if (money >= toppingsPrices[topping] && !boughtToppings.includes(topping)) {
        money -= toppingsPrices[topping];
        boughtToppings.push(topping);
        availableToppings.push(topping);
        updateDisplay();
    }
}

function upgradeRestaurant() {
    if (money >= upgradeCost) {
        money -= upgradeCost;
        level++;
        upgradeCost *= 2; // Increase cost
        updateDisplay();
    }
}

function spawnCustomer() {
    const type = customerTypes[Math.floor(Math.random() * customerTypes.length)];
    const customer = {
        id: Date.now(),
        type: type,
        preference: availableToppings[Math.floor(Math.random() * availableToppings.length)]
    };
    customers.push(customer);
    updateDisplay();
}

function updateCustomers() {
    const customerList = document.getElementById('customer-list');
    customerList.innerHTML = '';
    customers.forEach(customer => {
        const div = document.createElement('div');
        div.className = 'customer';
        div.innerHTML = `
            <img src="${customer.type.img}" alt="${customer.type.name}">
            <p>${customer.type.name} wants: ${customer.preference}</p>
        `;
        customerList.appendChild(div);
    });
}

// Event listeners
document.getElementById('bake-pizza').addEventListener('click', bakePizza);
document.getElementById('sell-pizza').addEventListener('click', sellPizza);
document.getElementById('buy-pesto').addEventListener('click', () => buyTopping('pesto'));
document.getElementById('buy-basil').addEventListener('click', () => buyTopping('basil'));
document.getElementById('buy-chicken').addEventListener('click', () => buyTopping('chicken'));
document.getElementById('buy-fish').addEventListener('click', () => buyTopping('fish'));
document.getElementById('upgrade-restaurant').addEventListener('click', upgradeRestaurant);

// Initialize
updateDisplay();
spawnCustomer();
spawnCustomer();
spawnCustomer();