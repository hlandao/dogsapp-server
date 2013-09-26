function UsersController($scope, $routeParams, $location, Global, User, ngTableParams) {
    $scope.global = Global;

    $scope.create = function() {
        var user = new User({
            email: this.email,
            password: this.password
        });
        user.$save(function(response) {
            $location.path("users");
        });

        this.email = "";
        this.password = "";
    };

    $scope.remove = function(user) {
        user.$remove();

        for (var i in $scope.users) {
            if ($scope.users[i] == user) {
                $scope.users.splice(i, 1);
            }
        }
    };

    $scope.update = function() {
        var user = $scope.user;
        if (!user.updated) {
            user.updated = [];
        }
        user.updated.push(new Date().getTime());

        user.$update(function() {
            $location.path('users/' + user._id);
        });
    };



    //$scope.$watch('tableParams', $scope.find, true);

    //$scope.$watch('tableParams', function(params) {
    //    console.log('params',params);
    //}, true);


    $scope.find = function(query) {
        $scope.tableParams = new ngTableParams({
            page: 1,            // show first page
            total: 0,           // length of data
            count: 10,          // count per page
            sorting: {
                email: 'asc'     // initial sorting
            }
        });

        $scope.loading = true;


        User.query(query, function(users) {
            $scope.loading = false;
            // set new data
            $scope.users = users;

            // update table params
            $scope.tableParams.total = users.length;

        });
    };

    $scope.findOne = function() {
        User.get({
            userId: $routeParams.userId
        }, function(user) {
            $scope.user = user;
        });
    };
}