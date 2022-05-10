pageLoader.addLoader(sessionChecker, "SessionChecker");

function sessionChecker(){
    if(window.SESSION_CHECK_DISABLED != true){
        setUpSessionChecker();
    }else{
        logService.logToConsole("SessionCheck disabled.");
    }

    if(window.SESSION_EXTENSION_ENABLED){
        logService.logToConsole("SessionExtension enabled.");
        setUpSessionExtender();
    }

    function setUpSessionChecker(){
        setInterval(checkSession, 10000);

        function checkSession(){
            const request = new Request(Mapping.getEndpoint("CHECK_SESSION"));
                request.processValidResponse = function(){};
                request.getErrorHandler()
                    .addErrorHandler(unauthorizedErrorHandler());
            dao.sendRequestAsync(request);

            function unauthorizedErrorHandler(){
                return new ErrorHandler(
                    function(request, response){return response.status == ResponseStatus.UNAUTHORIZED},
                    function(){window.location.href = Mapping.INDEX_PAGE}
                );
            }
        }
    }

    function setUpSessionExtender(){
        setInterval(sessionExtender, 60000);

        function sessionExtender(){
            const request = new Request(Mapping.getEndpoint("EXTEND_SESSION"));
                request.processValidResponse = function(){};
            dao.sendRequestAsync(request);
        }
    }
};