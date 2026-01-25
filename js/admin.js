import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";
import { app } from "../config/config.js";

window.addEventListener("load", async () => {
  const adminBtn = document.getElementById("adminPage");
  if (!adminBtn) return;

  // ✅ CORRECT STORAGE KEY
  const user = JSON.parse(localStorage.getItem("user_session"));
  console.log("user_session:", user);

  if (!user) {
    adminBtn.style.display = "none";
    return;
  }

  const db = getFirestore(app);
  const userRef = doc(db, "users", user.uid);
  const userDoc = await getDoc(userRef);

  console.log("User doc exists:", userDoc.exists());

  if (!userDoc.exists()) {
    adminBtn.style.display = "none";
    return;
  }

  const userData = userDoc.data();
  console.log("User data:", userData);

  // CORRECT ROLE FIELD
  if (userData.role_id === "admin") {
    adminBtn.style.display = "block";
    console.log("Admin page shown");
  } else {
    adminBtn.style.display = "none";
    console.log("Admin page hidden");
  }
});
