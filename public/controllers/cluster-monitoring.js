
const app = require('ui/modules').get('app/wazuh', []);

app.controller('clusterController', function ($scope, $rootScope, $location, clusterMonitoring, ClusterAgents,ClusterFiles,errorHandlerService) {
    $scope.clusterAgents = ClusterAgents;
    $scope.clusterFiles  = ClusterFiles;

    $scope.selectedNode    = null;
    $scope.clusterTab      = 'agents';
    $scope.dataShown       = [];
    $scope.config          = null;
    $scope.dataShownHeader = null;
    $scope.loading         = true;
    $scope.lookingNode     = false;

    const resetHandlers = () => {
        if(!$scope.selectedNode) return;
        $scope.clusterAgents.reset();
        $scope.clusterFiles.reset();
        $scope.clusterAgents.path = `/cluster/agents/${$scope.selectedNode.node}`;
        $scope.clusterFiles.path  = `/cluster/files/${$scope.selectedNode.url}`;
        switch($scope.clusterTab){
            case 'agents':
                $scope.clusterAgents.nextPage();
                break;
            case 'files':
                $scope.clusterFiles.nextPage();    
                break;
            case 'configuration':
                loadConfigInfo();
                break;
            default:
                $scope.clusterAgents.nextPage();
                break;
        };
    }

    $scope.$watch('clusterTab',() => resetHandlers());

    $scope.$watch('lookingNode',() => {
        if(!$scope.lookingNode) $scope.clusterTab = false;
    })

    $scope.switchNode = async item => {
        try{
            if(item.node === 'unknown') return;
            $scope.lookingNode  = true;
            $scope.selectedNode = item;
            $scope.clusterAgents.path = `/cluster/agents/${item.node}`;
            $scope.clusterFiles.path  = `/cluster/files/${item.node}`;
            $scope.clusterTab   = 'agents';
            await loadStatusInfo();
            const data = await clusterMonitoring.getTotalFileCount(item.node);
            $scope.hasFiles = (data.data.data && data.data.data.totalItems && data.data.data.totalItems > 0);
            await $scope.clusterAgents.nextPage();
            if(!$scope.$$phase) $scope.$digest();
            return;
        } catch (error) {
            console.log(error);
        }
    }

    $scope.switchClusterTab = tab => {
        resetHandlers();
        $scope.showRaw    = false;
        $scope.dataShown  = [];
        $scope.clusterTab = tab;
    }

    $scope.showAgent = agent => {
        $rootScope.globalAgent = agent.id;
        $rootScope.comeFrom    = 'groups';
        $location.search('tab', null);
        $location.path('/agents');        
    };

    const handleError = error => {
        errorHandlerService.error(error);
        $scope.loading = false;
        if(!$rootScope.$$phase) $rootScope.$digest();
    }

    const loadNodesInfo = async header => {
        try {
            const data = await clusterMonitoring.getNodes();
            if(data.data.error) {
                errorHandlerService.error(data.data.error);
                if(!$rootScope.$$phase) $rootScope.$digest();
                return;
            }
            $scope.selectedNode    = data.data.data.items[0];
            $scope.dataShownHeader = data.data.data;
            $scope.loading         = false;
            if(!$scope.$$phase) $scope.$digest();
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
                errorHandlerService.error(data.data.error);
                if(!$rootScope.$$phase) $rootScope.$digest();
                return;
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
                errorHandlerService.error(data.data.error);
                if(!$rootScope.$$phase) $rootScope.$digest();
                return;
            }
            $scope.config  = data.data.data[$scope.selectedNode.node].data;
            $scope.loading = false;
            if(!$scope.$$phase) $scope.$digest();
            return;
        } catch (error) {
            handleError(error);
        }
    }

    $scope.sortNodes = term => {
        $scope.sortNodeTermDir = !$scope.sortNodeTermDir;
        $scope.sortNodeTerm = term;
        $scope.dataShownHeader.items.sort((a,b) => {
            if(a[term] > b[term]) return (!$scope.sortNodeTermDir) ? 1 : -1;
            if(a[term] < b[term]) return (!$scope.sortNodeTermDir) ? -1 : 1;
            return 0;
        });
        if(!$scope.$$phase) $scope.$digest();
    }


    const initialize = async () => {
        try{
            await loadNodesInfo();
            const data = await clusterMonitoring.getAgents();
            for(let node of $scope.dataShownHeader.items){
                node.agents = (typeof data.data.data[node.node] !== 'undefined') ? data.data.data[node.node].length : 0;
                const filesData = await Promise.all([clusterMonitoring.getSynchronizedFileCount(node.node),clusterMonitoring.getTotalFileCount(node.node)]);
                node.synchFiles = filesData[0].data.data.totalItems;
                node.totalFiles = filesData[1].data.data.totalItems;
            }
            if(!$scope.$$phase) $scope.$digest();
            return;
        } catch(error){
            errorHandlerService.error(error);
            if(!$rootScope.$$phase) $rootScope.$digest();
        }
    }

    initialize();
});