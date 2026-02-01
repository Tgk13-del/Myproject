import {
  getFirestore,
  collection,
  getDocs,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

import { app, auth } from "../../config/config.js";
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

/* ===============================
   🛒 CART SYSTEM (MODAL)
================================ */

let cart = JSON.parse(localStorage.getItem("cart")) || [];

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function updateCartBadge() {
  const count = cart.reduce((s, i) => s + i.quantity, 0);
  let badge = document.getElementById("cartBadge");

  if (!badge) {
    const nav = document.querySelector(".navbar .container-fluid");
    const btn = document.createElement("button");

    btn.className = "btn btn-warning ms-2 position-relative";
    btn.innerHTML = `
      🛒 Cart
      <span id="cartBadge"
        class="badge bg-danger position-absolute top-0 start-100 translate-middle">
        0
      </span>
    `;
    btn.onclick = showCartModal;
    nav.appendChild(btn);

    badge = document.getElementById("cartBadge");
  }

  badge.textContent = count;
}

function addToCart(p) {
  const item = cart.find(i => i.id === p.id);
  if (item) {
    item.quantity++;
  } else {
    cart.push({
      id: p.id,
      title: p.title,
      price: p.price,
      image: p.image,
      quantity: 1
    });
  }
  saveCart();
  updateCartBadge();
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  saveCart();
  renderCart();
  updateCartBadge();
}

window.removeCart = removeFromCart;

function renderCart() {
  const body = document.getElementById("cartItems");
  const totalEl = document.getElementById("cartTotal");

  body.innerHTML = "";
  let total = 0;

  cart.forEach(i => {
    const subtotal = i.price * i.quantity;
    total += subtotal;

    body.innerHTML += `
      <tr>
        <td>
          <img src="${i.image}" class="cart-img">
        </td>
        <td>${i.title}</td>
        <td>$${i.price}</td>
        <td>${i.quantity}</td>
        <td>$${subtotal.toFixed(2)}</td>
        <td>
          <button class="btn btn-sm btn-danger"
            onclick="removeCart('${i.id}')">❌</button>
        </td>
      </tr>
    `;
  });

  totalEl.textContent = `$${total.toFixed(2)}`;
}

function showCartModal() {
  if (!cart.length) return;
  renderCart();
  new bootstrap.Modal(document.getElementById("cartModal")).show();
}

/* ===== BUY NOW → SUCCESS MODAL ===== */
document.getElementById("buyBtn")?.addEventListener("click", () => {
  cart = [];
  saveCart();
  updateCartBadge();

  bootstrap.Modal.getInstance(
    document.getElementById("cartModal")
  ).hide();

  new bootstrap.Modal(
    document.getElementById("successModal")
  ).show();
});

/* ===============================
   🔐 AUTH
================================ */

let isAdmin = false;

onAuthStateChanged(auth, user => {
  const userSection = document.getElementById("userSection");
  const signInBtn = document.querySelector('a[href="login.html"]');

  if (user) {
    isAdmin = user.email === "admin@gmail.com"; 
    signInBtn && (signInBtn.style.display = "none");

    userSection.innerHTML = `
      <span class="text-white me-2">${user.email}</span>
      <button class="btn btn-danger btn-sm" id="logoutBtn">Logout</button>
    `;

    document.getElementById("logoutBtn").onclick = async () => {
      await signOut(auth);
      localStorage.clear();
      location.href = "login.html";
    };

    if (isAdmin) {
      const adminLink = document.getElementById("adminPage");
      adminLink && (adminLink.style.display = "block");
    }
  } else {
    isAdmin = false;
    userSection.innerHTML = "";
    signInBtn && (signInBtn.style.display = "inline-block");
  }
});

/* ===============================
   📦 PRODUCTS
================================ */

const db = getFirestore(app);
let allProducts = [];

async function loadUploadedProducts() { ///check again
  const snap = await getDocs(collection(db, "products"));/// check again
  return snap.docs.map(d => ({     ///check again 
    id: "fs_" + d.id,
    fsId: d.id,
    title: d.data().name,
    description: d.data().description,
    price: d.data().price,
    rating: d.data().rating ?? 5,
    image: d.data().imageUrl,
    seller: d.data().sellerEmail
  }));
}

async function loadProducts() {
  const apiRes = await fetch("https://fakestoreapi.com/products");
  const api = await apiRes.json();

  const apiProducts = api.map(p => ({
    id: "api_" + p.id,
    title: p.title,
    description: p.description,
    price: p.price,
    rating: p.rating?.rate ?? 5,
    image: p.image,
    seller: "Official Store"
  }));

  const uploaded = await loadUploadedProducts();
  allProducts = [...uploaded, ...apiProducts];
  renderProducts(allProducts);
}

function renderProducts(list) {
  const grid = document.getElementById("productGrid");
  grid.innerHTML = "";

  list.forEach(p => {
    grid.innerHTML += `
      <div class="col product-item">
        <div class="card h-100 text-center">
          <img src="${p.image}" class="card-img-top">
          <div class="card-body">
            <h6>${p.title}</h6>
            <small>⭐ ${p.rating}</small>
            <button class="btn btn-warning btn-sm mt-2 see-more-btn"
              data-id="${p.id}">
              See more informations
            </button>
          </div>
        </div>
      </div>
    `;
  });
}

/* ===============================
   🟧 PRODUCT DETAIL MODAL
================================ */

document.addEventListener("click", e => {
  if (!e.target.classList.contains("see-more-btn")) return;

  const p = allProducts.find(x => x.id === e.target.dataset.id);
  if (!p) return;

  document.getElementById("modalProductTitle").textContent = p.title;
  document.getElementById("modalProductImage").src = p.image;
  document.getElementById("modalProductSeller").textContent = p.seller;
  document.getElementById("modalProductDesc").textContent = p.description;
  document.getElementById("modalProductPrice").textContent = p.price;
  document.getElementById("modalProductRating").textContent = p.rating;

  // Add to cart
  document.getElementById("modalAddToCart").onclick = () => addToCart(p);

  // DELETE PRODUCT (ADMIN ONLY)
  const deleteBtn = document.getElementById("modalDeleteProduct");

  if (isAdmin && p.id.startsWith("fs_")) {
    deleteBtn.style.display = "inline-block";

    deleteBtn.onclick = async () => {
      if (!confirm("Delete this product permanently?")) return;

      await deleteDoc(doc(db, "products", p.fsId));

      // remove from cart if exists
      cart = cart.filter(i => i.id !== p.id);
      saveCart();
      updateCartBadge();

      loadProducts();

      bootstrap.Modal.getInstance(
        document.getElementById("productDetailModal")
      ).hide();
    };
  } else {
    deleteBtn.style.display = "none";
  }

  new bootstrap.Modal(
    document.getElementById("productDetailModal")
  ).show();
});


/* ===============================
   🚀 INIT
================================ */

document.addEventListener("DOMContentLoaded", () => {
  loadProducts();
  updateCartBadge();
});
