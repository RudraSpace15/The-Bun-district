// THE BUN DISTRICT - menu, cart, checkout and reservation demo

const menuItems = [
  { id: 1, name: "District Classic", category: "Burger", price: 179, image: "assets/order-1.png", description: "A juicy classic with fresh lettuce, cheese and our house sauce." },
  { id: 2, name: "Smoky BBQ Burger", category: "Burger", price: 219, image: "assets/order-2.png", description: "Smoky barbecue flavour, crisp vegetables and a toasted bun." },
  { id: 3, name: "Cheese Burst Burger", category: "Burger", price: 239, image: "assets/order-3.png", description: "A rich, cheesy burger made for serious cheese lovers." },
  { id: 4, name: "Golden Fries", category: "Side", price: 89, image: "assets/banner-1.png", description: "Crispy golden fries with a light seasoning." },
  { id: 5, name: "Loaded Side Bites", category: "Side", price: 129, image: "assets/banner-2.png", description: "A delicious snack to share with your favourite people." },
  { id: 6, name: "Crunchy Snack Box", category: "Side", price: 149, image: "assets/banner-3.png", description: "A crunchy side made for the middle of the table." },
  { id: 7, name: "Chilled Cola", category: "Drink", price: 59, image: "assets/event.png", description: "A refreshing chilled drink to go with your meal." },
  { id: 8, name: "Classic Lemonade", category: "Drink", price: 69, image: "assets/event.png", description: "A cool, citrusy refreshment." },
  { id: 9, name: "Iced Mocha", category: "Drink", price: 99, image: "assets/event.png", description: "A smooth chilled coffee treat." }
];

const $ = (selector) => document.querySelector(selector);
const menuGrid = $("#menu-grid");
const cartElement = $("#cart");
const cartOverlay = $("#cart-overlay");
let activeCategory = "All";
let cart = JSON.parse(localStorage.getItem("bunDistrictCart") || "[]");
let toastTimer;

// Show a small status message
function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}

// Render menu cards from the menuItems array
function renderMenu() {
  const searchText = $("#menu-search").value.trim().toLowerCase();
  const filtered = menuItems.filter(item => {
    const matchesCategory = activeCategory === "All" || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchText) ||
      item.description.toLowerCase().includes(searchText);
    return matchesCategory && matchesSearch;
  });

  menuGrid.innerHTML = "";
  if (!filtered.length) {
    menuGrid.innerHTML = '<p class="empty-menu">No dishes found. Try another search.</p>';
    return;
  }

  filtered.forEach(item => {
    const card = document.createElement("article");
    card.className = "food-card";
    card.innerHTML = `
      <img src="${item.image}" alt="${item.name}" loading="lazy">
      <div class="food-info">
        <h3>${item.name}</h3>
        <p>${item.description}</p>
        <div class="food-bottom">
          <span class="food-price">₹${item.price}</span>
          <button class="add-button" data-add="${item.id}">ADD TO CART +</button>
        </div>
      </div>`;
    menuGrid.appendChild(card);
  });
}

// Save cart in this browser
function saveCart() {
  localStorage.setItem("bunDistrictCart", JSON.stringify(cart));
  renderCart();
}

// Add an item or increase its quantity
function addToCart(id) {
  const item = menuItems.find(product => product.id === id);
  const existing = cart.find(product => product.id === id);
  if (existing) existing.quantity += 1;
  else cart.push({ ...item, quantity: 1 });
  saveCart();
  showToast(`${item.name} added to your cart.`);
}

// Change quantity by +1 or -1
function changeQuantity(id, amount) {
  const item = cart.find(product => product.id === id);
  if (!item) return;
  item.quantity += amount;
  cart = cart.filter(product => product.quantity > 0);
  saveCart();
}

// Draw cart items and calculate total
function renderCart() {
  const itemsContainer = $("#cart-items");
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  $("#cart-count").textContent = count;
  $("#cart-total").textContent = `₹${total}`;
  itemsContainer.innerHTML = "";

  if (!cart.length) {
    itemsContainer.innerHTML = '<p class="cart-empty">Your cart is empty. Add something delicious!</p>';
    return;
  }

  cart.forEach(item => {
    const row = document.createElement("div");
    row.className = "cart-row";
    row.innerHTML = `
      <div>
        <h4>${item.name}</h4>
        <small>₹${item.price} each · ₹${item.price * item.quantity}</small>
      </div>
      <div class="quantity">
        <button data-quantity="${item.id}" data-change="-1" aria-label="Decrease ${item.name}">−</button>
        <span>${item.quantity}</span>
        <button data-quantity="${item.id}" data-change="1" aria-label="Increase ${item.name}">+</button>
      </div>`;
    itemsContainer.appendChild(row);
  });
}

function openCart() {
  cartElement.classList.add("active");
  cartOverlay.classList.add("active");
  cartElement.setAttribute("aria-hidden", "false");
  document.body.classList.add("no-scroll");
}

function closeCart() {
  cartElement.classList.remove("active");
  cartOverlay.classList.remove("active");
  cartElement.setAttribute("aria-hidden", "true");
  document.body.classList.remove("no-scroll");
}

function openCheckout() {
  if (!cart.length) {
    showToast("Your cart is empty. Add an item first.");
    return;
  }
  closeCart();
  $("#checkout-modal").classList.add("active");
  $("#checkout-modal").setAttribute("aria-hidden", "false");
}

function closeCheckout() {
  $("#checkout-modal").classList.remove("active");
  $("#checkout-modal").setAttribute("aria-hidden", "true");
}

// Menu filters and search
$("#menu-search").addEventListener("input", renderMenu);
document.querySelectorAll(".filter-button").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelector(".filter-button.active")?.classList.remove("active");
    button.classList.add("active");
    activeCategory = button.dataset.category;
    renderMenu();
  });
});

// Event delegation for menu buttons
menuGrid.addEventListener("click", event => {
  const button = event.target.closest("[data-add]");
  if (button) addToCart(Number(button.dataset.add));
});

// Event delegation for cart quantity buttons
$("#cart-items").addEventListener("click", event => {
  const button = event.target.closest("[data-quantity]");
  if (button) changeQuantity(Number(button.dataset.quantity), Number(button.dataset.change));
});

// Cart open/close controls
$("#cart-open").addEventListener("click", openCart);
$("#cart-close").addEventListener("click", closeCart);
cartOverlay.addEventListener("click", closeCart);
$("#checkout-btn").addEventListener("click", openCheckout);
$("#checkout-close").addEventListener("click", closeCheckout);

// Close modal if user clicks its dark background
$("#checkout-modal").addEventListener("click", event => {
  if (event.target.id === "checkout-modal") closeCheckout();
});

// Demo checkout: store order locally, no real payment or delivery
$("#checkout-form").addEventListener("submit", event => {
  event.preventDefault();
  if (!cart.length) return;

  const order = {
    customer: $("#order-name").value.trim(),
    phone: $("#order-phone").value.trim(),
    address: $("#order-address").value.trim(),
    items: cart,
    total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    createdAt: new Date().toISOString()
  };

  const orders = JSON.parse(localStorage.getItem("bunDistrictOrders") || "[]");
  orders.push(order);
  localStorage.setItem("bunDistrictOrders", JSON.stringify(orders));

  cart = [];
  saveCart();
  $("#checkout-form").reset();
  closeCheckout();
  showToast("Demo order placed successfully!");
});

// Reservation form: store request in localStorage
$("#reservation-form").addEventListener("submit", event => {
  event.preventDefault();

  const reservation = {
    name: $("#customer-name").value.trim(),
    email: $("#customer-email").value.trim(),
    phone: $("#customer-phone").value.trim(),
    date: $("#reservation-date").value,
    time: $("#reservation-time").value,
    guests: $("#reservation-guests").value,
    message: $("#reservation-message").value.trim(),
    createdAt: new Date().toISOString()
  };

  const reservations = JSON.parse(localStorage.getItem("bunDistrictReservations") || "[]");
  reservations.push(reservation);
  localStorage.setItem("bunDistrictReservations", JSON.stringify(reservations));

  event.target.reset();
  showToast("Reservation request saved in this demo!");
});

// Mobile navigation
const navToggle = $("#menu-toggle");
const navLinks = $("#nav-links");
navToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
  navToggle.innerHTML = isOpen ? '<i class="ri-close-line"></i>' : '<i class="ri-menu-line"></i>';
});
navLinks.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.innerHTML = '<i class="ri-menu-line"></i>';
  });
});

// Escape key closes open panels
document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    closeCart();
    closeCheckout();
    navLinks.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.innerHTML = '<i class="ri-menu-line"></i>';
  }
});

// Set current year and prevent past reservation dates
$("#current-year").textContent = new Date().getFullYear();
$("#reservation-date").min = new Date().toISOString().split("T")[0];

// Initial page setup
renderMenu();
renderCart();
