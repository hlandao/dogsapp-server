function ClientsController($scope, $routeParams, $location, Global, Client, $http, ngTableParams) {
    $scope.global = Global;

    $scope.create = function() {
        var client = new Client({
            title: this.title,
            content: this.content
        });
        client.$save(function(response) {
            $location.path("clients/" + response._id);
        });

        this.title = "";
        this.content = "";
    };

    $scope.remove = function(client) {
        client.$remove();

        for (var i in $scope.clients) {
            if ($scope.clients[i] == client) {
                $scope.clients.splice(i, 1);
            }
        }
    };

    $scope.update = function() {
        var client = $scope.client;
        if (!client.updated) {
            client.updated = [];
        }
        client.updated.push(new Date().getTime());

        client.$update(function() {
            $location.path('clients/' + client._id);
        });
    };

    $scope.find = function(query) {
        Client.query(query, function(clients) {
            $scope.clients = clients;
        });
    };

    $scope.findOne = function() {
        Client.get({
            clientId: $routeParams.clientId
        }, function(client) {
            $scope.client = client;
        });
    };


}