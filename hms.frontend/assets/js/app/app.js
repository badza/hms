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
        .add('reservation', function() {
            loadContent('views/reservation');
        })
        .add('user', function() {
            loadContent('views/user');
        })
        .add('roomrate', function() {
            loadContent('views/roomrate');
        })
        .add('room', function() {
            loadContent('views/room');
        })   
        .add('guest', function() {
            loadContent('views/guest');
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
                app.router.navigate('/reservation');
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
                createMobileMainMenu();
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
                setLinkActive(app.router.getFragment());
                setName(app.utility.getUserFullname());
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

    var setLinkActive = function(navigate)
    {        
        $('.sidebar-sticky li a').each(function() {
            if($(this).data('navigate') == navigate)
                $(this).addClass('active');
            else
                $(this).removeClass('active');
        });
    }

    var reinitContent = function() {
        contentEl = $('#content');
    }

    var showMessage = function(type, message)
    {
        $('#message').attr('class', '');
        $('#message').addClass('custom-message')        

        if(type=='success')        
            $('#message').addClass('alert alert-success');        

        $('#message').html(message);
        $('#message').fadeIn(200);
        setTimeout(function() { $("#message").fadeOut(200); }, 3000);
    }

    var showConfirmation = function(title, message, callback, id)
    {
        $('#confirmation-modal .modal-title').html(title);
        $('#confirmation-modal .modal-body').html(message);
        $('#confirmation-modal').modal('show');

        $('.confirm').on('click', function() {
            callback(id);
            $('#confirmation-modal').modal('hide');
        });
    }

    var createMobileMainMenu = function() {
        var liElementsHtml = $('.main-menu').html();
        var liTopRightMenuHtml = $('.top-right-menu').html();
        var htmlElements = liElementsHtml + liTopRightMenuHtml;       
        $('#mobile-main-menu .nav').html(htmlElements);
    }

    var setName = function(val) {
        $('.user-fullname').html(val);
    }

    var signOut = function() {
        localStorage.removeItem('user-data');
        app.router.navigate('/login');
        app.router.check(app.router.getFragment()); 
    }

    return {
        init: init,
        loadBody: loadBody,
        showLoading: showLoading,
        showMessage: showMessage,
        showConfirmation: showConfirmation,
        signOut: signOut
    }
}();