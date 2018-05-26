var app = app || {};

app.config = function() {
    var getApiUrl = function() {
        return '/hms/hms.api/';
    }

    return {
        getApiUrl: getApiUrl
    }
}();