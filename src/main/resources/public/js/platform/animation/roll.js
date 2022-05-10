(function Roll(){
    window.roll = new function(){
        scriptLoader.loadScript("/js/platform/animation/domutil.js");
        this.rollInHorizontal = rollInHorizontal;
        this.rollOutHorizontal = rollOutHorizontal;

        this.rollInVertical = rollInVertical;
        this.rollOutVertical = rollOutVertical;
    }
    
    /*
    Adds a roll-in display effect for a given element.
    Arguments:
        - element: the element to display
        - container: the container to append the new element into.
        - time: the timeout of the roll-in effect.
    */
    function rollInHorizontal(element, container, display, time){
        time = time || 500;
        display = display || "block";

        element.style.display = display;
        const width = DOMUtil.getElementWidth(element, container);
            element.style.overflow = "hidden";
        container.appendChild(element);

        $(element).width(0);

        return new Promise(function(resolve, reject){
            $(element).animate(
                {width: width},
                time,
                function(){resolve()}
             );
        });
    }
    
    /*
    Adds a roll-out display effect for a given element.
    Arguments:
        - element: the element to display
        - time: the timeout of the roll-out effect.
    */
    function rollOutHorizontal(element, time){
        time = time || 500;

        return new Promise(function(resolve, reject){
            $(element).animate(
                {width: 0},
                time,
                function(){
                    element.style.display = "none";
                    resolve();
                }
             );
        });
    }

    function rollInVertical(element, container, display, time){
        time = time || 500;
        display = display || "block";

        element.style.display = display;
        element.style.height = "initial";
        const height = DOMUtil.getElementHeight(element, container);
            element.style.overflow = "hidden";
        container.appendChild(element);

        $(element).height(0);

        return new Promise(function(resolve, reject){
            $(element).animate(
                {height: height},
                time,
                function(){resolve()}
             );
        });
    }

    function rollOutVertical(element, time){
        time = time || 500;

        return new Promise(function(resolve, reject){
            $(element).animate(
                {height: 0},
                time,
                function(){
                    element.style.display = "none";
                    resolve();
                }
             );
        });
    }
})();