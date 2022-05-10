(function ConfirmationService(){
    window.confirmationService = new function(){
        this.openDialog = function(id, localization, confirmCallback, declineCallback, options){
            options = options || new ConfirmationDialogOptions();
            declineCallback = declineCallback || function(){};

            if(document.getElementById(id) != undefined){
                throwException("IllegalState", "Element already exists with id " + id);
            }

            const container = createContainer(id, localization, confirmCallback, declineCallback, options);

            document.body.appendChild(container);
        }

        this.closeDialog = function(id){
            const dialog = document.getElementById(id);
            if(dialog == undefined){
                throwException("IllegalState", "No element found with id " + id);
            }

            document.body.removeChild(dialog);
        }
    }

    function createContainer(id, localization, confirmCallback, declineCallback, options){
        const container = document.createElement("main");
            container.id = id;
            container.classList.add("confirmation-dialog");
            container.classList.add("main-page");

            const wrapper = document.createElement("DIV");
                wrapper.classList.add("confirmation-dialog-content-wrapper");
                const title = document.createElement("h2");
                    title.classList.add("confirmation-dialog-title");
                    title.innerHTML = localization.getTitle();
            wrapper.appendChild(title);

                const detailContainer = document.createElement("div");
                    detailContainer.classList.add("confirmation-dialog-detail-container");
                    if(localization.getDetail() instanceof Element){
                        detailContainer.appendChild(localization.getDetail());
                    }else{
                        const detailNode = document.createElement("SPAN");
                            detailNode.innerHTML = localization.getDetail();
                        detailContainer.appendChild(detailNode);
                    }
            wrapper.appendChild(detailContainer);

                const buttonContainer = document.createElement("div");
                    buttonContainer.classList.add("confirmation-dialog-button-container");

                    const confirmButton = document.createElement("button");
                        confirmButton.classList.add("confirmation-dialog-confirm-button");
                        confirmButton.innerHTML = localization.getConfirmButton();
                        confirmButton.onclick = options.getCloseAfterChoice() ?
                            function(){
                                confirmationService.closeDialog(id);
                                confirmCallback();
                            }
                        :   confirmCallback;
                buttonContainer.appendChild(confirmButton);

                    const declineButton = document.createElement("button");
                        declineButton.classList.add("confirmation-dialog-decline-button");
                        declineButton.innerHTML = localization.getDeclineButton();
                        declineButton.onclick = options.getCloseAfterChoice() ?
                            function(){
                                confirmationService.closeDialog(id);
                                declineCallback();
                            }
                        :   declineCallback;
                buttonContainer.appendChild(declineButton);
            wrapper.appendChild(buttonContainer);
        container.appendChild(wrapper);
        return container;
    }
})();

function ConfirmationDialogLocalization(){
    let title = "";
    let detail = "";
    let confirmButton = "";
    let declineButton = "";

    this.getTitle = function(){
        return title;
    }

    this.getDetail = function(){
        return detail;
    }

    this.getConfirmButton = function(){
        return confirmButton;
    }

    this.getDeclineButton = function(){
        return declineButton;
    }

    this.withTitle = function(t){
        title = t;
        return this;
    }

    this.withDetail = function(t){
        detail = t;
        return this;
    }

    this.withConfirmButton = function(t){
        confirmButton = t;
        return this;
    }

    this.withDeclineButton = function(t){
        declineButton = t;
        return this;
    }
}

function ConfirmationDialogOptions(){
    let closeAfterChoice = true;

    this.getCloseAfterChoice = function(){
        return closeAfterChoice;
    }

    this.withCloseAfterChoice = function(value){
        closeAfterChoice = value;
        return this;
    }
}