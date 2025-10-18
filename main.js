// ===============================
// 🛍️ CART SYSTEM
// ===============================
let cart = JSON.parse(localStorage.getItem("cart")) || [];

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function updateCartBadge() {
  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  let badge = document.getElementById("cartBadge");

  if (!badge) {
    const navbar = document.querySelector(".navbar .container-fluid") || document.body;
    const cartBtn = document.createElement("button");
    cartBtn.className = "btn btn-warning position-relative ms-2";
    cartBtn.innerHTML = `
      🛒 Cart 
      <span id="cartBadge" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">0</span>
    `;
    cartBtn.addEventListener("click", showCartWindow);
    navbar.appendChild(cartBtn);
    badge = document.getElementById("cartBadge");
  }

  badge.textContent = totalCount;
}

function totalPrice() {
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function addToCart(product) {
  const existing = cart.find(item => item.id === product.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  saveCart();
  updateCartBadge();
}

// ===============================
// 💬 MINI CART POPUP
// ===============================
function showCartWindow() {
  let cartDetails = "";
  cart.forEach(item => {
    const subtotal = item.price * item.quantity;
    cartDetails += `
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
        <img src="${item.image}" style="width:50px;height:50px;object-fit:cover;border-radius:6px;">
        <div>
          <strong>${item.title}</strong><br>
          $${item.price} × ${item.quantity} = <strong>$${subtotal.toFixed(2)}</strong>
        </div>
      </div>
    `;
  });

  if (cart.length === 0) {
    cartDetails = "<p>Your cart is empty.</p>";
  }

  const existing = document.getElementById("cartPopup");
  if (existing) existing.remove();

  const popup = document.createElement("div");
  popup.id = "cartPopup";
  popup.innerHTML = `
    <div style="position:fixed;top:80px;right:20px;width:320px;background:white;border-radius:10px;box-shadow:0 4px 12px rgba(0,0,0,0.2);padding:15px;z-index:9999;font-family:Arial;">
      <h5 style="color:orangered;">🧾 Your Cart</h5>
      <div style="max-height:300px;overflow-y:auto;">${cartDetails}</div>
      <hr>
      <div style="font-weight:bold;">Total: $${totalPrice().toFixed(2)}</div>
      <div style="display:flex;gap:10px;margin-top:10px;">
        <button id="clearCart" style="flex:1;background:#dc3545;color:white;border:none;padding:6px 12px;border-radius:6px;">🗑️ Clear</button>
        <button id="closeCart" style="flex:1;background:orangered;color:white;border:none;padding:6px 12px;border-radius:6px;">Close</button>
        <button id="buyCart" style="flex:1;background:#28a745;color:white;border:none;padding:6px 12px;border-radius:6px;">💳 Buy</button>
      </div>
    </div>
  `;
  document.body.appendChild(popup);

  document.getElementById("closeCart").addEventListener("click", () => popup.remove());

  document.getElementById("clearCart").addEventListener("click", () => {
    localStorage.removeItem("cart");
    cart = [];
    updateCartBadge();
    popup.remove();
    alert("🗑️ Cart cleared!");
  });

  document.getElementById("buyCart").addEventListener("click", () => {
    if (cart.length === 0) {
      alert("🛒 Your cart is empty!");
      return;
    }

    localStorage.removeItem("cart");
    cart = [];
    updateCartBadge();
    popup.remove();

    const successModal = new bootstrap.Modal(document.getElementById("successModal"));
    successModal.show();
  });
}

// ===============================
// 📦 FETCH & DISPLAY PRODUCTS
// ===============================
let allProducts = [];

async function loadProducts() {
  const res = await fetch("https://fakestoreapi.com/products");
  allProducts = await res.json();
  displayProducts(allProducts);
}

function displayProducts(products) {
  const productList = document.getElementById("product-list");
  productList.innerHTML = "";

  products.forEach(product => {
    const col = document.createElement("div");
    col.className = "col-md-3";
    col.innerHTML = `
      <div class="card h-100 text-center p-3" style="font-family:'Courier New', monospace;">
        <img src="${product.image}" class="card-img-top" style="height:200px;object-fit:contain;" alt="${product.title}">
        <div class="card-body">
          <h6 class="card-title" style="height:45px;overflow:hidden;">${product.title}</h6>
          <p class="text-success fw-bold">$${product.price}</p>
          <button class="btn btn-primary add-to-cart" data-id="${product.id}">Add to Cart</button>
        </div>
      </div>
    `;
    productList.appendChild(col);
  });

  document.querySelectorAll(".add-to-cart").forEach(btn => {
    btn.addEventListener("click", e => {
      const id = parseInt(btn.dataset.id);
      const product = allProducts.find(p => p.id === id);
      addToCart(product);
    });
  });
}

function filterProducts() {
  const selectedCategory = document.getElementById("categoryDropdown").value;
  const filtered = selectedCategory === "all"
    ? allProducts
    : allProducts.filter(p => p.category === selectedCategory);
  displayProducts(filtered);
}

// ===============================
// 🚀 INIT
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  loadProducts();
  updateCartBadge();

  const dropdown = document.getElementById("categoryDropdown");
  if (dropdown) {
    dropdown.addEventListener("change", filterProducts);
  }

  document.getElementById("seeBtn1").addEventListener("click", () => goToProducts("modal1"));
  document.getElementById("seeBtn2").addEventListener("click", () => goToProducts("modal2"));
  document.getElementById("seeBtn3").addEventListener("click", () => goToProducts("modal3"));
  document.getElementById("seeBtn4").addEventListener("click", () => goToProducts("modal4"));
  document.getElementById("seeBtn5").addEventListener("click", () => goToProducts("modal5"));
});

// ===============================
// 🛍️ Scroll to product section & close modal
// ===============================
function goToProducts(modalId) {
  const modalEl = document.getElementById(modalId);
  const modalInstance = bootstrap.Modal.getInstance(modalEl);
  modalInstance.hide();

  document.getElementById("ourProducts").scrollIntoView({
    behavior: "smooth"
  });
}
document.getElementById("gotItBtn").addEventListener("click", () => {
  const modalEl = document.getElementById("successModal");
  const modalInstance = bootstrap.Modal.getInstance(modalEl);
  modalInstance.hide();
});