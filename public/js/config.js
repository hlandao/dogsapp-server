//Setting up route
window.app.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
        when('/users', {
            templateUrl: 'views/users/list.html'
        }).
        when('/users/create', {
            templateUrl: 'views/users/create.html'
        }).
        when('/users/:userId/edit', {
            templateUrl: 'views/users/edit.html'
        }).
        when('/users/:userId', {
            templateUrl: 'views/users/view.html'
        }).

        when('/clients', {
        templateUrl: 'views/clients/list.html'
        }).
        when('/clients/create', {
            templateUrl: 'views/clients/create.html'
        }).
        when('/clients/:clientId/edit', {
        templateUrl: 'views/clients/edit.html'
        }).
        when('/clients/:clientId', {
            templateUrl: 'views/clients/view.html'
        }).
        when('/', {
            templateUrl: 'views/index.html'
        }).
        otherwise({
            redirectTo: '/'
        });
    }
]);

//Setting HTML5 Location Mode
window.app.config(['$locationProvider',
    function($locationProvider) {
        $locationProvider.hashPrefix("!");
    }
]);