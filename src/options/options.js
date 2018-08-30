function saveOptions(e) {
    e.preventDefault();
    browser.storage.local.set({
        token: document.querySelector("#access-token").value,
        sessionName: document.querySelector("#session-name").value,
        serverAddress: document.querySelector("#server-address").value,
        addOnEnabled: document.querySelector("#addOn-enabled").checked,
    });
}

function restoreOptions() {

    function setCurrentChoice(result) {
        document.querySelector("#access-token").value = result.token || "";
        document.querySelector("#session-name").value = result.sessionName || "";
        document.querySelector("#server-address").value = result.serverAddress || "";
        document.querySelector("#addOn-enabled").checked = result.addOnEnabled || false
    }

    function onError(error) {
        console.log(`Error: ${error}`);
    }

    browser.storage.local.get().then(setCurrentChoice, onError);
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);