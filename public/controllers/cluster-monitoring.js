const beautifier = require('plugins/wazuh/utils/json-beautifier');
let app = require('ui/modules')
.get('app/wazuh', [])
.controller('clusterController', function ($scope, clusterMonitoring, Notifier) {
    const notifier      = new Notifier();
    $scope.selectedNode    = null;
    $scope.clusterTab      = 'agents-info';
    $scope.dataShown       = [];
    $scope.config          = null;
    $scope.dataShownHeader = null;
    $scope.loading         = true;
    $scope.error           = null;
    $scope.raw             = null;
    $scope.lookingNode     = false;
    
    $scope.switchNode = async item => {
        $scope.lookingNode  = true;
        $scope.selectedNode = item;
        $scope.clusterTab   = 'agents-info';
        await loadAgentsInfo();
        await loadConfigInfo();
        await loadStatusInfo();
        $scope.$digest();
    }

    $scope.switchClusterTab = tab => {
        $scope.showRaw    = false;
        $scope.dataShown  = [];
        $scope.raw        = 'Loading';
        $scope.clusterTab = tab;
        switch($scope.clusterTab){
            case 'agents-info':
                loadAgentsInfo();
                break;
            case 'files-info':
                loadFilesInfo();
                break;
            default:
                loadAgentsInfo();
                break;
        };
    }

    const handleError = error => {
        notifier.error(error.message || error);
        $scope.raw     = beautifier.prettyPrint(error.message || error);
        $scope.loading = false;
        $scope.error   = error;
    }

    const handleData = data => {
        $scope.dataShown = data.data.data;
        $scope.raw       = beautifier.prettyPrint(data.data.data);
        $scope.loading   = false;
        $scope.error     = null;
        $scope.$digest();
    }

    const loadAgentsInfo = async () => {
        try {
            $scope.loading = true;
            let data = await clusterMonitoring.getAgents();
            if(data.data.error) {
                return handleError(data.data.error);
            }
            const fixed = data.data.data[$scope.selectedNode.node] || [];
            data.data.data = fixed;
            return handleData(data);
        } catch (error) {
            handleError(error);
        }
    }

    const loadFilesInfo = async () => {
        try {
            $scope.loading = true;
            const data = await clusterMonitoring.getFiles();
            data.data.data = data.data.data[$scope.selectedNode.url];
            let fixed = [];
            for(let key in data.data.data){
                for(let file of data.data.data[key]){
                    fixed.push({
                        file: file,
                        status: key
                    });
                }
            }
            data.data.data = fixed;
            if(data.data.error) {
                return handleError(data.data.error);
            }
            return handleData(data);
        } catch (error) {
            handleError(error);
        }
    }

    const loadNodesInfo = async (header) => {
        try {

            const data = await clusterMonitoring.getNodes();
            if(data.data.error) {
                return handleError(data.data.error);
            }
            $scope.selectedNode    = data.data.data.items[0];
            $scope.dataShownHeader = data.data.data;
            $scope.loading         = false;
            $scope.error           = null;
            return;
        } catch (error) {
            handleError(error);
        }
    }

    const loadStatusInfo = async () => {
        try {
            $scope.loading = true;
            const data     = await clusterMonitoring.getStatus($scope.selectedNode.node);
            $scope.status  = data.data.data;
            $scope.loading = false;
            return;
        } catch (error) {
            handleError(error);
        }
    }

    const loadConfigInfo = async () => {
        try {
            $scope.loading = true;
            const data    = await clusterMonitoring.getConfig($scope.selectedNode.node);
            $scope.config = data.data.data;
            $scope.loading = false;
            return;
        } catch (error) {
            handleError(error);
        }
    }

    loadNodesInfo()
    .then(clusterMonitoring.getAgents)
    .then(data => {
        for(let node of $scope.dataShownHeader.items){
            node.agents = (typeof data.data.data[node.node] !== 'undefined') ? data.data.data[node.node].length : 0;
        }
        $scope.$digest();
    }).catch(console.error);
});