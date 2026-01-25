import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

import {
  getFirestore,
  setDoc,
  doc
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

import { app } from "../config/config.js";

// Firebase services
const auth = getAuth(app);
const db = getFirestore(app);

/* ================= REGISTER ================= */

const registerForm = document.querySelector("#registerForm");

if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.querySelector("#username")?.value.trim();
    const email = document.querySelector("#email")?.value.trim();
    const password = document.querySelector("#password")?.value;
    const confirmPassword = document.querySelector("#confirmPassword")?.value;

    if (!username || !email || !password || !confirmPassword) {
      alert("Please fill all fields");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const role_id = email === "admin@example.com" ? "admin" : "user";

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userData = {
        username,
        email,
        role_id,
        balance: 0
      };

      await setDoc(doc(db, "users", user.uid), userData);

      alert("Register successful!");
      window.location.href = "login.html";
    } catch (error) {
      alert(error.message);
      console.error(error);
    }
  });
}

/* ================= LOGIN ================= */

const loginForm = document.querySelector("#loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.querySelector("#email")?.value.trim();
    const password = document.querySelector("#password")?.value;

    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      localStorage.setItem("user_session", JSON.stringify(user));

      alert("Login successful!");
      window.location.href = "main.html";
    } catch (error) {
      alert("Wrong email or password");
      console.error(error);
    }
  });
}
