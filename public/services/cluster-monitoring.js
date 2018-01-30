require('ui/modules')
.get('app/wazuh', [])
.service('clusterMonitoring', function (apiReq,Notifier) {
    const notifier = new Notifier({location: 'Cluster Monitoring'});

    /**
     * Call wrapper to our api request service.
     * @param {*} method The method to use, example: GET
     * @param {*} url The destination path, example: /cluster/agents
     * @param {*} params Optional params, they must be accepted by the API.
     */
    const request = async (method,url,params) => {
        try{
            const data = await apiReq.request(method,url,params || {});
            return data;
        } catch (error){
            throw error;
        }
    };

    /** Returns the information about the node where the API is running. */
    const getNodeInfo = () => request('GET','/cluster/node',{});

    /** Get the agents of each node. */
    const getAgents   = () => request('GET','/cluster/agents',{limit:0});

    /** Get a list of all nodes. */
    const getNodes    = () => request('GET','/cluster/nodes',{});


    const getTotalFileCount = node => request('GET',`/cluster/files/${node}`,{count:1});
    const getSynchronizedFileCount = node => request('GET',`/cluster/files/${node}`,{status:'synchronized',count:1});

    /**
     * If a node is provided, returns the status of that node.
     * Otherwise returns the status of the node where the API is running.
     * @param {*} node 
     */
    const getStatus = node => request('GET','/cluster/status',{node_id: node});
    

    /**
     * If a node is provided, returns the configuration of that node.
     * Otherwise returns the configuration of the node where the API is running.
     * @param {*} node 
     */
    const getConfig = node => request('GET','/cluster/config',{node_id: node});
    

    return {
        getNodeInfo, 
        getAgents, 
        getNodes, 
        getStatus, 
        getConfig, 
        getTotalFileCount , 
        getSynchronizedFileCount
    };
});
