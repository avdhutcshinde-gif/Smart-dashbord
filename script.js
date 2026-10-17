// १. नोट्स सेव्ह करणे आणि लोड करणे
function saveNote() {
    let noteText = document.getElementById("quickNote").value;
    localStorage.setItem("mySavedNote", noteText);
    document.getElementById("noteStatus").innerText = "नोंद यशस्वीरित्या सेव्ह झाली!";
    setTimeout(() => { document.getElementById("noteStatus").innerText = ""; }, 2000);
}

window.onload = function() {
    let savedNote = localStorage.getItem("mySavedNote");
    if(savedNote) {
        document.getElementById("quickNote").value = savedNote;
    }
}

// २. टू-डू लिस्ट लॉजिक
function addTask() {
    let taskInput = document.getElementById("taskInput");
    let taskText = taskInput.value.trim();
    if(taskText === "") return;

    let ul = document.getElementById("taskList");
    let li = document.createElement("li");
    li.innerText = taskText;
    
    li.onclick = function() {
        li.classList.toggle("completed");
    };

    ul.appendChild(li);
    taskInput.value = "";
}

// ३. कॅल्क्युलेटर लॉजिक
function calculate() {
    let expr = document.getElementById("calcInput").value;
    try {
        let result = eval(expr);
        document.getElementById("calcOutput").innerText = "उत्तर: " + result;
    } catch (error) {
        document.getElementById("calcOutput").innerText = "चुकीचे समीकरण!";
    }
}

// ४. थीम टॉगल (डार्क/लाइट मोड)
function toggleTheme() {
    document.body.classList.toggle("light-mode");
}

