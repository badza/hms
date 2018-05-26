var app = app || {};

app.utility = function() {
    var isUserLoggedIn = function() {
        if(!localStorage.getItem('user-data'))
            return false;        
        
        return true;
    }

    var setLoginData = function(data) {
        localStorage.setItem('user-data', data);
    }

    return {
        isUserLoggedIn: isUserLoggedIn,
        setLoginData: setLoginData
    }
}();