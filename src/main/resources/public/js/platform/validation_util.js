function createSuccessProcess(id){
    return function(){
        if(!id.startsWith("#")){
            id = "#" + id;
        }
        logService.logToConsole("Running successProcess for id " + id);
        $(id).fadeOut();
    }
}

function createErrorProcess(id, code){
    return function errorProcess(){
        if(!id.startsWith("#")){
            id = "#" + id;
        }

        logService.logToConsole("Running errorProcess for id " + id + " and code " + code);
        $(id).prop("title", Localization.getAdditionalContent(code))
            .fadeIn();
    }
}