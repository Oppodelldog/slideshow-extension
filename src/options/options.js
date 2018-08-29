function saveOptions(e) {
    e.preventDefault();
    browser.storage.local.set({
        token: document.querySelector("#access-token").value,
        sessionName: document.querySelector("#session-name").value,
        serverAddress: document.querySelector("#server-address").value,
    });
}

function restoreOptions() {

    function setCurrentChoice(result) {
        document.querySelector("#access-token").value = result.token || "";
        document.querySelector("#session-name").value = result.sessionName || "";
        document.querySelector("#server-address").value = result.serverAddress || "";
    }

    function onError(error) {
        console.log(`Error: ${error}`);
    }

    var getting = browser.storage.local.get();
    getting.then(setCurrentChoice, onError);
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);