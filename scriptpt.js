// साईन अप फंक्शन
window.handleSignup = async function() {
    let emailInput = document.getElementById("authEmail").value.trim();
    let password = document.getElementById("authPassword").value.trim();
    
    if(!email || !password) {
        document.getElementById("authMsg").innerText = "कृपया ईमेल आणि पासवर्ड टाका!";
        return;
    }

    try {
        await createUserWithEmailAndPassword(auth, emailInput, password);
    } catch (error) {
        document.getElementById("authMsg").innerText = "एरर: " + error.message;
    }
}

// लॉगिन फंक्शन
window.handleLogin = async function() {
    let emailInput = document.getElementById("authEmail").value.trim();
    let password = document.getElementById("authPassword").value.trim();
    try {
        await signInWithEmailAndPassword(auth, emailInput, password);
    } catch (error) {
        document.getElementById("authMsg").innerText = "एरर: " + error.message;
    }
}

