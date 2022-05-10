function Optional(obj){
    const value = obj;

    this.ifPresent = function(consumer, fallBack){
        if(this.isPresent()){
            consumer(value);
        }else if(fallBack){
            fallBack();
        }
        return this;
    }

    this.ifNotPresent = function(func){
        if(!this.isPresent()){
            func();
        }
    }

    this.isPresent = function(){
        return value !== null && value !== undefined;
    }

    this.orElseGet = function(func){
        return this.isPresent() ? value : func();
    }

    this.orElseThrow = function(errorType, errorMessage){
        if(this.isPresent()){
            return value;
        }

        throwException(errorType, errorMessage);
    }
}