var app = app || {};

app.main = function() {
    var bodyEl = null;
    var contentEl = null;

    var init = function() {
        bodyEl = $('#body-content');
        contentEl = $('#content');
        
        // Configuring router
        app.router.config();
        app.router.navigate();

        app.router
        .add('login', function() {
            loadBody('views/login');
        })
        .add('home', function() {
            loadBody('views/layout');
        }).listen();

        // If user is not logged in, redirect to login
        if(!app.utility.isUserLoggedIn())        
            app.router.navigate('/login');   
    }

    var loadBody = function(viewName) {
        showLoading(true);

        $.ajax({
            url: viewName + '.html',
            type: 'GET',
            dataType: 'text',
            success: function(response) {
                bodyEl.html(response);
                showLoading(false);
            }
        });
    }

    var loadContent = function(viewName) {

    }

    var showLoading = function(value) {
        if(value)
            $('#loading').show();
        else
            $('#loading').hide();
    }

    return {
        init: init,
        loadBody: loadBody
    }
}();