import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

import { app } from "../config/config.js";

const db = getFirestore(app);

/* ================= USER ================= */

const user = JSON.parse(localStorage.getItem("user_session"));

if (!user) {
  alert("You must login first");
  window.location.href = "login.html";
}

/* ================= SHOW SELLER ================= */

const sellerName = document.getElementById("sellerName");
if (sellerName) sellerName.textContent = user.email;

/* ================= IMAGE PREVIEW ================= */

const imageInput = document.getElementById("productImage");
const previewImg = document.getElementById("imagePreview");

if (imageInput && previewImg) {
  imageInput.addEventListener("change", () => {
    const file = imageInput.files[0];
    if (!file) return;

    previewImg.src = URL.createObjectURL(file);
    previewImg.style.display = "block";
  });
}

/* ================= PUBLISH PRODUCT ================= */

document.getElementById("publishBtn").addEventListener("click", async () => {
  const imageFile = imageInput?.files[0];
  const title = document.getElementById("productName").value.trim();
  const description = document.getElementById("productDescription").value.trim();
  const price = document.getElementById("productPrice").value;
  const rating = document.getElementById("productRating").value;

  if (!title || !description || !price || !imageFile) {
    alert("Please fill all fields and upload an image");
    return;
  }

  try {
    /* ================= CLOUDINARY ================= */

    const cloudName = "det1nfy4g";
    const uploadPreset = "jsi16hahahahha";

    const formData = new FormData();
    formData.append("file", imageFile);
    formData.append("upload_preset", uploadPreset);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: "POST", body: formData }
    );

    const imgData = await res.json();

    if (!imgData.secure_url) {
      throw new Error("Cloudinary upload failed");
    }

    /* ================= SAVE TO FIRESTORE ================= */

    await addDoc(collection(db, "products"), {
      name: title,                  // 🔥 matches main.js
      description,
      price: Number(price),
      rating: rating ? Number(rating) : 5,
      imageUrl: imgData.secure_url, // 🔥 matches main.js
      sellerEmail: user.email,
      sellerId: user.uid,
      createdAt: serverTimestamp()
    });

    alert("Product published successfully!");
    window.location.href = "main.html";

  } catch (err) {
    console.error(err);
    alert("Upload failed. Check console.");
  }
});
document.getElementById("exitUploadBtn").addEventListener("click", () => {
  if (confirm("Exit upload page? Unsaved changes will be lost.")) {
    window.location.href = "main.html";
  }
});
