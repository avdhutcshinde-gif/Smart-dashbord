function saveData() {
    let text = document.getElementById("userInput").value;
    if(text.trim() !== "") {
        document.getElementById("output").innerText = "सेव्ह झाले: " + text;
        document.getElementById("userInput").value = "";
    } else {
        document.getElementById("output").innerText = "कृपया काहीतरी लिहा!";
    }
}

