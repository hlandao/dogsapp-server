function HeaderController($scope, $location, Global) {
    $scope.global = Global;
    $scope.menu = [
        {
          "title" : "Users",
            "link" : "users"
        },
        {
        "title": "Clients",
        "link": "clients"
        }
    ];

    $scope.init = function() {

    };
}