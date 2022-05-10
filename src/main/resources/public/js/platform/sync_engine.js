function SyncEngine(cId, keyMethod, cnMethod, unMethod, sMethod, initialValues, idPref, aUpdate, fMethod){
    logService.logToConsole("Creating new SyncEngine with containerId: " + cId + "and idPrefix: " + idPref);

    let nodeCache = {};
    let cache = initialValues ? setInitialValues(initialValues) : {};
    const containerId = cId || throwException("IllegalArgument", "containerId is not defined");
    const idPrefix = idPref || "";
    const allowUpdate = aUpdate || false;
    const getKeyMethod = keyMethod || throwException("IllegalArgument", "getKeyMethod is not defined");
    const createNodeMethod = cnMethod || throwException("IllegalArgument", "createNodeMethod is not defined");
    const updateNodeMethod = unMethod || null;
    const sortMethod = sMethod || function(a, b){return 0;};
    const filterMethod = fMethod || throwException("IllegalArgument", "filterMethod is not defined")
    let order = getOrder();

    const self = this;

    if(Object.keys(cache).length > 0){
        render();
    }

    this.values = function(){
        return cache;
    }

    this.render = render;

    this.addAll = function(items){
        const addFunction = this.add;

        new Stream(items)
            .forEach(function(item){addFunction(item, true)});

        render();
    }

    this.add = function(item, skipRender){
        const key = getKeyMethod(item);
        cache[key] = item;

        if(key in cache && allowUpdate){
            updateNodeMethod(nodeCache[key], item);

            const newOrder = getOrder();
            if(!arraysEqual(order, newOrder)){
                order = newOrder;
                if(!skipRender){
                    render();
                }
            }
        }else{
            nodeCache[key] = createNode(item);
            order = getOrder();
            if(!skipRender){
                render();
            }
        }
    }

    this.clear = function(){
        cache = {};
        nodeCache = {};
        order = [];
        render();
    }

    this.get = function(key){
        return cache[key];
    }

    this.remove = function(key){
        document.getElementById(containerId).removeChild(document.getElementById(createId(key)));

        delete cache[key];
        delete nodeCache[key];
    }

    this.reload = function(){
        nodeCache = {};
        order = getOrder();

        new MapStream(cache)
            .forEach(function(key, item){
                nodeCache[key] = createNode(item);
            });
        render(order);
    }

    this.resort = function(){
        order = getOrder();
        render();
    }

    this.size = function(){
        return Object.keys(cache).length;
    }

    function render(order){
        order = order || getOrder();
        const container = document.getElementById(containerId);
            container.innerHTML = "";

            new Stream(order)
                .filter((key) => {return filterMethod(cache[key])})
                .map((key) => {return nodeCache[key]})
                .forEach(node => {container.appendChild(node)});
    }

    function getOrder(){
        return new Stream(Object.keys(cache))
            .sorted(function(a, b){return sortMethod(cache[a], cache[b])})
            .toList()
    }

    function setInitialValues(initialValues){
        return new MapStream(initialValues)
            .peek((key, item) => {nodeCache[key] = createNode(item)})
            .toMap();
    }

    function createNode(item){
        const node = createNodeMethod(item, self);
            node.id = createId(getKeyMethod(item));
        return node;
    }

    function createId(id){
        if(idPrefix.length > 0){
            return idPrefix + "-" + id;
        }
        return id;
    }
}

function SyncEngineBuilder(){
    this.containerId = null;
    this.initialValues = {};
    this.allowUpdate = false;
    this.getKeyMethod = null;
    this.createNodeMethod = null;
    this.updateNodeMethod = null;
    this.sortMethod = null;
    this.idPrefix = "";
    this.filterMethod = function(a, b){
        return true;
    }

    this.withContainerId = function(cId){
        this.containerId = cId;
        return this;
    }

    this.withInitialValues = function(init){
        this.initialValues = initialValues;
        return this;
    }

    this.withAllowUpdate = function(value){
        allowUpdate = value;
        return this;
    }

    this.withGetKeyMethod = function(method){
        this.getKeyMethod = method;
        return this;
    }

    this.withCreateNodeMethod = function(method){
        this.createNodeMethod = method;
        return this;
    }

    this.withUpdateNodeMethod = function(method){
        this.updateNodeMethod = method;
        return this;
    }

    this.withSortMethod = function(method){
        this.sortMethod = method;
        return this;
    }

    this.withIdPrefix = function(prefix){
        this.idPrefix = prefix;
        return this;
    }

    this.withFilterMethod = function(method){
        this.filterMethod = method;
        return this;
    }

    this.build = function(){
        return new  SyncEngine(
            this.containerId,
            this.getKeyMethod,
            this.createNodeMethod,
            this.updateNodeMethod,
            this.sortMethod,
            this.initialValues,
            this.idPrefix,
            this.allowUpdate,
            this.filterMethod
        );
    }
}