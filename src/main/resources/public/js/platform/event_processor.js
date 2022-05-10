window.events = {
    DOM_LOADED: "dom_loaded",
    PAGE_LOADERS_COMPLETED: "page_loaders_completed"
};

(function EventProcessor(){
    const processors = [];
    
    window.eventProcessor = new function(){
        this.registerProcessor = registerProcessor;
        this.processEvent = processEvent;
    }
    
    function registerProcessor(processor){
        if(!processor || !processor instanceof EventProcessor){
            throwException("IllegalArgument", "eventProcessor is not type of EventProcessor");
        }
        logService.logToConsole("EventProcessor registered with name " + processor.name);
        processors.push(processor);
    }
    
    function processEvent(event){
        if(!event instanceof Event){
            throwException("IllegalArgument", "event is not a type of Event.");
        }
        
        const eventType = event.getEventType();
        
        logService.logToConsole("Processing event: " + eventType);
        
        let hasProcessor = false;
        for(let pindex = processors.length - 1; pindex >= 0; pindex--){
            const processor = processors[pindex];
            if(processor.canProcess(eventType)){
                hasProcessor = true;
                logService.logToConsole("Processing event " + eventType + " for EventProcessor " + processor.name);
                setTimeout(function(){processor.process(event)}, 0);
                if(processor.isOnceRunning()){
                    logService.logToConsole("OnceRunning processor with name " + processor.name + " has run, removing from list...");
                    processors.splice(pindex, 1);
                }
            }
        }
        if(!hasProcessor){
            logService.logToConsole("No eventProcessor for eventType " + event.getEventType());
        }
    }
})();

function EventProcessor(canProcessCallback, processEventCallback, onceRunningProcessor, processorName){
    const canProcess = canProcessCallback;
    const processEvent = processEventCallback;
    const onceRunning = onceRunningProcessor == null || onceRunningProcessor == undefined ? false : onceRunningProcessor;

    this.name = processorName || throwException("IllegalArgument", "processorName must be defined.");

    this.setName = function(name){
        this.name = name;
        return this;
    }

    this.canProcess = function(eventType){
        return canProcess(eventType);
    }
    
    this.process = function(event){
        processEvent(event);
    }
    
    this.isOnceRunning = function(){
        return onceRunning;
    }
}

function Event(type, data){
    const eventType = type || throwException("IllegalArgument", "eventType must not be null.");
    const payload = data || null;
    
    this.getPayload = function(){
        return payload;
    }
    
    this.getEventType = function(){
        return eventType;
    }
}