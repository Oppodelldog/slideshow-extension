console.log("extension-connect");

let clients = [];

connectEachNewTabToServer();
disconnectFromServerWhenTabIsClosed();
addButtonBehavior();

function connectEachNewTabToServer() {
    browser.tabs.onCreated.addListener((tab) => {
        updateButton();
        browser.storage.local.get().then(
            (settings) => {
                connectTabToServer(tab, settings);
            },
            (error) => {
                console.log(error);
            });
    });
}

function disconnectFromServerWhenTabIsClosed() {
    browser.tabs.onRemoved.addListener((tabId) => {
        const client = clients[tabId];
        client.disconnect();
        delete clients[tabId];
        console.log("disconnected from slideshow server on tab " + tabId);
    });
}

function addButtonBehavior() {
    browser.browserAction.onClicked.addListener(function () {
        browser.storage.local.get().then(
            (settings) => {
                settings.addOnEnabled = !settings.addOnEnabled;
                browser.storage.local.set(settings);
                updateButton();
            },
            (error) => {
                console.log(error);
            });
    });
}

function updateButton() {
    browser.storage.local.get().then(
        (settings) => {
            if (settings.addOnEnabled) {
                browser.browserAction.setIcon({ path: "icons/stop.svg" });
            } else {
                browser.browserAction.setIcon({ path: "icons/play.svg" });
            }
        },
        (error) => {
            console.log(error);
        });
}

function connectTabToServer(tab, settings) {
    if (settings.addOnEnabled) {
        console.log("connect to slideshow server on tab " + tab.id);
        console.log(settings);
        const client = new SlideshowClient(tab.id, settings.token, settings.serverAddress, settings.sessionName, settings.slideShowId);
        client.connect();
        clients[tab.id] = client;
    } else {
        console.log("addd on not enabled");
    }
}




