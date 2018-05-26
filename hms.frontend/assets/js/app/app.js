var app = app || {};

app.main = function() {
    var bodyEl = null;
    var contentEl = null;

    var init = function() {
        bodyEl = $('#body-content');
        contentEl = $('#content');
        
        // Configuring router
        app.router.config();

        app.router
        .add('login', function() {
            loadBody('views/login');
        })
        .add('home', function() {
            loadContent('views/home');
        })
        .add('user', function() {
            loadContent('views/user');
        })
        .add('room', function() {
            loadContent('views/room');
        })
        .listen();

        // This is only for initial load
        app.router.check(app.router.getFragment());

        // If user is not logged in, redirect to login
        if(!app.utility.isUserLoggedIn())        
            app.router.navigate('/login');  
        else
        {
            if(app.router.getFragment() && app.router.getFragment() != 'login')
                app.router.navigate('/' + app.router.getFragment());
            else
                app.router.navigate('/home');
        }        
    }

    var loadBody = function(viewName, initLoading) {
        showLoading(true);

        return $.ajax({
            url: viewName + '.html',
            type: 'GET',
            dataType: 'text',
            success: function(response) {
                bodyEl.html(response);
                reinitLinks();
                reinitContent();
                
                if(!initLoading)
                    showLoading(false);                            
            }
        });
    }

    var loadContent = function(viewName) {        
        if(contentEl.length === 0){
            $.when(loadBody('views/layout', true)).done(function(){
                loadContentWithoutLayout(viewName);
            });          
        }
        else
            loadContentWithoutLayout(viewName);
    }

    var loadContentWithoutLayout = function(viewName) {
        showLoading(true);

        return $.ajax({
            url: viewName + '.html',
            type: 'GET',
            dataType: 'text',
            success: function(response) {
                contentEl.html(response);
                reinitLinks();
                reinitContent();
                showLoading(false);                            
            }
        });
    }

    var showLoading = function(value) {
        if(value)
            $('#loading').fadeIn(200);
        else
            $('#loading').fadeOut(200);
    }

    var reinitLinks = function() {
        $('a').off('click').on('click', function(e){
            if($(this).data('navigate'))
            {
                e.preventDefault();
                var navigateTo = $(this).data('navigate');
                app.router.navigate('/' + navigateTo);
            }
        });
    }

    var reinitContent = function() {
        contentEl = $('#content');
    }
    
    var navigateTo = function(routeValue) {

    }

    return {
        init: init,
        loadBody: loadBody
    }
}();