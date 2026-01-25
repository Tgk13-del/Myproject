import { getFirestore, doc, getDoc } from
  "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";
import { app } from "../config/config.js";

const user = JSON.parse(localStorage.getItem("user_session"));

if (!user) {
  alert("You must login first");
  window.location.href = "login.html";
}

const db = getFirestore(app);

(async () => {
  const snap = await getDoc(doc(db, "users", user.uid));

  if (!snap.exists() || snap.data().role_id !== "admin") {
    alert("Access denied. Admin only ❌");
    window.location.href = "main.html";
  }
})();
