function Request(endpoint, body){
    this.method = endpoint.getMethod();
    this.path = endpoint.getUrl();
    this.body = processBody(body);
    const errorHandler = new ErrorHandlerRegistry();
    this.state = {};
    
    function processBody(body){
        if(!hasValue(body)){
            return "";
        }
        if(typeof body == "object"){
            return JSON.stringify(body);
        }
        return body;
    }

    this.getErrorHandler = function(){
        return errorHandler;
    }

    this.processResponse = function(response){
        if(this.isResponseOk(response)){
            this.processValidResponse(this.convertResponse(response), this.state);
        }else{
            this.processInvalidResponse(response);
        }
    }
    
    this.isResponseOk = function(response){
        return response.status === ResponseStatus.OK;
    }
    
    this.convertResponse = function(response){
        return response;
    }
    
    this.processValidResponse = function(payload, state){
        console.log("Using no overridden processValidResponse");
    }

    this.processInvalidResponse = function(response){
        errorHandler.handleError(this, response);
    }
    
    this.validate = function(){
        if(!this.method || typeof this.method !== "string"){
            throwException("IllegalArgument", "method must be a string.");
        }
        this.method = this.method.toUpperCase();
        if(HttpMethod.allowedMethods.indexOf(this.method) == -1){
            throwException("IllegalArgument", "Unsupported method: " + this.method);
        }
        if(!this.path || typeof this.path !== "string"){
            throwException("IllegalArgument", "path must be a string. It was " + this.path);
        }
    }
}

window.HttpMethod = new function(){
    this.GET = "GET";
    this.POST = "POST";
    this.PUT = "PUT";
    this.DELETE = "DELETE";

    this.allowedMethods = [this.GET, this.POST, this.PUT, this.DELETE];
}