const beautifier = require('plugins/wazuh/utils/json-beautifier');
let app = require('ui/modules')
.get('app/wazuh', [])
.controller('clusterController', function ($scope, clusterMonitoring, Notifier,ClusterAgents,ClusterFiles) {
    const clusterAgents = ClusterAgents;
    const clusterFiles  = ClusterFiles;
    const notifier      = new Notifier();

    $scope.selectedNode    = null;
    $scope.clusterTab      = 'agents';
    $scope.dataShown       = [];
    $scope.config          = null;
    $scope.dataShownHeader = null;
    $scope.loading         = true;
    $scope.error           = null;
    $scope.raw             = null;
    $scope.lookingNode     = false;

    $scope.applyFilter = searchTerm => {
        if($scope.clusterTab === 'agents')     clusterAgents.addFilter('search', searchTerm);
        else if($scope.clusterTab === 'files') clusterFiles.addFilter('search', searchTerm);
        return;
    }

    const resetHandlers = () => {
        if(!$scope.selectedNode) return;
        clusterAgents.reset();
        clusterFiles.reset();
        clusterAgents.path = `/cluster/agents/${$scope.selectedNode.node}`;
        clusterFiles.path  = `/cluster/files/${$scope.selectedNode.url}`;
    }

    $scope.$watch('selectedNode',resetHandlers);

    $scope.$watch('lookingNode',() => {
        if(!$scope.lookingNode) resetHandlers();
    })

    $scope.switchNode = async item => {
        $scope.lookingNode  = true;
        $scope.selectedNode = item;
        $scope.clusterTab   = 'agents';
        await loadAgentsInfo();
        if(!$scope.$$phase) $scope.$digest();
    }

    $scope.switchClusterTab = tab => {
        resetHandlers();
        $scope.showRaw    = false;
        $scope.dataShown  = [];
        $scope.raw        = 'Loading';
        $scope.clusterTab = tab;
        switch($scope.clusterTab){
            case 'agents':
                loadAgentsInfo();
                break;
            case 'files':
                loadFilesInfo();
                break;
            case 'status':
                loadStatusInfo();
                break;
            case 'configuration':
                loadConfigInfo();
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
        $scope.dataShown = data;
        $scope.raw       = beautifier.prettyPrint(data);
        $scope.loading   = false;
        $scope.error     = null;
        if(!$scope.$$phase) $scope.$digest();
    }

    const loadAgentsInfo = async () => {
        try {
            $scope.loading = true;
            await clusterAgents.nextPage();
            const data = clusterAgents.items;
            return handleData(data);
        } catch (error) {
            handleError(error);
        }
    }

    const loadFilesInfo = async () => {
        try {
            $scope.loading = true;
            await clusterAgents.nextPage();
            const data = clusterAgents.items;
            return handleData(data);
        } catch (error) {
            handleError(error);
        }
    }

    $scope.loadAgentsInformation = () => loadAgentsInfo();
    $scope.loadFilesInformation  = () => loadFilesInfo();

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
            if(data.data.error) {
                return handleError(data.data.error);
            }
            $scope.status  = data.data.data;
            $scope.loading = false;
            if(!$scope.$$phase) $scope.$digest();
            return;
        } catch (error) {
            handleError(error);
        }
    }

    const loadConfigInfo = async () => {
        try {
            $scope.loading = true;
            const data    = await clusterMonitoring.getConfig($scope.selectedNode.node);
            if(data.data.error) {
                return handleError(data.data.error);
            }
            $scope.config  = data.data.data;
            $scope.loading = false;
            if(!$scope.$$phase) $scope.$digest();
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
        if(!$scope.$$phase) $scope.$digest();
    }).catch(console.error);
});