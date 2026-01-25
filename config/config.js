import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyC3iEaZOHh03remD8Uejwp_SjrVxTDufUw",
  authDomain: "jsi16-74cce.firebaseapp.com",
  projectId: "jsi16-74cce",
  storageBucket: "jsi16-74cce.firebasestorage.app",
  messagingSenderId: "1065945161793",
  appId: "1:1065945161793:web:e2e64870d405dbaf6be6c0"
};

// 🔥 INITIALIZE ONCE
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// 🔥 EXPORT SAME INSTANCES
export { app, auth };
