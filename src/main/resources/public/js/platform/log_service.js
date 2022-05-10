(function LogService(){
    const isConsoleEnabled = true;
    
    window.logService = new function(){
        
        this.log = log;
        this.debug = function(message, prefix){log(message, "debug", prefix)};
        this.info = function(message, prefix){log(message, "info", prefix)};
        this.warn = function(message, prefix){log(message, "warn", prefix)};
        this.error = function(message, prefix){log(message, "error", prefix)};
        this.logToConsole = logToConsole;
    }

    window.log = window.logService;

    function logToConsole(message, o){
        if(isConsoleEnabled){
            if(o == undefined){
                console.log(message);
            }else{
                console.log(message, o);
            }
        }
    }
    
    /*
        error: Hibák a kódban (amit a catch elkap)
        warn: Figyelmeztetések (érvénytelen változóérték)
        info: Üzenetek
        debug: Részletes információk a futás állapotáról
    */
    function log(message, level, prefix){
        level = level ? level.toLowerCase() : "info";
        prefix = prefix || "";

        if(!shouldLog(level)){
            return;
        }

        const container = getContainer();
        container.insertBefore(createMessage(message, level, prefix), container.childNodes[0]);
        /*
            Determinates if the message with the given level should be displayed or not.
        */
        function shouldLog(level){
            switch(level){
                case "debug":
                    return true;
                break;
                case "info":
                    return true;
                break;
                case "warn":
                    return true;
                break;
                case "error":
                    return true;
                break;
                default:
                    return true;
                break;
            }
        }
        /*
            Retrieves the container for logs, or creates one if not exists.
        */
        function getContainer(){
            let mainContainer = document.getElementById("logcontainermain");
            mainContainer = mainContainer || createContainer();

            return document.getElementById("logcontainermessages");
            /*
                Creates the window for displaying the log messages
            */
            function createContainer(){
                const mainContainer = document.createElement("DIV");
                    mainContainer.style.position = "absolute";
                    mainContainer.style.top = "0";
                    mainContainer.style.right = "0";
                    mainContainer.style.bottom = "0";
                    mainContainer.style.left = "0";
                    mainContainer.style.overflow = "auto";
                    mainContainer.style.border = "5px ridge white";
                    mainContainer.style.background = "black";
                    mainContainer.style.zIndex = 100;

                    mainContainer.id = "logcontainermain";

                    const title = document.createElement("H1");
                        title.innerHTML = "Log";
                        title.style.position = "relative";
                        title.style.borderBottom = "5px ridge white";
                        title.style.textAlign = "center";

                        const closeButton = document.createElement("BUTTON");
                            closeButton.innerHTML = "X";
                            closeButton.style.position = "absolute";
                            closeButton.style.fontSize = "1rem";
                            closeButton.style.right = "2px";
                            closeButton.style.top = "2px";
                            closeButton.onclick = function(){
                                document.body.removeChild(mainContainer);
                            }
                    title.appendChild(closeButton);
                mainContainer.appendChild(title);

                    const messageContainer = document.createElement("DIV");
                        messageContainer.id = "logcontainermessages";
                        messageContainer.style.padding = "0.25rem";
                mainContainer.appendChild(messageContainer);

                document.body.appendChild(mainContainer);
            }
        }
        /*
            Creates the log message.
        */
        function createMessage(message, level, prefix){
            const color = getColor(level);

            const messageContainer = document.createElement("DIV");
                messageContainer.style.margin = "0.5rem";
                messageContainer.style.color = color;

                const levelNode = document.createElement("DIV");
                    levelNode.style.fontWeight = "bold";
                    levelNode.style.display = "inline-block";
                    levelNode.style.width = "10rem";
                    levelNode.innerHTML = level.toUpperCase();
            messageContainer.appendChild(levelNode);

            if(prefix && prefix.length){
                messageContainer.appendChild(createTextNode(prefix + " - "));
            }

            if(message == null){
                messageContainer.appendChild(createTextNode("null"));
            }else if(message == undefined){
                messageContainer.appendChild(createTextNode("undefined"));
            }else if(typeof message == "object"){
                messageContainer.appendChild(parseObject(message));
            }else{
                messageContainer.appendChild(createTextNode(message));
            }

            return messageContainer;

            function getColor(level){
                let color;
                switch(level){
                    case "info":
                        color = "white";
                    break;
                    case "debug":
                        color = "green";
                    break;
                    case "warn":
                        color = "yellow";
                    break;
                    case "error":
                        color = "red";
                    break;
                    default:
                        return "orange";
                    break;
                }
                return color;
            }
            
            function createTextNode(message){
                const element = document.createElement("SPAN");
                    element.innerText = message;
                return element;
            }
            
            function parseObject(obj){
                const element = document.createElement("OL");
                const keys = Object.keys(obj);

                if(keys.length  == 0){
                    return document.createTextNode("(Empty object/array)");
                }

                for(let kindex in keys){
                    const key = keys[kindex]
                    const elem = obj[key];
                    const line = document.createElement("LI");
                        if(elem == null){
                            line.appendChild(createTextNode("null"));
                        }else if(elem == undefined){
                            line.appendChild(createTextNode("undefined"));
                        }else if(typeof elem == "object"){
                            line.appendChild(document.createTextNode(key + ": "));
                            line.appendChild(parseObject(elem));
                        }else{
                            line.innerText = key + ": " + elem;
                        }
                    element.appendChild(line);
                }

                return element;
            }
        }
    }
})();