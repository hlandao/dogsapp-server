//Articles service used for articles REST endpoint
window.app.factory("Client", function($resource) {
    return $resource('clients/:clientId', {
        clientId: '@_id'
    }, {
        update: {
            method: 'PUT'
        }
    });
});