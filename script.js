import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCerd0Uc6x5g-GIyBKoqqbfIYB3RGd0N3k",
    authDomain: "smart-dashbord-d6fc5.firebaseapp.com",
    projectId: "smart-dashbord-d6fc5",
    storageBucket: "smart-dashbord-d6fc5.firebasestorage.app",
    messagingSenderId: "158467993473",
    appId: "1:158467993473:web:5c310691ecbe46510e0280"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentUser = null;

// युजर स्टेट ट्रॅक करणे व लाईव्ह ॲक्टिव्हिटी (वेळ, तारीख, लोकेशन) दाखवणे
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        document.getElementById("auth-container").style.display = "none";
        document.getElementById("dashboard-container").style.display = "block";
        document.getElementById("userEmailDisplay").innerText = user.email;
        
        // लाईव्ह वेळ, तारीख आणि लोकेशन कॅप्चर करणे
        loadActivityTracker();
        await loadUserData(user.uid);
    } else {
        currentUser = null;
        document.getElementById("auth-container").style.display = "block";
        document.getElementById("dashboard-container").style.display = "none";
    }
});

// ॲक्टिव्हिटी ट्रकर फंक्शन (वेळ, तारीख व लोकेशन)
function loadActivityTracker() {
    let now = new Date();
    let dateStr = now.toLocaleDateString('mr-IN', { year: 'numeric', month: 'long', day: 'numeric' });
    let timeStr = now.toLocaleTimeString('mr-IN');

    let trackerBox = document.getElementById("activityTracker");
    trackerBox.innerHTML = `📍 <strong>ॲक्टिव्हिटी लॉल:</strong> तारीख: ${dateStr} | वेळ: ${timeStr}`;

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                let lat = position.coords.latitude.toFixed(2);
                let lon = position.coords.longitude.toFixed(2);
                trackerBox.innerHTML += `<br>🌍 <strong>लोकेशन:</strong> Lat: ${lat}, Lon: ${lon} (सुरक्षित नोंदवली आहे)`;
            },
            (error) => {
                trackerBox.innerHTML += `<br>🌍 <strong>लोकेशन:</strong> परवानगी दिली नाही किंवा उपलब्ध नाही.`;
            }
        );
    }
}

// साईन अप फंक्शन
window.handleSignup = async function() {
    let email = document.getElementById("authEmail").value.trim();
    let password = document.getElementById("authPassword").value.trim();
    if(!email || !password) {
        document.getElementById("authMsg").innerText = "कृपया ईमेल आणि पासवर्ड टाका!";
        return;
    }
    try {
        await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
        document.getElementById("authMsg").innerText = "एरर: " + error.message;
    }
}

// लॉगिन फंक्शन
window.handleLogin = async function() {
    let email = document.getElementById("authEmail").value.trim();
    let password = document.getElementById("authPassword").value.trim();
    if(!email || !password) {
        document.getElementById("authMsg").innerText = "कृपया ईमेल आणि पासवर्ड टाका!";
        return;
    }
    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        document.getElementById("authMsg").innerText = "चुकीचा ईमेल किंवा पासवर्ड!";
    }
}

// लॉगआउट फंक्शन
window.handleLogout = async function() {
    await signOut(auth);
}

// प्रोफाइल सेव्ह करणे
window.saveProfile = async function() {
    if (!currentUser) return;
    let name = document.getElementById("profileName").value;
    let bio = document.getElementById("profileBio").value;
    try {
        await setDoc(doc(db, "users", currentUser.uid), {
            name: name,
            bio: bio
        }, { merge: true });
        alert("प्रोफाइल क्लाउडवर यशस्वीरीत्या सेव्ह झाली!");
    } catch (error) {
        console.error(error);
    }
}

// नोट्स सेव्ह करणे
window.saveNote = async function() {
    if (!currentUser) return;
    let noteText = document.getElementById("quickNote").value;
    try {
        await setDoc(doc(db, "users", currentUser.uid), {
            note: noteText
        }, { merge: true });
        document.getElementById("noteStatus").innerText = "डेटा क्लाउडवर सुरक्षित सेव्ह झाला!";
        setTimeout(() => { document.getElementById("noteStatus").innerText = ""; }, 2000);
    } catch (error) {
        console.error(error);
    }
}

// युजरचा डेटा लोड करणे
async function loadUserData(uid) {
    try {
        const docSnap = await getDoc(doc(db, "users", uid));
        if (docSnap.exists()) {
            let data = docSnap.data();
            if (data.note) document.getElementById("quickNote").value = data.note;
            if (data.name) document.getElementById("profileName").value = data.name;
            if (data.bio) document.getElementById("profileBio").value = data.bio;
        }
    } catch (error) {
        console.error(error);
    }
}

// थीम बदलणे (Forest Theme & Light Theme)
window.changeTheme = function() {
    let theme = document.getElementById("themeSelector").value;
    if (theme === "light") {
        document.body.classList.add("light-theme");
    } else {
        document.body.classList.remove("light-theme");
    }
}

