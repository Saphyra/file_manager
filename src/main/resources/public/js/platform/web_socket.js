function WebSocketConnection(ep){
    const endpoint = ep;
    const host = window.location.host;
    const handlers = [];

    let reconnectionTryCount = 1;

    let connection = null;

    this.addHandler = function(handler){
        console.log("Adding eventHandler", handler);

        if(!handler instanceof WebSocketEventHandler){
            throwException("IllegalArgument", "Handler is not a WebSocketEventHandler");
        }
        if(!isFunction(handler.canHandle)){
            throwException("IllegalArgument", "canHandle is not defined.");
        }
        if(!isFunction(handler.handle)){
            throwException("IllegalArgument", "handle is not defined.");
        }
        handlers.push(handler);
        return this;
    }

    //Default handlers
    this.addHandler(createPingWebSocketHandler(this));
    this.addHandler(createRedirectWebSocketHandler());

    this.addHandlers = function(h){
        new Stream(h)
            .forEach(this.addHandler);
        return this;
    }

    this.connect = connect
    this.waitForConnection = function(callback){
        console.log("Waiting for WebSocket connection...");
        if(connection && connection.readyState == 1){
            console.log("WebSocket connection established.");
            callback();
        }else{
            console.log("WebSocket connection is not established yet.");
            let timeout = setTimeout(
                ()=>{this.waitForConnection(callback)},
                100
            )
        }
    }

    function connect(){
        if(connection){
            throwException("IllegalState", "Connection already established.");
        }

        const url = "ws://" + host + endpoint.getUrl();
        console.log("Connecting to WebSocket endpoint " + url);
        connection = new WebSocket(url);

        connection.onmessage = handleMessage;
        connection.onerror = function(err){
            console.log("WebSocket encountered error: ", err.message, "Closing connection");
        };
        connection.onclose = reconnect;
        return this;
    }

    this.close = function(){
        if(!connection){
            throwException("IllegalState", "Connection is not established.");
        }
        connection.close();
    }

    this.sendEvent = function(event){
        if(!connection){
            throwException("IllegalState", "Connection is not established");
        }

        connection.send(event.assemble())
    }

    function handleMessage(event){
        reconnectionTryCount = 1;
        const payload = JSON.parse(event.data);

        const eventName = payload.eventName;
        console.log("Handling event " + eventName);
        const eventData = payload.payload;

        new Stream(handlers)
            .filter(function(handler){return handler.canHandle(eventName)})
            .peek(function(handler){handler.handle(eventData, eventName)})
            .findFirst()
            .ifNotPresent(function(){logService.logToConsole("No WebSocketHandler found for eventName " + eventName)});
    }

    function reconnect(){
        console.log("Connection lost. Reconnecting... Retry count: " + reconnectionTryCount);
        connection = null;
        setTimeout(connect, reconnectionTryCount * 1000);
        reconnectionTryCount++;
    }

    function createPingWebSocketHandler(wsConnection){
        return new WebSocketEventHandler(
            function(eventName){return eventName == "ping"},
            function(){wsConnection.sendEvent(new WebSocketEvent("ping"))}
        );
    }

    function createRedirectWebSocketHandler(){
        return new WebSocketEventHandler(
            function(eventName){return eventName == "redirect"},
            function(){window.location.href = event.eventName}
        );
    }
}

function WebSocketEventHandler(ch, h){
    this.canHandle = ch;
    this.handle = h;
}

function WebSocketEvent(e, p){
    const event = e;
    const payload = p == undefined ? null : p;

    this.assemble = function(){
        return JSON.stringify({eventName: event, payload: payload});
    }
}