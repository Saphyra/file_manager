window.Mapping = new function(){
    this.INDEX_PAGE = "/";

    const endpoints = {
        GET_FILES: new Endpoint("/api/files", HttpMethod.POST),
        COPY: new Endpoint("/api/files/copy", HttpMethod.POST),
        MOVE: new Endpoint("/api/files/move", HttpMethod.POST),
        DELETE: new Endpoint("/api/files", HttpMethod.DELETE),
        RENAME: new Endpoint("/api/files/rename", HttpMethod.POST),
    }

    this.getEndpoint = function(endpointName, pathVariables, queryParams){
        const ep = endpoints[endpointName] || throwException("IllegalArgument", "Endpoint not found with endpointName " + endpointName);
        return new Endpoint(
            replace(ep.getUrl(), pathVariables, queryParams),
            ep.getMethod()
        )
    }

     function replace (path, pathVariables, queryParams){
        let result = path;

        if(pathVariables){
            for(let index in pathVariables){
                if(pathVariables[index] != null){
                    const key = createKey(index);
                    result = result.replace(key, pathVariables[index]);
                }
            }
        }
        if(queryParams){
            result += "?";
            const paramParts = [];
            for (let index in queryParams){
                if(queryParams[index] != null){
                    paramParts.push(index + "=" + queryParams[index]);
                }
            }
            result += paramParts.join("&");
        }

        return result;

        function createKey(index){
            return "{" + index + "}";
        }
    }
}

function Endpoint(u, m){
   const url = u;
   const method = m;

    this.getUrl = function(){
        return url;
   }

    this.getMethod = function(){
        return method;
    }
}