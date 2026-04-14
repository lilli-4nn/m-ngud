const gameState = {
    money: 50,
    day: 1,
    reputation: 50,
    customersServed: 0,
    dailyGoal: 5,
    pizzasServedToday: 0,
    currentPizza: {
        crust: 'classic',
        sauce: 'tomato',
        toppings: []
    },
    baked: false,
    inventory: {
        cheese: true,
        tomato: true,
        pepperoni: true,
        mushrooms: false,
        basil: false,
        olives: false,
        pesto: false,
        chicken: false
    },
    ovenLevel: 1,
    orders: [],
    gameOver: false
};

const ingredientData = {
    crusts: [
        { id: 'classic', name: 'Classic', price: 0 },
        { id: 'thin', name: 'Thin crust', price: 0 },
        { id: 'deep', name: 'Deep dish', price: 5 }
    ],
    sauces: [
        { id: 'tomato', name: 'Tomato', price: 0 },
        { id: 'pesto', name: 'Pesto', price: 8 }
    ],
    toppings: {
        cheese: { name: 'Cheese', price: 2 },
        pepperoni: { name: 'Pepperoni', price: 3 },
        mushrooms: { name: 'Mushrooms', price: 3 },
        basil: { name: 'Basil', price: 2 },
        olives: { name: 'Olives', price: 2 },
        chicken: { name: 'Chicken', price: 5 }
    }
};

const shopItems = [
    { id: 'mushrooms', name: 'Mushrooms', cost: 20, unlock: 'mushrooms', description: 'Add earthy flavor to your pizzas.' },
    { id: 'basil', name: 'Basil', cost: 18, unlock: 'basil', description: 'Fresh herbs for premium orders.' },
    { id: 'olives', name: 'Olives', cost: 18, unlock: 'olives', description: 'A tasty topping for picky customers.' },
    { id: 'pesto', name: 'Pesto Sauce', cost: 25, unlock: 'pesto', description: 'Unlock pesto as a sauce option.' },
    { id: 'chicken', name: 'Chicken', cost: 30, unlock: 'chicken', description: 'Premium protein topping for high-paying orders.' }
];

const upgrades = [
    { id: 'oven', name: 'Oven Upgrade', cost: 50, description: 'Bake faster and earn bigger tips.', effect: () => { gameState.ovenLevel++; } }
];

const customerPreferences = [
    { text: 'classic tomato with pepperoni', match: { crust: 'classic', sauce: 'tomato', toppings: ['pepperoni'] }, price: 18 },
    { text: 'deep dish pesto with chicken', match: { crust: 'deep', sauce: 'pesto', toppings: ['chicken'] }, price: 28 },
    { text: 'thin crust with mushrooms and basil', match: { crust: 'thin', sauce: 'tomato', toppings: ['mushrooms', 'basil'] }, price: 22 },
    { text: 'extra cheese', match: { toppings: ['cheese'] }, price: 16 },
    { text: 'a veggie pizza with olives', match: { toppings: ['olives', 'mushrooms'] }, price: 20 },
    { text: 'a classic with tomato and cheese', match: { sauce: 'tomato', toppings: ['cheese'] }, price: 15 }
];

const elements = {
    money: document.getElementById('money'),
    day: document.getElementById('day'),
    reputation: document.getElementById('reputation'),
    customersServed: document.getElementById('customersServed'),
    dailyGoal: document.getElementById('dailyGoal'),
    pizzaToppings: document.getElementById('pizza-toppings'),
    pizzaDisplay: document.getElementById('pizza-display'),
    crustSelect: document.getElementById('crust-select'),
    sauceSelect: document.getElementById('sauce-select'),
    toppingButtons: document.getElementById('topping-buttons'),
    bakeButton: document.getElementById('bake-pizza'),
    serveButton: document.getElementById('serve-pizza'),
    clearButton: document.getElementById('clear-pizza'),
    statusMessage: document.getElementById('status-message'),
    ordersList: document.getElementById('orders-list'),
    shopList: document.getElementById('shop-list'),
    gameLog: document.getElementById('game-log')
};

const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function playTone(frequency, duration = 0.1, type = 'sine', volume = 0.15) {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    gain.gain.value = volume;
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
}

function playSound(name) {
    if (gameState.gameOver) return;
    switch (name) {
        case 'bake':
            playTone(440, 0.12, 'triangle', 0.18);
            break;
        case 'serve':
            playTone(520, 0.08, 'triangle', 0.18);
            setTimeout(() => playTone(660, 0.08, 'triangle', 0.15), 80);
            break;
        case 'fail':
            playTone(220, 0.18, 'sawtooth', 0.18);
            break;
        case 'purchase':
            playTone(740, 0.08, 'square', 0.16);
            break;
        case 'upgrade':
            playTone(640, 0.12, 'triangle', 0.18);
            setTimeout(() => playTone(760, 0.1, 'triangle', 0.14), 100);
            break;
        case 'dayEnd':
            playTone(460, 0.12, 'triangle', 0.18);
            setTimeout(() => playTone(560, 0.12, 'triangle', 0.16), 120);
            break;
    }
}

function displayStatus(message) {
    elements.statusMessage.textContent = message;
}

function endGame(message) {
    gameState.gameOver = true;
    displayStatus(message);
    addLog(message);
    elements.bakeButton.disabled = true;
    elements.serveButton.disabled = true;
    elements.clearButton.disabled = true;
    elements.shopList.querySelectorAll('button').forEach(button => button.disabled = true);
}

function formatPizza() {
    const crust = ingredientData.crusts.find(c => c.id === gameState.currentPizza.crust).name;
    const sauce = ingredientData.sauces.find(s => s.id === gameState.currentPizza.sauce).name;
    const toppings = gameState.currentPizza.toppings.length
        ? gameState.currentPizza.toppings.map(id => ingredientData.toppings[id].name).join(', ')
        : 'no toppings';

    return `${crust} crust, ${sauce} sauce, ${toppings}`;
}

function renderStats() {
    elements.money.textContent = gameState.money;
    elements.day.textContent = gameState.day;
    elements.reputation.textContent = gameState.reputation;
    elements.customersServed.textContent = gameState.customersServed;
    elements.dailyGoal.textContent = gameState.dailyGoal;
}

function renderPizzaControls() {
    elements.crustSelect.innerHTML = ingredientData.crusts.map(crust => `
        <option value="${crust.id}">${crust.name}${crust.price ? ` (+€${crust.price})` : ''}</option>
    `).join('');

    elements.sauceSelect.innerHTML = ingredientData.sauces
        .filter(sauce => gameState.inventory[sauce.id] || sauce.id === 'tomato')
        .map(sauce => `
            <option value="${sauce.id}">${sauce.name}${sauce.price ? ` (+€${sauce.price})` : ''}</option>
        `).join('');

    elements.crustSelect.value = gameState.currentPizza.crust;
    elements.sauceSelect.value = gameState.currentPizza.sauce;

    elements.toppingButtons.innerHTML = Object.entries(ingredientData.toppings)
        .filter(([id]) => gameState.inventory[id])
        .map(([id, topping]) => `
            <button type="button" data-topping="${id}">
                ${topping.name} (€${topping.price})
            </button>
        `).join('');

    const toppingButtons = elements.toppingButtons.querySelectorAll('button');
    toppingButtons.forEach(button => {
        button.addEventListener('click', () => toggleTopping(button.dataset.topping));
    });

    updatePizzaDisplay();
}

function renderOrders() {
    if (gameState.orders.length === 0) {
        elements.ordersList.innerHTML = '<p>No customers yet. Add toppings and bake a pizza to attract them!</p>';
        return;
    }

    elements.ordersList.innerHTML = gameState.orders.map(order => `
        <div class="order-card">
            <h3>${order.name}</h3>
            <p>${order.description}</p>
            <p><strong>Price:</strong> €${order.price}</p>
        </div>
    `).join('');
}

function renderShop() {
    elements.shopList.innerHTML = `
        ${shopItems.map(item => `
            <div class="shop-card">
                <h3>${item.name}</h3>
                <p>${item.description}</p>
                <p><strong>Cost:</strong> €${item.cost}</p>
                <button type="button" data-buy="${item.id}" ${gameState.inventory[item.unlock] ? 'disabled' : ''}>
                    ${gameState.inventory[item.unlock] ? 'Purchased' : 'Buy'}
                </button>
            </div>
        `).join('')}
        ${upgrades.map(upgrade => `
            <div class="shop-card">
                <h3>${upgrade.name}</h3>
                <p>${upgrade.description}</p>
                <p><strong>Cost:</strong> €${upgrade.cost}</p>
                <button type="button" data-upgrade="${upgrade.id}">${gameState.money >= upgrade.cost ? 'Upgrade' : 'Too expensive'}</button>
            </div>
        `).join('')}
    `;

    elements.shopList.querySelectorAll('button[data-buy]').forEach(button => {
        button.addEventListener('click', () => buyShopItem(button.dataset.buy));
    });

    elements.shopList.querySelectorAll('button[data-upgrade]').forEach(button => {
        button.addEventListener('click', () => buyUpgrade(button.dataset.upgrade));
    });
}

function updatePizzaDisplay() {
    const toppings = gameState.currentPizza.toppings.length
        ? gameState.currentPizza.toppings.map(id => ingredientData.toppings[id].name).join(', ')
        : 'no toppings';

    elements.pizzaToppings.textContent = toppings;
    elements.pizzaDisplay.textContent = `🍕 ${formatPizza()}`;
    elements.serveButton.disabled = !gameState.baked || gameState.orders.length === 0;
    elements.bakeButton.disabled = gameState.baked;
}

function toggleTopping(toppingId) {
    if (gameState.gameOver) return;
    const selectedToppings = gameState.currentPizza.toppings;
    if (selectedToppings.includes(toppingId)) {
        gameState.currentPizza.toppings = selectedToppings.filter(id => id !== toppingId);
        addLog(`Removed ${ingredientData.toppings[toppingId].name} from the pizza.`);
    } else {
        gameState.currentPizza.toppings.push(toppingId);
        addLog(`Added ${ingredientData.toppings[toppingId].name}.`);
    }
    gameState.baked = false;
    updatePizzaDisplay();
}

function bakePizza() {
    if (gameState.gameOver) return;
    const baseCost = 5;
    if (gameState.baked) {
        addLog('The pizza is already baked. Serve it or clear it first.');
        return;
    }

    if (gameState.money < baseCost) {
        addLog('Not enough money to bake the pizza.');
        return;
    }

    gameState.money -= baseCost;
    gameState.baked = true;
    playSound('bake');
    addLog(`You baked the pizza for €${baseCost}. It is ready to serve.`);
    updateGameState();
}

function clearPizza() {
    gameState.currentPizza = { crust: 'classic', sauce: 'tomato', toppings: [] };
    gameState.baked = false;
    addLog('The pizza has been cleared and you can build a new one.');
    updatePizzaDisplay();
}

function servePizza() {
    if (!gameState.baked) {
        addLog('Bake your pizza first before serving.');
        return;
    }
    if (gameState.orders.length === 0) {
        addLog('No orders are waiting. Spawn more customers by making pizzas.');
        return;
    }

    const order = gameState.orders.shift();
    const score = evaluatePizza(order);
    const perfectScore = order.requiredMatch;

    if (score >= perfectScore) {
        const reward = order.price + gameState.ovenLevel * 2;
        gameState.money += reward;
        gameState.customersServed++;
        gameState.pizzasServedToday++;
        gameState.reputation = Math.min(100, gameState.reputation + 3);
        playSound('serve');
        addLog(`Served ${order.name} perfectly! Earned €${reward}. Reputation improved.`);
    } else {
        gameState.reputation = Math.max(0, gameState.reputation - 7);
        playSound('fail');
        addLog(`The pizza did not match ${order.name}'s order. Reputation dropped.`);
    }

    gameState.currentPizza = { crust: 'classic', sauce: 'tomato', toppings: [] };
    gameState.baked = false;
    spawnOrder();
    checkDayEnd();
    updateGameState();
}

function evaluatePizza(order) {
    const pizza = gameState.currentPizza;
    let score = 0;
    if (pizza.crust === order.crust) score += 1;
    if (pizza.sauce === order.sauce) score += 1;
    order.matchToppings.forEach(required => {
        if (pizza.toppings.includes(required)) score += 1;
    });
    return score;
}

function buyShopItem(itemId) {
    if (gameState.gameOver) return;
    const item = shopItems.find(i => i.id === itemId);
    if (!item || gameState.inventory[item.unlock]) return;
    if (gameState.money < item.cost) {
        addLog('Not enough money to purchase that ingredient.');
        return;
    }
    gameState.money -= item.cost;
    gameState.inventory[item.unlock] = true;
    playSound('purchase');
    addLog(`Purchased ${item.name}. It is now available in your kitchen.`);
    renderPizzaControls();
    renderShop();
    renderStats();
}

function buyUpgrade(upgradeId) {
    if (gameState.gameOver) return;
    const upgrade = upgrades.find(u => u.id === upgradeId);
    if (!upgrade) return;
    if (gameState.money < upgrade.cost) {
        addLog('Not enough money to buy the upgrade.');
        return;
    }
    gameState.money -= upgrade.cost;
    upgrade.effect();
    playSound('upgrade');
    addLog(`${upgrade.name} installed! Oven level is now ${gameState.ovenLevel}.`);
    renderShop();
    renderStats();
}

function spawnOrder() {
    const possible = customerPreferences.filter(pref =>
        (pref.match.sauce !== 'pesto' || gameState.inventory.pesto) &&
        pref.match.toppings.every(t => gameState.inventory[t] || ['cheese', 'pepperoni', 'tomato'].includes(t))
    );
    if (possible.length === 0) return;
    const template = possible[Math.floor(Math.random() * possible.length)];
    const order = {
        id: Date.now() + Math.random(),
        name: ['A loyal customer', 'A foodie', 'A regular', 'A hungry guest'][Math.floor(Math.random() * 4)],
        description: `Wants ${template.text}.`,
        price: template.price,
        crust: template.match.crust || 'classic',
        sauce: template.match.sauce || 'tomato',
        matchToppings: template.match.toppings || [],
        requiredMatch: ((template.match.toppings || []).length + 2)
    };
    gameState.orders.push(order);
    if (gameState.orders.length > 4) {
        gameState.orders.shift();
    }
}

function checkDayEnd() {
    if (gameState.pizzasServedToday >= gameState.dailyGoal) {
        const finishedDay = gameState.day;
        gameState.day++;
        gameState.pizzasServedToday = 0;
        gameState.dailyGoal += 2;
        gameState.reputation = Math.min(100, gameState.reputation + 5);
        playSound('dayEnd');
        if (gameState.day > 7) {
            endGame(`Day ${finishedDay} complete! You built a legendary pizzeria — congratulations!`);
            return;
        }
        addLog(`Day ${finishedDay} complete! A new day begins with a bigger goal.`);
        for (let i = 0; i < 2; i++) spawnOrder();
    }
}

function addLog(message) {
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.innerHTML = `<p>${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} — ${message}</p>`;
    elements.gameLog.prepend(entry);
    displayStatus(message);
}

function updateGameState() {
    renderStats();
    renderPizzaControls();
    renderOrders();
    renderShop();
    updatePizzaDisplay();
    if (gameState.gameOver) {
        elements.bakeButton.disabled = true;
        elements.serveButton.disabled = true;
        elements.clearButton.disabled = true;
        elements.shopList.querySelectorAll('button').forEach(button => button.disabled = true);
    }
}

function setupEventListeners() {
    elements.crustSelect.addEventListener('change', event => {
        gameState.currentPizza.crust = event.target.value;
        gameState.baked = false;
        updatePizzaDisplay();
    });

    elements.sauceSelect.addEventListener('change', event => {
        gameState.currentPizza.sauce = event.target.value;
        gameState.baked = false;
        updatePizzaDisplay();
    });

    elements.bakeButton.addEventListener('click', bakePizza);
    elements.serveButton.addEventListener('click', servePizza);
    elements.clearButton.addEventListener('click', clearPizza);
}

function startGame() {
    setupEventListeners();
    gameState.orders = [];
    for (let i = 0; i < 3; i++) spawnOrder();
    addLog('Welcome to Pizza Tycoon — your first customers have arrived.');
    updateGameState();
}

startGame();
