function addRightClickMove(containerId, panelId, blockWheel){
    let lastX = 0;
    let lastY = 0;
    let clicked = false;
    let clickedButton;
    const container = document.getElementById(containerId);
    const panel = document.getElementById(panelId);
        //Egérkattintások mappelése
        container.onmousedown = function(event){
            lastX = event.clientX;
            lastY = event.clientY;
            clicked = true;
            clickedButton = event.button;
        };
        container.onmouseup = function(){clicked = false;};

        //Térkép mozgatása
        container.onmousemove = function(event){
            if(clicked && clickedButton == 2){
                const diffX = lastX - event.clientX;
                const diffY = lastY - event.clientY;
                panel.scrollBy(diffX * 1.5, diffY * 2);
                lastX = event.clientX;
                lastY = event.clientY;
            }
        };

        if(blockWheel){
            container.onwheel = function(event){
                event.preventDefault();
            }
        }
}