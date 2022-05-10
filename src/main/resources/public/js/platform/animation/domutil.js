(function DOMUtil(){
    window.DOMUtil = new function(){
        this.getElementWidth = getElementWidth;
        this.getElementHeight = getElementHeight;
    }
    
    /*
        Returns the absolute width of the element in pixels.
        Parameters:
            - element:
                - The DOM element to calculate the width of.
            - parent:
                - the parent object, to calculate with.
                - Optional. Default: body.
    */
    function getElementWidth(element, parent){
        parent = parent || document.body;

        const testElement = element.cloneNode(true);
            testElement.style.visibility = "hidden";
            testElement.style.position = "absolute";
        parent.appendChild(testElement);

        const width = testElement.offsetWidth;
        parent.removeChild(testElement);
        return width;
    }

    function getElementHeight(element, parent){
        parent = parent || document.body;

        const testElement = element.cloneNode(true);
            testElement.style.visibility = "hidden";
            testElement.style.position = "absolute";
        parent.appendChild(testElement);

        const height = testElement.offsetHeight;
        parent.removeChild(testElement);
        return height;
    }
})();