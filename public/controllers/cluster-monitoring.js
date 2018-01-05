let app = require('ui/modules')
.get('app/wazuh', [])
.controller('clusterController', function ($scope, clusterMonitoring, Notifier) {
    const notifier = new Notifier();
    $scope.clusterTab = 'node-info';
    $scope.dataShown = null;

    const loadNodeInfo = async () => {
        try {
            const data = await clusterMonitoring.getNodeInfo();
        } catch (error) {
            notify.error(error);
        }
    }

    const loadAgentsInfo = async () => {
        try {
            const data = await clusterMonitoring.getAgents();
        } catch (error) {
            notify.error(error);
        }
    }

    const loadFilesInfo = async () => {
        try {
            const data = await clusterMonitoring.getFiles();
        } catch (error) {
            notify.error(error);
        }
    }

    const loadNodesInfo = async () => {
        try {
            const data = await clusterMonitoring.getNodes();
        } catch (error) {
            notify.error(error);
        }
    }

    const loadStatusInfo = async () => {
        try {
            const data = await clusterMonitoring.getStatus();
        } catch (error) {
            notify.error(error);
        }
    }

    const loadConfigInfo = async () => {
        try {
            const data = await clusterMonitoring.getConfig();
        } catch (error) {
            notify.error(error);
        }
    }

    switch($scope.clusterTab){
        case 'node-info':
            loadNodeInfo();
            break;
        case 'agents-info':
            loadAgentsInfo();
            break;
        case 'files-info':
            loadFilesInfo();
            break;
        case 'nodes-info':
            loadNodesInfo();
            break;
        case 'status-info':
            loadStatusInfo();
            break;
        case 'config-info':
            loadConfigInfo();
            break;
        default:
            loadNodeInfo();
            break;
    };

    loadNodeInfo();

});