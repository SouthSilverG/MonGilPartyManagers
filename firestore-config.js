// Public Firebase web configuration. Never put service-account keys here.
window.MONGIL_BUILD_DB_CONFIG = Object.freeze({
  enabled: true, // Firestore rules published and Anonymous Auth enabled by the owner.
  allowedHostnames: ["southsilverg.github.io"],
  dataVersion: "2026-10-16",
  firebase: { apiKey: "AIzaSyCiF8VUDUbeCotdubZP_dHbK-rKoyBi6mk", authDomain: "mongiltodays.firebaseapp.com", projectId: "mongiltodays", appId: "1:787436499024:web:004232ea5ee9f9ecb86155" },
  appCheckSiteKey: "", // Optional reCAPTCHA v3 public site key; see FIRESTORE_SETUP.md.
});
