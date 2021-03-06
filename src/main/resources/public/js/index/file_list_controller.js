scriptLoader.loadScript("/js/platform/sync_engine.js");
scriptLoader.loadScript("/js/platform/confirmation_service.js");

(function FileListController(){
    pageLoader.addLoader(loadRoot, "Loading file roots");
    pageLoader.addLoader(addEventListeners, "Adding event listeners");

    const fileTypes = {
        DIRECTORY: "DIRECTORY",
        FILE: "FILE"
    }

    const leftSyncEngine = new SyncEngineBuilder()
        .withContainerId(ids.filesListLeft)
        .withGetKeyMethod((file) => {return file.path})
        .withCreateNodeMethod(createFileNode)
        .withSortMethod(sortFiles)
        .withIdPrefix("left-file")
        .build();

    const rightSyncEngine = new SyncEngineBuilder()
        .withContainerId(ids.filesListRight)
        .withGetKeyMethod((file) => {return file.path})
        .withCreateNodeMethod(createFileNode)
        .withSortMethod(sortFiles)
        .withIdPrefix("left-file")
        .build();

    const LEFT_CONTAINER = new Container(
        ids.filesListLeftContainer,
        ids.leftParentLabel,
        ids.selectAllLeftCheckbox,
        leftSyncEngine
    );
    const RIGHT_CONTAINER = new Container(
        ids.filesListRightContainer,
        ids.rightParentLabel,
        ids.selectAllRightCheckbox,
        rightSyncEngine
    );

    let activeContainer = LEFT_CONTAINER;

    window.fileListController = new function(){
        this.leftUp = function(){
            LEFT_CONTAINER.up();
        }

        this.rightUp = function(){
            RIGHT_CONTAINER.up();
        }

        this.leftRefresh = function(){
            LEFT_CONTAINER.refresh();
        }

        this.rightRefresh = function(){
            RIGHT_CONTAINER.refresh();
        }

        this.leftCreateDirectory = function(){
            LEFT_CONTAINER.createDirectory();
        }

        this.rightCreateDirectory = function(){
            RIGHT_CONTAINER.createDirectory();
        }

        this.leftCopySelected = function(){
            LEFT_CONTAINER.copySelected();
        }

        this.rightCopySelected = function(){
            RIGHT_CONTAINER.copySelected();
        }

        this.leftMoveSelected = function(){
            LEFT_CONTAINER.moveSelected();
        }

        this.rightMoveSelected = function(){
            RIGHT_CONTAINER.moveSelected();
        }

        this.leftDeleteSelected = function(){
            LEFT_CONTAINER.deleteSelected();
        }

        this.rightDeleteSelected = function(){
            RIGHT_CONTAINER.deleteSelected();
        }
    }

    function sortFiles(a, b){
        if(a.type == b.type){
            return a.name.localeCompare(b.name);
        }

        if(a.type == fileTypes.DIRECTORY){
            return -1;
        }

        return 1;
    }

    function createFileNode(file, syncEngine){
        const container = LEFT_CONTAINER.getSyncEngine() == syncEngine ? LEFT_CONTAINER : RIGHT_CONTAINER;

        const node = document.createElement("TR");
            node.title = file.path;

            const selectCell = document.createElement("TD");
                selectCell.classList.add("centered");

                const selectInput = document.createElement("INPUT");
                    selectInput.onclick = function(event){
                        event.stopPropagation();
                        file.selected = selectInput.checked;
                    }
                    selectInput.type = "checkbox";
                    selectInput.checked = file.selected;
            selectCell.appendChild(selectInput)
        node.appendChild(selectCell);

            const nameCell = document.createElement("TD");
                nameCell.innerText = file.name;
        node.appendChild(nameCell);

            const sizeCell = document.createElement("TD");
                sizeCell.innerText = file.type == fileTypes.DIRECTORY ? "DIR" : file.size;
        node.appendChild(sizeCell);

            const dateCell = document.createElement("TD");
                dateCell.innerText = formatDate(file.lastModified / 1000);
        node.appendChild(dateCell);

            const operationsCell = document.createElement("TD");
                operationsCell.classList.add("centered");

                const copyButton = document.createElement("BUTTON");
                    copyButton.innerText = "Copy";
                    copyButton.onclick = function(event){
                        event.stopPropagation();
                        copyFile(file, getOtherContainer(container));
                    }
            operationsCell.appendChild(copyButton);

                const moveButton = document.createElement("BUTTON");
                    moveButton.innerText = "Move";
                    moveButton.onclick = function(event){
                        event.stopPropagation();
                        moveFile(file, getOtherContainer(container));
                    }
            operationsCell.appendChild(moveButton);

                const renameButton = document.createElement("BUTTON");
                    renameButton.innerText = "Rename";
                    renameButton.onclick = function(event){
                        event.stopPropagation();
                        renameFile(file, container);
                    }
            operationsCell.appendChild(renameButton);

                const deleteButton = document.createElement("BUTTON");
                    deleteButton.innerText = "Delete";
                    deleteButton.onclick = function(event){
                        event.stopPropagation();
                        deleteFile(file);
                    }
            operationsCell.appendChild(deleteButton);
        node.appendChild(operationsCell);

        node.onclick = function(){
            if(file.type == fileTypes.DIRECTORY){
                openDirectory(file.path, container);
            }
        }

        return node;
    }

    function openDirectory(path, container){
        const request = new Request(Mapping.getEndpoint("GET_FILES"), {value: path});
            request.convertResponse = jsonConverter;
            request.processValidResponse = function(response){
                const syncEngine = container.getSyncEngine();
                    syncEngine.clear();
                    syncEngine.addAll(response.files);

                container.setDirectory(path);
                container.setParent(response.parent);
                container.setSelectAllCheckboxStatus(false);
            }
        dao.sendRequestAsync(request);
    }

    function setActiveContainer(container){
        LEFT_CONTAINER.deactivate();
        RIGHT_CONTAINER.deactivate();
        activeContainer = container;
        container.activate();
    }

    function copyFile(file, container){
        const target = container.getDirectory();

        const confirmationDialogLocalization = new ConfirmationDialogLocalization()
            .withTitle("Confirm copy")
            .withDetail("Are you sure you want to copy file <SPAN class='red'>" + file.path + "</SPAN> to <SPAN class='red'> " + target +"</SPAN>?")
            .withConfirmButton("Copy")
            .withDeclineButton("Cancel");

            confirmationService.openDialog(
                "copy-file-confirmation-dialog",
                confirmationDialogLocalization,
                function(){
                    const request = new Request(Mapping.getEndpoint("COPY"), {source: file.path, target: target});
                        request.processValidResponse = function(){
                            notificationService.showSuccess("Copy started.");
                        }
                    dao.sendRequestAsync(request);
                }
            )
    }

    function moveFile(file, container){
        const target = container.getDirectory();

        const confirmationDialogLocalization = new ConfirmationDialogLocalization()
            .withTitle("Confirm move")
            .withDetail("Are you sure you want to move file <SPAN class='red'>" + file.path + "</SPAN> to <SPAN class='red'> " + target +"</SPAN>?")
            .withConfirmButton("Move")
            .withDeclineButton("Cancel");

            confirmationService.openDialog(
                "move-file-confirmation-dialog",
                confirmationDialogLocalization,
                function(){
                    const request = new Request(Mapping.getEndpoint("MOVE"), {source: file.path, target: target});
                        request.processValidResponse = function(){
                            notificationService.showSuccess("Move started.");
                        }
                    dao.sendRequestAsync(request);
                }
            )
    }

    function deleteFile(file){
         const confirmationDialogLocalization = new ConfirmationDialogLocalization()
            .withTitle("Confirm deletion")
            .withDetail("Are you sure you want to delete file <SPAN class='red'>" + file.path + "</SPAN>?")
            .withConfirmButton("Delete")
            .withDeclineButton("Cancel");

            confirmationService.openDialog(
                "delete-file-confirmation-dialog",
                confirmationDialogLocalization,
                function(){
                    const request = new Request(Mapping.getEndpoint("DELETE"), {value: file.path});
                        request.processValidResponse = function(){
                            notificationService.showSuccess("Deletion started");
                        }
                    dao.sendRequestAsync(request);
                }
            )
    }

    function renameFile(file, container){
        const containerId = "rename-file-confirmation-dialog";

        const newNameInput = document.createElement("INPUT");
            newNameInput.type = "text";
            newNameInput.placeholder = "New file name"
            newNameInput.value = file.name;
            newNameInput.style.width = "90%";

        const confirmationDialogLocalization = new ConfirmationDialogLocalization()
            .withTitle("Rename")
            .withDetail(newNameInput)
            .withConfirmButton("Rename")
            .withDeclineButton("Cancel");

            confirmationService.openDialog(
                containerId,
                confirmationDialogLocalization,
                function(){
                    const newName = newNameInput.value;
                    if(newNameInput.length == 0){
                        notificationService.showError("Enter the new file name.");
                        return;
                    }

                    const request = new Request(Mapping.getEndpoint("RENAME"), {file: file.path, newName: newNameInput.value});
                        request.convertResponse = jsonConverter;
                        request.processValidResponse = function(newFile){
                            notificationService.showSuccess("File renamed.");
                            confirmationService.closeDialog(containerId);
                            const syncEngine = container.getSyncEngine();
                                syncEngine.removeObj(file);
                                syncEngine.add(newFile);
                        }
                    dao.sendRequestAsync(request);
                },
                ()=>{confirmationService.closeDialog(containerId)},
                new ConfirmationDialogOptions().withCloseAfterChoice(false)
            )
    }

    function loadRoot(){
        const request = new Request(Mapping.getEndpoint("GET_FILES"));
            request.convertResponse = jsonConverter;
            request.processValidResponse = function(response){
                leftSyncEngine.addAll(response.files);
                rightSyncEngine.addAll(response.files);

                LEFT_CONTAINER.setDirectory(null);
                RIGHT_CONTAINER.setDirectory(null);
            }
        dao.sendRequestAsync(request);
    }

    function addEventListeners(){
        document.getElementById(ids.filesListLeftContainer).onmousedown = function(){
            setActiveContainer(LEFT_CONTAINER);
        }
        document.getElementById(ids.filesListRightContainer).onmousedown = function(){
            setActiveContainer(RIGHT_CONTAINER);
        }

        setActiveContainer(LEFT_CONTAINER);

        const leftSelectAllCheckbox = document.getElementById(ids.selectAllLeftCheckbox)
            leftSelectAllCheckbox.onchange = function(){
                new MapStream(leftSyncEngine.values())
                    .toListStream()
                    .forEach((file)=>{file.selected = leftSelectAllCheckbox.checked});
                leftSyncEngine.reload();
            }

        const rightSelectAllCheckbox = document.getElementById(ids.selectAllRightCheckbox)
            rightSelectAllCheckbox.onchange = function(){
                new MapStream(rightSyncEngine.values())
                    .toListStream()
                    .forEach((file)=>{file.selected = rightSelectAllCheckbox.checked});
                rightSyncEngine.reload();
            }
    }

    function getOtherContainer(container){
        return LEFT_CONTAINER == container ? RIGHT_CONTAINER : LEFT_CONTAINER;
    }

    function Container(id, parentId, checkboxId, syncEngine){
        let directory = null;
        let parent = null;

        this.setSelectAllCheckboxStatus = function(checked){
            document.getElementById(checkboxId).checked = checked;
        }

        this.refresh = function(){
            openDirectory(directory, this);
        }

        this.up = function(){
            openDirectory(parent, this);
        }

        this.setParent = function(path){
            parent = path;
        }

        this.getDirectory = function(){
            return directory;
        }

        this.setDirectory = function(path){
            directory = path;
            document.getElementById(parentId).innerText = path == null ? "Root" : path;
        }

        this.getSyncEngine = function(){
            return syncEngine;
        }

        this.activate = function(){
            document.getElementById(id).classList.add("active-container");
        }

        this.deactivate = function(){
            document.getElementById(id).classList.remove("active-container");
        }

        this.createDirectory = function(){
            const containerId = "create-directory-confirmation-dialog";

            const directoryNameInput = document.createElement("INPUT");
                directoryNameInput.type = "text";
                directoryNameInput.placeholder = "Directory name"
                directoryNameInput.style.width = "90%";

            const confirmationDialogLocalization = new ConfirmationDialogLocalization()
                .withTitle("Create directory")
                .withDetail(directoryNameInput)
                .withConfirmButton("Create")
                .withDeclineButton("Cancel");

                confirmationService.openDialog(
                    containerId,
                    confirmationDialogLocalization,
                    function(){
                        const directoryName = directoryNameInput.value;
                        if(directoryName.length == 0){
                            notificationService.showError("Enter directory name.");
                            return;
                        }

                        const request = new Request(Mapping.getEndpoint("CREATE_DIRECTORY"), {parent: directory, name: directoryName}, null, );
                            request.convertResponse = jsonConverter;
                            request.processValidResponse = function(directory){
                                notificationService.showSuccess("Directory created");
                                confirmationService.closeDialog(containerId);
                                syncEngine.add(directory);
                            }
                        dao.sendRequestAsync(request);
                    },
                    ()=>{confirmationService.closeDialog(containerId)},
                    new ConfirmationDialogOptions().withCloseAfterChoice(false)
                )
        }

        this.copySelected = function(){
            const target = getOtherContainer(this)
                .getDirectory();

            const selectedFiles = getSelectedFiles();

            const files = selectedFiles.map(file => {return {source: file.path, target: target}})
                .toList();

            const confirmationDialogLocalization = new ConfirmationDialogLocalization()
                .withTitle("Confirm copy")
                .withDetail("Are you sure you want to copy files <SPAN class='red'>" + selectedFiles.map(file => {return file.name}).join(", ") + "</SPAN> to <SPAN class='red'> " + target + "</SPAN>?")
                .withConfirmButton("Copy")
                .withDeclineButton("Cancel");

                confirmationService.openDialog(
                    "copy-file-confirmation-dialog",
                    confirmationDialogLocalization,
                    function(){
                        const request = new Request(Mapping.getEndpoint("COPY_ALL"), files);
                            request.processValidResponse = function(){
                                notificationService.showSuccess("Copy started.");
                            }
                        dao.sendRequestAsync(request);
                    }
                )
        }

        this.moveSelected = function(){
            const target = getOtherContainer(this)
                .getDirectory();

            const selectedFiles = getSelectedFiles();

            const files = selectedFiles.map(file => {return {source: file.path, target: target}})
                .toList();

            const confirmationDialogLocalization = new ConfirmationDialogLocalization()
                .withTitle("Confirm move")
                .withDetail("Are you sure you want to move files <SPAN class='red'>" + selectedFiles.map(file => {return file.name}).join(", ") + "</SPAN> to <SPAN class='red'> " + target +"</SPAN>?")
                .withConfirmButton("Move")
                .withDeclineButton("Cancel");

                confirmationService.openDialog(
                    "move-file-confirmation-dialog",
                    confirmationDialogLocalization,
                    function(){
                        const request = new Request(Mapping.getEndpoint("MOVE_ALL"), files);
                            request.processValidResponse = function(){
                                notificationService.showSuccess("Move started.");
                            }
                        dao.sendRequestAsync(request);
                    }
                )
        }

        this.deleteSelected = function(){
            const selectedFiles = getSelectedFiles();

            const files = selectedFiles.map(file => {return file.path})
                .toList();

            const confirmationDialogLocalization = new ConfirmationDialogLocalization()
                .withTitle("Confirm deletion")
                .withDetail("Are you sure you want to delete file <SPAN class='red'>" + selectedFiles.map(file => {return file.name}).join(", ") + "</SPAN>?")
                .withConfirmButton("Delete")
                .withDeclineButton("Cancel");

                confirmationService.openDialog(
                    "delete-file-confirmation-dialog",
                    confirmationDialogLocalization,
                    function(){
                        const request = new Request(Mapping.getEndpoint("DELETE_ALL"), files);
                            request.processValidResponse = function(){
                                notificationService.showSuccess("Deletion started");
                            }
                        dao.sendRequestAsync(request);
                    }
                )
        }

        function getSelectedFiles(){
            return new MapStream(syncEngine.values())
                .toListStream()
                .filter(file => {return file.selected});
        }
    }
})();