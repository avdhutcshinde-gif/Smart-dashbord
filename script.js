import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

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
const storage = getStorage(app);

let currentUser = null;

onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        document.getElementById("auth-container").style.display = "none";
        document.getElementById("dashboard-container").style.display = "block";
        document.getElementById("userEmailDisplay").innerText = user.email;
        loadActivityTracker();
        await loadUserData(user.uid);
    } else {
        currentUser = null;
        document.getElementById("auth-container").style.display = "block";
        document.getElementById("dashboard-container").style.display = "none";
    }
});

function loadActivityTracker() {
    let now = new Date();
    let dateStr = now.toLocaleDateString('mr-IN', { year: 'numeric', month: 'long', day: 'numeric' });
    let timeStr = now.toLocaleTimeString('mr-IN');

    let trackerBox = document.getElementById("activityTracker");
    trackerBox.innerHTML = `📍 <strong>ॲक्टिव्हिटी लॉग:</strong> तारीख: ${dateStr} | वेळ: ${timeStr}`;

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                let lat = position.coords.latitude.toFixed(2);
                let lon = position.coords.longitude.toFixed(2);
                trackerBox.innerHTML += `<br>🌍 <strong>लोकेशन:</strong> Lat: ${lat}, Lon: ${lon} (सक्रिय रेकॉर्ड झाली)`;
            },
            (error) => {
                trackerBox.innerHTML += `<br>🌍 <strong>लोकेशन:</strong> जीपीएस परवानगी नाही.`;
            }
        );
    }
}

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

window.handleLogout = async function() {
    await signOut(auth);
}

window.saveProfile = async function() {
    if (!currentUser) return;
    let name = document.getElementById("profileName").value;
    let bio = document.getElementById("profileBio").value;
    try {
        await setDoc(doc(db, "users", currentUser.uid), { name, bio }, { merge: true });
        alert("प्रोफाइल क्लाउडवर यशस्वीरीत्या सेव्ह झाली!");
    } catch (error) {
        console.error(error);
    }
}

window.saveNote = async function() {
    if (!currentUser) return;
    let noteText = document.getElementById("quickNote").value;
    try {
        await setDoc(doc(db, "users", currentUser.uid), { note: noteText }, { merge: true });
        document.getElementById("noteStatus").innerText = "नोट्स क्लाउडवर सुरक्षित सेव्ह झाल्या!";
        setTimeout(() => { document.getElementById("noteStatus").innerText = ""; }, 2000);
    } catch (error) {
        console.error(error);
    }
}

// File Upload Functionality
window.uploadDocument = async function() {
    if (!currentUser) return;
    let fileInput = document.getElementById("fileUploader");
    if(fileInput.files.length === 0) {
        alert("कृपया पहिली एखाدی फाइल निवडा!");
        return;
    }
    let file = fileInput.files[0];
    let storageRef = ref(storage, 'documents/' + currentUser.uid + '/' + file.name);
    
    document.getElementById("fileStatus").innerText = "फाइल अपलोड होत आहे...";
    try {
        await uploadBytes(storageRef, file);
        let downloadURL = await getDownloadURL(storageRef);
        
        // Save link to Firestore
        await setDoc(doc(db, "users", currentUser.uid), { 
            fileName: file.name,
            fileUrl: downloadURL 
        }, { merge: true });

        document.getElementById("fileStatus").innerHTML = `फाइल यशस्वी अपलोड झाली! <br><a href="${downloadURL}" target="_blank" style="color: #a8e6cf; text-decoration: underline;">इथे क्लिक करून फाईल डाऊनलोड करा</a>`;
    } catch (error) {
        document.getElementById("fileStatus").innerText = "अपलोड करताना एरर आला: " + error.message;
    }
}

async function loadUserData(uid) {
    try {
        const docSnap = await getDoc(doc(db, "users", uid));
        if (docSnap.exists()) {
            let data = docSnap.data();
            if (data.note) document.getElementById("quickNote").value = data.note;
            if (data.name) document.getElementById("profileName").value = data.name;
            if (data.bio) document.getElementById("profileBio").value = data.bio;
            if (data.fileUrl && data.fileName) {
                document.getElementById("fileStatus").innerHTML = `सेव्ह केलेली फाइल: <br><a href="${data.fileUrl}" target="_blank" style="color: #a8e6cf; text-decoration: underline;">${data.fileName} डाऊनलोड करा</a>`;
            }
        }
    } catch (error) {
        console.error(error);
    }
}

window.changeTheme = function() {
    let theme = document.getElementById("themeSelector").value;
    if (theme === "light") {
        document.body.classList.add("light-theme");
    } else {
        document.body.classList.remove("light-theme");
    }
}

