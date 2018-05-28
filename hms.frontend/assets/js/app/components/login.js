var app = app || {};

app.login = function() {
    var init = function() {
        $('.form-control').on('keypress', function(e) {
            if(e.which === 13)
                login();
        });
    }

    var login = function() {
        var requestObj = {
            username: $('#username').val(),
            password: $('#password').val()
        };

        showWarningMessage(false, '');
        showLoginLoading(true);

        $.ajax({
            url: app.config.getApiUrl() + 'token',
            type: 'POST',
            data: requestObj,
            dataType: 'json',
            success: function(response, status, jqXHR) {   
                app.utility.setLoginData(response);            
                app.router.navigate('/reservation');
            },
            error: function(response) {
                if(response.status == 401)
                    showWarningMessage(true, 'Invalid username or password');
                else
                    showWarningMessage(true, 'Error while logging you in :(.');
            },
            complete: function() {
                showLoginLoading(false);
            }
        });
    }

    var showWarningMessage = function(show, message)
    {
        if(show)
        {
            $('#login-danger-message').html(message);
            $('#login-danger-message').show();
        }
        else
            $('#login-danger-message').hide();
    }

    var showLoginLoading = function(show) {
        if(show)
            $('#login-loading').show();
        else
            $('#login-loading').hide();
    }

    return {
        init: init,
        login: login
    }
}();