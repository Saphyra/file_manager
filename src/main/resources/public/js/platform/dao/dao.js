(function DAO(){
    scriptLoader.loadScript("/js/platform/dao/request.js");
    scriptLoader.loadScript("/js/platform/dao/response.js");

    window.dao = new function(){
        this.sendRequest = sendRequest;
        this.sendRequestAsync = sendRequestAsync;
    }
    
    /*
    Sends HttpRequest based on the specified arguments
    Arguments:
        - method: The method of the request.
        - path: The target of the request.
        - content: The body of the request.
    Returns:
        - A promise with the result of the query
    Throws:
        - IllegalArgument exception, if method is not a string.
        - IllegalArgument exception, if method is unsupported.
        - IllegalArgument exception, if path is not a string.
    */
    function sendRequestAsync(request){
        if(request == null || request == undefined){
            throwException("IllegalArgument", "request must not be null or undefined.");
        }
        request.validate();
        
        const xhr = new XMLHttpRequest();
            xhr.open(request.method, request.path, 1);
            prepareRequest(xhr, request.method);
        
            xhr.onload = function(){
                const response = new Response(xhr);
                request.processResponse(response);
            };
            xhr.onerror = function(){
                request.processResponse(new Response(xhr));
            };

            xhr.send(request.body);
    }
    
    function sendRequest(request){
        request.validate();

        const xhr = new XMLHttpRequest();

            xhr.open(request.method, request.path, 0);
            prepareRequest(xhr, request.method);

            try{
                xhr.send(request.body);
            }catch(e){
                request.processErrorResponse(new Response(xhr));
                throw e;
            }

            const response = new Response(xhr);
            request.processResponse(response);
    }
    
    function validation(method, path){
        if(!method || typeof method !== "string"){
            throwException("IllegalArgument", "method must be a string.");
        }
        method = method.toUpperCase();
        if(HttpMethod.allowedMethods.indexOf(method) == -1){
            throwException("IllegalArgument", "Unsupported method: " + method);
        }
        if(!path || typeof path !== "string"){
            throwException("IllegalArgument", "path must be a string.");
        }
    }
    
    function prepareRequest(request, method){
        if(method !== HttpMethod.GET){
            request.setRequestHeader("Content-Type", "application/json");
        }
        
        request.setRequestHeader("Request-Type", "rest");
        request.setRequestHeader("Cache-Control", "no-cache");
        request.setRequestHeader(HEADER_BROWSER_LANGUAGE, getBrowserLanguage());
    }
})();