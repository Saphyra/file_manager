(function Spinner(){
    const SPINNER_ID = "spinner";
    let maxCounter = 0;
    let counter = 0;

    window.spinner = new function(){
        this.open = function(c){
           maxCounter = c == undefined || c == null ? 1 : c;
           counter = 0;
           $(getOrCreateSpinner()).show();
        };
        this.increment = function(a){
            counter += a == undefined || a == null ? 1 : a;
            if(counter >= maxCounter){
                this.close();
            }
        }
        this.close = function(){
            getSpinner().ifPresent(function(spinner){$(spinner).hide()});
        };
    }

    function getOrCreateSpinner(){
        return getSpinner()
            .orElseGet(createSpinner);

        function createSpinner(){
            const spinner = document.createElement("div");
                spinner.id = SPINNER_ID;
                spinner.classList.add("spinner");
            document.body.appendChild(spinner);
            return spinner;
        }
    }

    function getSpinner(){
        return new Optional(document.getElementById(SPINNER_ID));
    }
})();