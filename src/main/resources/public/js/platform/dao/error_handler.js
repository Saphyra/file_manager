function ErrorHandlerRegistry(){
    const handlers = [];

    const defaultErrorHandler = new ErrorHandler(
        function(){return true},
        function(request, response){
            if(isErrorResponse(response.body)){
                logService.logToConsole("Handling errorResponse: " + response.toString());
                const errorResponse = JSON.parse(response.body);

                switch(errorResponse.errorCode){
                    case "SESSION_EXPIRED":
                        sessionStorage.errorMessage = "session-expired";
                        eventProcessor.processEvent(new Event(events.LOGOUT));
                    break;
                    default:
                        notificationService.showError(errorResponse.localizedMessage);
                }
            }else{
                notificationService.showError("Error response from BackEnd: " + response.toString());
            }

            if(typeof spinner !== "undefined"){
                spinner.close();
            }

            function isErrorResponse(responseBody){
                try{
                    if(responseBody.length == 0){
                        logService.logToConsole("Empty response body");
                        return false;
                    }

                    const errorResponse = JSON.parse(responseBody);
                    console.log("ErrorResponse", errorResponse);

                    return errorResponse.errorCode !== undefined
                        && errorResponse.localizedMessage !== undefined
                        && errorResponse.params !== undefined;
                }catch(e){
                    console.log(e);
                    return false;
                }
            }
        }
    );

    this.addErrorHandler = function(errorHandler){
        if(!errorHandler){
            throwException("IllegalArgument", "errorHandler is null.");
        }

        if(!errorHandler instanceof ErrorHandler){
            throwException("IllegalArgument", "errorHandler is not a type of ErrorHandler");
        }

        handlers.push(errorHandler);

        return this;
    }

    this.handleError = function(request, response){
        console.log("Processing error...");
        if(!response){
            throwException("IllegalArgument", "response is null.");
        }

        if(!response instanceof Response){
            throwException("IllegalArgument", "response is not a type of Response");
        }

        let foundProcessor = false;
        for(let hIndex in handlers){
            const handler = handlers[hIndex];
            if(handler.canHandle(request, response)){
                console.log("ErrorHandler found");
                setTimeout(function(){handler.handle(request, response), 0});
                foundProcessor = true;
            }
        }

        if(!foundProcessor){
            console.log("No errorHandler found, using default one...");
            defaultErrorHandler.handle(request, response);
        }
    }
};

function ErrorHandler(canHandle, handle){
    this.canHandle = canHandle;
    this.handle = handle;
}