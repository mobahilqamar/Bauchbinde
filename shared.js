(function () {
  const DEFAULT_STATE = {
    visible: false,
    line1: "Name des Redners",
    line2: "Funktion / Thema",
    updatedAt: Date.now()
  };

  const hasFirebaseConfig = window.firebaseConfig && !String(window.firebaseConfig.apiKey || "").includes("PASTE_");
  let ref = null;

  if (hasFirebaseConfig && window.firebase) {
    firebase.initializeApp(window.firebaseConfig);
    ref = firebase.database().ref("obs/lowerThird/main");
  }

  window.LowerThirdStore = {
    defaultState: DEFAULT_STATE,
    isFirebase: !!ref,
    listen(callback) {
      if (ref) {
        ref.on("value", snap => callback({ ...DEFAULT_STATE, ...(snap.val() || {}) }));
      } else {
        callback({ ...DEFAULT_STATE, ...JSON.parse(localStorage.getItem("lowerThirdState") || "{}") });
        window.addEventListener("storage", () => {
          callback({ ...DEFAULT_STATE, ...JSON.parse(localStorage.getItem("lowerThirdState") || "{}") });
        });
      }
    },
    async set(patch) {
      const next = { ...patch, updatedAt: Date.now() };
      if (ref) return ref.update(next);
      const current = { ...DEFAULT_STATE, ...JSON.parse(localStorage.getItem("lowerThirdState") || "{}") };
      localStorage.setItem("lowerThirdState", JSON.stringify({ ...current, ...next }));
      window.dispatchEvent(new Event("storage"));
    },
    async reset() {
      if (ref) return ref.set(DEFAULT_STATE);
      localStorage.setItem("lowerThirdState", JSON.stringify(DEFAULT_STATE));
      window.dispatchEvent(new Event("storage"));
    }
  };
})();
