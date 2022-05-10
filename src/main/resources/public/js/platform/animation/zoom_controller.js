function ZoomController(id, initialZoom, step, min, max){
    let zoom = initialZoom;

    const element = document.getElementById(id);

    setZoomValue();

    this.zoomIn = function(){
        const newZoom = zoom + step;
        if(newZoom > max){
            return;
        }

        zoom = newZoom;
        setZoomValue();
    }

    this.zoomOut = function(){
        const newZoom = zoom - step;
        if(newZoom < min){
            return;
        }

        zoom = newZoom;
        setZoomValue();
    }

    function setZoomValue(){
        element.style.transform = "scale(" + zoom + ")";
    }

}