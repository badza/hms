var app = app || {};

app.utility = function() {
    var isUserLoggedIn = function() {
        if(!localStorage.getItem('token'))
            return false;        
        
        return true;
    }

    return {
        isUserLoggedIn: isUserLoggedIn
    }
}();