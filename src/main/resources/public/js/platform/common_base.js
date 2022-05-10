const COOKIE_LOCALE = "language";
const HEADER_BROWSER_LANGUAGE = "BrowserLanguage";

(function ScriptLoader(){
    const date = getDate();
    const loadedScripts = [];

    window.scriptLoader = new function(){
        this.loadScript = loadScript;
    }

    $(document).ready(()=>{
        eventProcessor.processEvent(new Event(events.DOM_LOADED));}
    );
    
    scriptLoader.loadScript("/js/platform/optional.js");
    scriptLoader.loadScript("/js/platform/stream.js");
    scriptLoader.loadScript("/js/platform/utils.js");
    scriptLoader.loadScript("/js/platform/log_service.js");
    scriptLoader.loadScript("/js/platform/dao/dao.js");
    scriptLoader.loadScript("/js/platform/dao/mapping.js");
    scriptLoader.loadScript("/js/platform/dao/error_handler.js");
    scriptLoader.loadScript("/js/platform/event_processor.js");
    initPageLoader();
    scriptLoader.loadScript("/js/platform/notification_service.js");

    /*
        Loads the script given as argument.
        Arguments:
            - src: The path of the requested script.
        Throws
            - IllegalArgument exception if src is null ord undefined
            - IllegalState exception if jQuery cannot be found.
    */
    function loadScript(src){
        if(src == undefined || src == null){
            throwException("IllegalArgument", "src must not be null or undefined.");
        }

        //console.log("Loading script " + src);
        if(loadedScripts.indexOf(src) > -1){
            //console.log(src + " is already loaded.");
            return;
        }
        
        if($ == undefined){
            throwException("IllegalState", "jQuery cannot be resolved.");
        }
        $.ajax({
            async: false,
            url: src + "?" + date,
            dataType: "script",
            cache: true
        });
        loadedScripts.push(src);
    }

    function getDate(){
        const date = new Date();
        return date.getFullYear() + "-" + date.getMonth() + "-" + date.getDate() + "/" + date.getHours() + ":" + date.getMinutes();
    }
})();

function initPageLoader(){
    const loaders = [];

    window.pageLoader = new function(){
        this.addLoader = function(loader, description){
            console.log("Adding loader " + description);
            if(!hasValue(description)){
                throwException("IllegalArgument", "Description must not be null or undefined.");
            }

            if(!isFunction(loader)){
                throwException("IllegalArgument", "Loader is not a function.");
            }

            loaders.push({load: loader, description: description});
        }
    }

    eventProcessor.registerProcessor(new EventProcessor(
        function(eventType){return eventType == events.DOM_LOADED},
        function(){
            let counter = 0;

            const promises = new Stream(loaders)
                .forEach(
                    function(loader){
                        new Promise((resolve, reject) => {
                            setTimeout(
                                function(){
                                    logService.logToConsole("Calling loader: " + loader.description);
                                    try{
                                        loader.load();
                                    }catch(e){
                                        reject();
                                        throw e;
                                    }
                                    resolve();
                                },
                                0
                            )
                        })
                        .then(()=>counter++, ()=>counter++);
                    }
                );

            const interval = setInterval(
                function(){
                    console.log("Number of loaders: " + loaders.length + ", completed: " + counter);
                    if(counter == loaders.length){
                        clearInterval(interval);
                        eventProcessor.processEvent(new Event(events.PAGE_LOADERS_COMPLETED));
                    }
                },
                100
            )
        },
        true,
        "Page loaders"
    ));
}