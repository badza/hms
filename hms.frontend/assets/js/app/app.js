var app = app || {};

app.main = function() {
    var init = function() {
        var bodyEl = $('body');
        var contentEl = $('#content');

        if(!app.utility.isUserLoggedIn())
        {            
            $.ajax({
                url: 'views/login.html',
                type: 'GET',
                dataType: 'text',
                success: function(response) {
                    bodyEl.html(response);
                }
            });
        }
    }

    return {
        init: init
    }
}();