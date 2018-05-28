var app = app || {};

app.utility = function() {
    var isUserLoggedIn = function() {
        if(!localStorage.getItem('user-data'))
            return false;        
        
        return true;
    }

    var setLoginData = function(data) {
        localStorage.setItem('user-data', JSON.stringify(data));
    }

    var removeLoginData = function()
    {
        localStorage.removeItem('user-data');
    }

    var getToken = function() {
        var userData = localStorage.getItem('user-data');
        
        if(userData)
            return JSON.parse(userData).token;
    }

    var getUserFullname = function() {
        var userData = localStorage.getItem('user-data');
        
        if(userData)
            return JSON.parse(userData).fullname;
    }

    var clearForm = function(form) {
        form.find('input, textarea, select').each(function() {            
            $(this).val('');
        });
    }

    var objectifyForm = function(form) {
        var fields = {};

        form.find('input, textarea, select').each(function() {
            fields[this.name] = $(this).val();
        });

        return fields;
    }

    var formalizeObject = function(obj, form) {
        for(var propertyName in obj) {
            form.find('[name="'+ propertyName +'"]').val(obj[propertyName]);
        }
    }

    return {
        isUserLoggedIn: isUserLoggedIn,
        setLoginData: setLoginData,
        removeLoginData: removeLoginData,
        getToken: getToken,
        objectifyForm: objectifyForm,
        formalizeObject: formalizeObject,
        clearForm: clearForm,
        getUserFullname: getUserFullname
    }
}();