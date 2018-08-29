console.log("extension-connect");

const ACTION_LOAD_URL = 'loadUrl';

var clients = [];

connectEachNewTabToServer();
deconnectFromServerWhenTabIsClosed();

function connectEachNewTabToServer() {
    browser.tabs.onCreated.addListener((tab) => {
        browser.storage.local.get().then(
            (settings) => {
                connectTabToServer(tab, settings);
            },
            (error) => {
                console.log(error);
            });
    });
}

function deconnectFromServerWhenTabIsClosed() {
    browser.tabs.onRemoved.addListener((tabId) => {
        var client = clients[tabId];
        client.disconnect();
        delete clients[tabId];
        console.log("disconnected from slideshow server on tab " + tabId);
    });
}

function connectTabToServer(tab, settings) {
    console.log("connect to slideshow server on tab " + tab.id);
    console.log(settings);
    var client = new SlideshowClient(tab.id, settings.token, settings.serverAddress, settings.sessionName);
    client.connect();
    clients[tab.id] = client;
}

function SlideshowClient(tabId, token, serverAddress, sessionName) {
    this.token = token;
    this.tabId = tabId;
    this.serverAddress = serverAddress;
    this.sessionName = sessionName;
    this.monitorId = null;
    this.websocket = null;
    this.connect = () => {
        var reconnectParameter = "";
        if (this.monitorId != null) {
            reconnectParameter = "&monitorId=" + this.monitorId;
        }
        var wsUri = "ws://" + this.serverAddress + "/connect?token=" + this.token + "&sessionName=" + this.sessionName + reconnectParameter;
        console.log("connecting to " + wsUri);
        this.websocket = new WebSocket(wsUri);
        this.websocket.onopen = this.onOpen.bind(this);
        this.websocket.onclose = this.onClose.bind(this);
        this.websocket.onmessage = this.onMessage.bind(this);
        this.websocket.onerror = this.onError.bind(this);
    };

    this.disconnect = () => {
        console.log("closing websocket");
        this.websocket.onclose = null;
        this.websocket.onerror = null;
        this.websocket.onmessage = null;
        this.websocket.onopen = null;

        this.websocket.close();
    };

    this.onOpen = (evt) => {
        console.log("connection established");
        console.log(evt);
    };

    this.onClose = (evt) => {
        console.log("connection closed");
        console.log(evt);
        console.log("reconnecting");
        setTimeout(function () {
            self.connect();
        }.bin(this), 5000);
    };

    this.onMessage = (evt) => {
        console.log("received message");
        var command = JSON.parse(evt.data);
        console.log(command);
        switch (command.Action) {
            case ACTION_LOAD_URL:
                if (this.monitorId == null) {
                    this.monitorId = command.MonitorId;
                }
                this.loadUrl(command.Url);
                break;
        }
    };

    this.onError = (evt) => {
        console.log("communication error");
        console.log(evt);
    };

    this.loadUrl = (url) => {
        var tabId = this.tabId;
        var self = this;
        browser.tabs.update(
            tabId,
            {
                url: url,
            }
        ).catch((err) => {
            console.log("error while updating tab url");
            console.log(err);
            if (err.message.includes("Invalid tab ID")) {
                self.disconnect();
            }
        });
    };
}
