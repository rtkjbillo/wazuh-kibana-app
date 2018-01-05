require('ui/modules')
.get('app/wazuh', [])
.service('clusterMonitoring', function (apiReq,Notifier) {
    const notifier = new Notifier({location: 'Cluster Monitoring'});

    const request = async (method,url,params) => {
        try{
            const data = await apiReq.request(method,url,params || {});
            return data;
        } catch (error){
            throw error;
        }
    };

    const getNodeInfo = () => request('GET','/cluster/node',{});
    const getAgents   = () => request('GET','/cluster/agents',{});
    const getFiles    = () => request('GET','/cluster/files',{});
    const getNodes    = () => request('GET','/cluster/nodes',{});
    const getStatus   = () => request('GET','/cluster/status',{});
    const getConfig   = () => request('GET','/cluster/config',{});

    return {
        getNodeInfo, getAgents, getFiles, getNodes, getStatus, getConfig
    };
});
