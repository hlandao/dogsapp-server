//Articles service used for articles REST endpoint
window.app.factory("User", function($resource) {
    return $resource('users/:userId', {
        userId: '@_id'
    }, {
        update: {
            method: 'PUT'
        }
    });
});