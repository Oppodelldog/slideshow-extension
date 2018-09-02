var expect = require('expect');
var SlideShowClient = require('../src/slideShowClient');
var jest = require('jest-mock');

global.WebSocket = jest.fn();

console.log = function (m) {
};


var fakeTimeout = {
    func:null,
    timeout:0,
    setTimeout : function(f,t){
        this.func = f;
        this.timeout=t;
        f();
    }
};

global.setTimeout = fakeTimeout.setTimeout.bind(fakeTimeout);

function createSlieShowClient() {
    var tabId = 31;
    var token = "123";
    var serverAddress = "ws://localhost:7777";
    var sessionName = "test";
    var slideShowId = "124789";

    return new SlideShowClient(tabId, token, serverAddress, sessionName, slideShowId);
}

describe('SlideShowClient', () => {
    describe('constructor', () => {
        it('should return a new object', () => {
            expect(new SlideShowClient()).toBeDefined()
        });
    });

    describe('connect', () => {
        var c = createSlieShowClient();
        c.connect();

        it('should instanciate a websocket', () => {
            expect(global.WebSocket).toHaveBeenCalled();
        });
        it('should pass address to the constructor of the websocket', () => {
            expect(global.WebSocket).toHaveBeenCalledWith('ws://ws://localhost:7777/connect?token=123&sessionName=test&slideShowId=124789');
        });
    });
    describe('websocket has connected', () => {
        var c = createSlieShowClient();
        c.onOpen = jest.fn();
        c.connect();

        var evt = {};
        c.websocket.onopen(evt);

        it('should process the onopen event in onOpen', () => {
            expect(c.onOpen).toHaveBeenCalledTimes(1);
            expect(c.onOpen).toHaveBeenCalledWith(evt);
        });
    });
    describe('websocket has error', () => {
        var c = createSlieShowClient();
        c.onError = jest.fn();
        c.connect();

        var evt = {};
        c.websocket.onerror(evt);

        it('should process the onerror event in onError', () => {
            expect(c.onError).toHaveBeenCalledTimes(1);
            expect(c.onError).toHaveBeenCalledWith(evt);
        });
    });
    describe('websocket has message', () => {
        var c = createSlieShowClient();
        c.onMessage = jest.fn();
        c.connect();

        var evt = {};
        c.websocket.onmessage(evt);

        it('should process the onmessage in onMessage', () => {
            expect(c.onMessage).toHaveBeenCalledTimes(1);
            expect(c.onMessage).toHaveBeenCalledWith(evt);
        });
    });

    describe('websocket connection close', () => {
        var c = createSlieShowClient();
        c.onClose = jest.fn();
        c.connect();

        var evt = {};
        c.websocket.onclose(evt);

        it('should process the onclose event in onClose', () => {
            expect(c.onClose).toHaveBeenCalledTimes(1);
            expect(c.onClose).toHaveBeenCalledWith(evt);
        });
    });

    describe('SlideShowServer send loadUrl command', () => {
        var c = createSlieShowClient();
        var evt = { data: '{"Action":"loadUrl", "Url": "http://www.github.com" }' };
        global.browser = {};
        global.browser.tabs = {};
        global.browser.tabs.update = jest.fn();
        var promise = { catch: jest.fn() };
        global.browser.tabs.update.mockReturnValue(promise);

        c.onMessage(evt);

        it('should load the Url in the current tab', () => {
            expect(global.browser.tabs.update).toHaveBeenCalledTimes(1);
            expect(global.browser.tabs.update).toHaveBeenCalledWith(c.tabId, { url: "http://www.github.com" });
        });
    });

    describe('Loading the url goes wrong since the tab was closed', () => {
        var c = createSlieShowClient();
        global.browser = {
            tabs: {
                update: jest.fn()
            }
        };
        var promise = {
            registeredCatchCallback: null, catch: function (f) {
                this.registeredCatchCallback = f;
            }
        };
        global.browser.tabs.update.mockReturnValue(promise);
        c.disconnect = jest.fn();
        c.loadUrl("http://www.github.com");

        const err = { message: "Invalid tab ID" };
        promise.registeredCatchCallback(err);

        it('should disconnect', () => {
            expect(c.disconnect).toHaveBeenCalledTimes(1);
        });
    });

    describe('Connection was closed', () => {
        var c = createSlieShowClient();
        c.connect = jest.fn();
        c.onClose({});

        it('should reconnect after configure reconnect time', () => {
            expect(fakeTimeout.timeout).toBe(c.reconnectAfterMs);
            expect(c.connect).toHaveBeenCalledTimes(1);
        });
    });
});
