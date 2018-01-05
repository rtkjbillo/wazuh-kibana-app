let app = require('ui/modules')
.get('app/wazuh', [])
.controller('clusterController', function ($scope, clusterMonitoring) {

    Promise.all([
        clusterMonitoring.getNodeInfo(), 
        clusterMonitoring.getAgents(), 
        clusterMonitoring.getFiles(), 
        clusterMonitoring.getNodes(), 
        clusterMonitoring.getStatus(), 
        clusterMonitoring.getConfig()
    ]).then(data => console.log(data));
});