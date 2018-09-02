const ACTION_LOAD_URL = 'loadUrl';

function SlideshowClient(tabId, token, serverAddress, sessionName, slideShowId) {
    this.token = token;
    this.tabId = tabId;
    this.slideShowId = slideShowId;
    this.serverAddress = serverAddress;
    this.sessionName = sessionName;
    this.monitorId = null;
    this.websocket = null;
    this.reconnectAfterMs = 5000;
    this.connect = () => {
        let reconnectParameter = "";
        if (this.monitorId != null) {
            reconnectParameter = "&monitorId=" + this.monitorId;
        }
        const wsUri = "ws://" + this.serverAddress + "/connect?token=" + this.token + "&sessionName=" + this.sessionName + "&slideShowId=" + this.slideShowId + reconnectParameter;
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
        var self = this;
        setTimeout(function () {
            self.connect();
        }.bind(this), this.reconnectAfterMs);
    };

    this.onMessage = (evt) => {
        console.log("received message");
        const command = JSON.parse(evt.data);
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
        const tabId = this.tabId;
        const self = this;
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

// use modules in tests
if (typeof module !== "undefined") {
    module.exports = SlideshowClient;
}