require('ui/modules')
.get('app/wazuh', [])
.service('clusterMonitoring', function ($q, apiReq,Notifier) {
    const notifier = new Notifier();
    const getNodeInfo = async () => {
        try{
            const data = await apiReq.request('GET','/cluster/node',{});
            return data;
        } catch (error){
            return error;
        }

    }

    const getAgents = async () => {
        try{
            const data = await apiReq.request('GET','/cluster/agents',{});
            return data;
        } catch (error){
            return error;
        }

    }
    
    const getFiles = async () => {
        try{
            const data = await apiReq.request('GET','/cluster/files',{});
            return data;
        } catch (error){
            return error;
        }

    }

    const getNodes = async () => {
        try{
            const data = await apiReq.request('GET','/cluster/nodes',{});
            return data;
        } catch (error){
            return error;
        }

    }

    const getStatus = async () => {
        try{
            const data = await apiReq.request('GET','/cluster/status',{});
            return data;
        } catch (error){
            return error;
        }

    }

    const getConfig = async () => {
        try{
            const data = await apiReq.request('GET','/cluster/config',{});
            return data;
        } catch (error){
            return error;
        }
    }

    return {
        getNodeInfo, getAgents, getFiles, getNodes, getStatus, getConfig
    };
});
