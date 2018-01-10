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
    const getAgents   = () => request('GET','/cluster/agents',{});

    /** Get a list of all nodes. */
    const getNodes    = () => request('GET','/cluster/nodes',{});

    /**
     * If a node is provided, returns the status of that node.
     * Otherwise returns the status of the node where the API is running.
     * @param {*} node Optional
     */
    const getStatus   = node => {
        if(node){
            return request('GET','/cluster/status/' + node,{});
        }
        return request('GET','/cluster/status',{});
    }

    /**
     * If a node is provided, returns the configuration of that node.
     * Otherwise returns the configuration of the node where the API is running.
     * @param {*} node Optional
     */
    const getConfig   = node => {
        if(node){
            return request('GET','/cluster/config/' + node,{});
        }
        return request('GET','/cluster/config',{});
    }

    return {
        getNodeInfo, getAgents, getNodes, getStatus, getConfig
    };
});
