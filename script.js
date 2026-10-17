import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// तुमचा अचूक Firebase कॉन्फिगरेशन कोड
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

// युजर स्टेट ट्रॅक करणे
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        document.getElementById("auth-container").style.display = "none";
        document.getElementById("dashboard-container").style.display = "block";
        document.getElementById("userEmailDisplay").innerText = user.email;
        await loadUserData(user.uid);
    } else {
        currentUser = null;
        document.getElementById("auth-container").style.display = "block";
        document.getElementById("dashboard-container").style.display = "none";
    }
});

// साईन अप फंक्शन
window.handleSignup = async function() {
    let email = document.getElementById("authEmail").value;
    let password = document.getElementById("authPassword").value;
    try {
        await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
        document.getElementById("authMsg").innerText = "एरर: " + error.message;
    }
}

// लॉगिन फंक्शन
window.handleLogin = async function() {
    let email = document.getElementById("authEmail").value;
    let password = document.getElementById("authPassword").value;
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

// डेटा क्लाउडवर सेव्ह करणे
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
            if (data.note) {
                document.getElementById("quickNote").value = data.note;
            }
        }
    } catch (error) {
        console.error(error);
    }
}

// टू-डू लिस्ट ॲड करणे
window.addTask = function() {
    let taskInput = document.getElementById("taskInput");
    let taskText = taskInput.value.trim();
    if(taskText === "") return;

    let ul = document.getElementById("taskList");
    let li = document.createElement("li");
    li.innerText = taskText;
    li.onclick = function() { li.classList.toggle("completed"); };
    ul.appendChild(li);
    taskInput.value = "";
}

// PDF डाऊनलोड करणे
window.downloadPDF = function() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    let noteText = document.getElementById("quickNote").value;
    
    doc.setFont("helvetica", "bold");
    doc.text("Smart Dashboard Report", 20, 20);
    doc.setFont("helvetica", "normal");
    doc.text("User: " + (currentUser ? currentUser.email : "Guest"), 20, 30);
    doc.text("Quick Notes:", 20, 45);
    doc.text(noteText || "No notes written.", 20, 55);
    
    doc.save("SmartDashboard-Report.pdf");
}

