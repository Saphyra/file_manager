scriptLoader.loadScript("/js/platform/sync_engine.js");

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
        const node = document.createElement("TR");
            node.title = file.path;

            const selectCell = document.createElement("TD");
                selectCell.classList.add("centered")
                const selectInput = document.createElement("INPUT");
                    selectInput.onclick = function(event){
                        event.stopPropagation();
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
                const copyButton = document.createElement("BUTTON");
                    copyButton.innerText = "Copy";
                    copyButton.onclick = function(event){
                        event.stopPropagation();
                        copy(file, syncEngine);
                    }
            operationsCell.appendChild(copyButton)
        node.appendChild(operationsCell);

        node.onclick = function(){
            if(file.type == fileTypes.DIRECTORY){
                const container = LEFT_CONTAINER.getSyncEngine() == syncEngine ? LEFT_CONTAINER : RIGHT_CONTAINER;
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

    function copy(file, syncEngine){
        const target = (LEFT_CONTAINER.getSyncEngine() == syncEngine ? RIGHT_CONTAINER : LEFT_CONTAINER).getDirectory();
        const request = new Request(Mapping.getEndpoint("COPY"), {source: file.path, target: target});
            request.processValidResponse = function(){
                notificationService.showSuccess("Copy started.");
            }
        dao.sendRequestAsync(request);
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
        document.getElementById(ids.filesListLeftContainer).onclick = function(){
            setActiveContainer(LEFT_CONTAINER);
        }
        document.getElementById(ids.filesListRightContainer).onclick = function(){
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
    }
})();