
const WHATSAPP_NUMBER = "254112775840";
const STORAGE_KEY = "giroudCart";

// Load saved cart data safely.
let cart = [];

try {
    const savedCart = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

    if (Array.isArray(savedCart)) {
        cart = savedCart.filter(item =>
            typeof item.name === "string" &&
            Number.isFinite(item.price) &&
            Number.isInteger(item.quantity) &&
            item.price >= 0 &&
            item.quantity > 0
        );
    }
} catch (error) {
    console.error("Could not load saved cart:", error);
}

function saveCart() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
        console.error("Could not save cart:", error);
        alert("Your browser could not save the cart.");
    }
}

function addToCart(name, price) {
    const existingItem = cart.find(item => item.name === name);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            name: name,
            price: price,
            quantity: 1
        });
    }

    saveCart();
    displayCart();
    alert(name + " added to your cart!");
}

function displayCart() {
    const cartItems = document.getElementById("cart-items");
    const cartCount = document.getElementById("cart-count");
    const cartTotal = document.getElementById("cart-total");

    // Prevent errors if a required HTML element is missing.
    if (!cartItems || !cartCount || !cartTotal) {
        console.error("Missing cart HTML element. Check index.html.");
        return;
    }

    const itemCount = cart.reduce(
        (sum, item) => sum + item.quantity, 0
    );

    const total = cart.reduce(
        (sum, item) => sum + item.price * item.quantity, 0
    );

    cartCount.textContent = itemCount;
    cartTotal.textContent = "KSh " + total.toLocaleString("en-KE");

    if (cart.length === 0) {
        cartItems.textContent =
            "Your cart is empty. Add a jersey to get started!";
        return;
    }

    cartItems.replaceChildren();

    cart.forEach((item, index) => {
        const card = document.createElement("div");
        card.className = "cart-item";

        const name = document.createElement("h3");
        name.textContent = item.name;

        const price = document.createElement("p");
        price.textContent = "Price: KSh " +
            item.price.toLocaleString("en-KE");

        const quantity = document.createElement("p");
        quantity.textContent = "Quantity: " + item.quantity;

        const subtotal = document.createElement("p");
        subtotal.textContent = "Subtotal: KSh " +
            (item.price * item.quantity).toLocaleString("en-KE");

        const decrease = document.createElement("button");
        decrease.className = "add-cart-btn";
        decrease.textContent = "−";
        decrease.setAttribute("aria-label", "Decrease quantity");
        decrease.addEventListener("click", () => changeQuantity(index, -1));

        const increase = document.createElement("button");
        increase.className = "add-cart-btn";
        increase.textContent = "+";
        increase.setAttribute("aria-label", "Increase quantity");
        increase.addEventListener("click", () => changeQuantity(index, 1));

        const remove = document.createElement("button");
        remove.className = "add-cart-btn";
        remove.textContent = "Remove";
        remove.addEventListener("click", () => removeItem(index));

        card.append(name, price, quantity, subtotal,
                    decrease, increase, remove);

        cartItems.appendChild(card);
    });
}

function changeQuantity(index, amount) {
    if (!cart[index]) return;

    cart[index].quantity += amount;

    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }

    saveCart();
    displayCart();
}

function removeItem(index) {
    if (!cart[index]) return;

    cart.splice(index, 1);
    saveCart();
    displayCart();
}

function clearCart() {
    if (cart.length === 0) {
        alert("Your cart is already empty.");
        return;
    }

    if (confirm("Are you sure you want to clear your cart?")) {
        cart = [];
        saveCart();
        displayCart();
    }
}

function checkout() {
    if (cart.length === 0) {
        alert("Your cart is empty. Please add a jersey first.");
        return;
    }

    let message = "Hello Giroud Jersey Shop! I want to order:\n\n";

    cart.forEach(item => {
        message += item.name + " x " + item.quantity +
            " = KSh " +
            (item.price * item.quantity).toLocaleString("en-KE") +
            "\n";
    });

    const total = cart.reduce(
        (sum, item) => sum + item.price * item.quantity, 0
    );

    message += "\nTotal: KSh " + total.toLocaleString("en-KE");
    message += "\nPlease confirm availability and delivery details.";

    const url = "https://wa.me/" + WHATSAPP_NUMBER +
        "?text=" + encodeURIComponent(message);

    window.open(url, "_blank", "noopener,noreferrer");
}

// Connect product buttons to the shopping cart.
document.querySelectorAll(".add-cart-btn[data-name]").forEach(button => {
    button.addEventListener("click", () => {
        const name = button.dataset.name;
        const price = Number(button.dataset.price);

        if (name && Number.isFinite(price) && price >= 0) {
            addToCart(name, price);
        }
    });
});

// Connect cart action buttons.
document.getElementById("checkout-btn")
    .addEventListener("click", checkout);

document.getElementById("clear-cart-btn")
    .addEventListener("click", clearCart);

// Display the cart on page load.
displayCart();
