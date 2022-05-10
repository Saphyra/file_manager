function Cache(loadItem){
    if(typeof loadItem !== "function"){
        throwException("loadItem must be a function.");
    }
    
    const storage = {};
    const itemLoader = loadItem;
    
    this.add = function(key, data){
        if(key == null || key == undefined){
            throwException("IllegalArgument", "key must not be null or undefined");
        }
        if(data == undefined){
            throwException("IllegalArgument", "data must not be undefined.");
        }
        storage[key] = data;
    }
    
    this.addAll = function(datas){
        if(datas == null || datas == undefined){
            throwException("IllegalArgument", "datas must not be null or undefined");
        }
        
        for(let dindex in datas){
            this.add(dindex, datas[dindex]);
        }
    }
    
    this.get = function(key){
        if(key == null || key == undefined){
            throwException("IllegalArgument", "key must not be null or undefined");
        }
        
        if(storage[key] == undefined){
            storage[key] = itemLoader(key);
        }
        
        return storage[key];
    }
}