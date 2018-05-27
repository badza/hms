var app = app || {};

app.user = function() {
    var page = 1;

    var init = function() {
        $('#user-form').validate({
            rules: {
                firstname: 'required',
                lastname: 'required',
                username: {
                    required: true,
                    minlength: 3
                },
                email: {
                    required: true,
                    email: true
                }
            },
            messages: {
                firstname: 'First Name is required.',
                lastname: 'Last Name is required.',
                username: {
                    required: 'Username is required.',
                    minlength: 'Username should be minimum 3 characters.'
                },
                email: {
                    required: 'Email is required.',
                    email: 'Invalid email address.'
                }
            }
        });

        $('#password-form').validate({
            rules: {
                password: 'required',
                confirm_password: {
                    equalTo: '#password'
                }
            },
            messages: {
                password: 'Password is required.',
                confirm_password: {
                    equalTo: 'Please confirm password.'
                }
            }
        });

        $('#edit-user-modal').on('shown.bs.modal', function () {
            $('#firstname').trigger('focus');
        });

        getUsers();        
    }

    var getUsers = function() {
        var html = '';

        $.ajax({
            url: app.config.getApiUrl() + 'users?page=' + page,
            type: 'GET',
            dataType: 'json',
            beforeSend: function(xhr){ xhr.setRequestHeader('Authorization', 'Bearer ' + app.utility.getToken());},
            success: function(response, status, jqXHR) {   
                html += buildTableHtml(response.data);
                html += buildPaginationHtml(response.page_count);
                $('#user-data-placeholder').html(html);                
            },
            error: function(response) {
                if(response.status == 401)
                {
                    app.utility.removeLoginData();
                    app.router.navigate('login');
                }
            },
            complete: function() {
                //app.main.showLoading(false);
            }
        });
    }

    var getUser = function(id) {
        return $.ajax({
            url: app.config.getApiUrl() + 'users/' + id,
            type: 'GET',
            dataType: 'json',
            beforeSend: function(xhr){ xhr.setRequestHeader('Authorization', 'Bearer ' + app.utility.getToken());},
            success: function(response, status, jqXHR) {   
                
            },
            error: function(response) {
                if(response.status == 401)
                {
                    app.utility.removeLoginData();
                    app.router.navigate('login');
                }
            },
            complete: function() {
                //app.main.showLoading(false);
            }
        });
    }

    var buildTableHtml = function(data)
    {
        var html = '';
        html += '<table class="table table-striped">';

        html += '<thead class="thead-dark">';
        html += '<tr>';
        html += '<td style="width: 50px;">';
        html += '#';
        html += '</td>';
        html += '<td>';
        html += 'First Name';
        html += '</td>';
        html += '<td>';
        html += 'Last Name';
        html += '</td>';
        html += '<td>';
        html += 'Username';
        html += '</td>';
        html += '<td>';
        html += 'Email';
        html += '</td>';
        html += '<td>';
        html += 'Role';
        html += '</td>';
        html += '<td style="width:200px;">';
        html += 'Actions';
        html += '</td>';
        html += '</tr>';
        html += '</thead>'
        
        html += '<tbody>';
        for(var i=0; i<data.length; i++)
        {
            html += '<tr>';
            html += '<td>';
            html += data[i].user_id;
            html += '</td>';
            html += '<td>';
            html += data[i].firstname;
            html += '</td>';
            html += '<td>';
            html += data[i].lastname;
            html += '</td>';
            html += '<td>';
            html += data[i].username;
            html += '</td>';
            html += '<td>';
            html += data[i].email;
            html += '</td>';
            html += '<td>';
            html += data[i].role;
            html += '</td>';
            html += '<td class="actions-column">';
            html += '<button class="btn btn-secondary" onclick="app.user.editUser('+ data[i].user_id +')" href="#"><i class="fas fa-pencil-alt"></i> Edit</button>';
            html += '<button class="btn btn-secondary" onclick="app.user.changePassword('+ data[i].user_id +')"><i class="fas fa-key"></i> Change Password</button>';
            html += '<button class="btn btn-secondary" onclick="app.user.openDeleteModal('+ data[i].user_id +')"><i class="far fa-trash-alt"></i> Delete</button>';
            html += '</td>';
            html += '</tr>';
        }
        html += '</tbody>'

        html += '</table>';

        return html;
    }

    var buildPaginationHtml = function(pageCount)
    {
        var html = '';
        html += '<nav>';  
        html += '<ul class="pagination">';

        html += '<li class="page-item ' + (page == 1 ? 'disabled' : '') + '">';
        html += '<button class="page-link previous-page" onclick="app.user.previousPage()">Previous</button>';
        html += '</li>';

        for(var i=0; i<pageCount; i++)
        {
            html += '<li class="page-item '+ (page == i+1 ? 'active' : '') +'">';
            html += '<button class="page-link page" onclick="app.user.goToPage(' + (i+1) + ')">' + (i+1) + '</button>';
            html += '</li>';
        }

        html += '<li class="page-item ' + (page == pageCount ? 'disabled' : '') + '">';
        html += '<button class="page-link next-page" onclick="app.user.nextPage()">Next</button>';
        html += '</li>';

        html += '</ul>';
        html += '</nav>';

        return html;
    }

    var previousPage = function() {
        page = page - 1;
        getUsers();
    }

    var nextPage = function() {
        page = page + 1;
        getUsers();
    }

    var goToPage = function(number) {
        page = number;
        getUsers();
    }

    var changePassword = function(id)
    {
        var title = 'Change User Password';

        $.when(getUser(id)).then(function(data) {
            openChangePasswordModal(title, data);
        });  
    }

    var savePassword = function() 
    {
        var obj = app.utility.objectifyForm($('#password-form'));
        var url = app.config.getApiUrl() + 'users/' + obj.user_id + '/password';

        if($('#password-form').valid())
        {
            $.ajax({
                url: url,
                type: 'PUT',
                data: JSON.stringify(obj),
                contentType: 'application/json; charset=utf-8',
                dataType: 'json',
                beforeSend: function(xhr){ xhr.setRequestHeader('Authorization', 'Bearer ' + app.utility.getToken());},
                success: function(response, status, jqXHR) {  
                    app.main.showMessage('success', 'Successfully updated user password.'); 
                },
                error: function(response) {
                    if(response.status == 401)
                    {
                        app.utility.removeLoginData();
                        app.router.navigate('login');
                    }
                },
                complete: function() {                
                    $('#edit-password-modal').modal('hide');
                    //app.main.showLoading(false);
                }
            });
        }
    }

    var openChangePasswordModal = function(title, user)
    {
        $('#edit-password-modal .modal-title').html(title);
        app.utility.clearForm($('#password-form'));
        app.utility.formalizeObject(user.data, $('#password-form'));
        $('#edit-password-modal').modal('show');
    }

    var openDeleteModal = function(id)
    {
        app.main.showConfirmation('Deleting user', 'Are you sure that you want to delete selected user?', deleteUser, id);
    }

    var deleteUser = function(id)
    {
        var url = app.config.getApiUrl() + 'users/' + id;

        $.ajax({
            url: url,
            type: 'DELETE',
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            beforeSend: function(xhr){ xhr.setRequestHeader('Authorization', 'Bearer ' + app.utility.getToken());},
            success: function(response, status, jqXHR) {  
                app.main.showMessage('success', 'Successfully deleted user.'); 
                getUsers();
            },
            error: function(response) {
                if(response.status == 401)
                {
                    app.utility.removeLoginData();
                    app.router.navigate('login');
                }
            },
            complete: function() {                
                //app.main.showLoading(false);
            }
        });
    }

    var openEditModal = function(title, user)
    {
        $('#edit-user-modal .modal-title').html(title);
        app.utility.clearForm($('#user-form'));        
        fillRolesDropdown(user.roles);

        if(user.data)
        {
            app.utility.formalizeObject(user.data, $('#user-form'));
            $('#edit-user-modal').modal('show');
        }
        else
            $('#edit-user-modal').modal('show');
    }
    
    var editUser = function(id)
    {
        var title = id > 0 ? 'Edit User' : 'Add User';

        $.when(getUser(id)).then(function(data) {
            openEditModal(title, data);
        });  
    }

    var saveUser = function()
    {
        var obj = app.utility.objectifyForm($('#user-form'));
        var type = obj.user_id > 0 ? 'PUT' : 'POST';
        var url = obj.user_id > 0 ? app.config.getApiUrl() + 'users/' + obj.user_id : app.config.getApiUrl() + 'users/';
        
        if($('#user-form').valid())
        {
            $.ajax({
                url: url,
                type: type,
                data: JSON.stringify(obj),
                contentType: 'application/json; charset=utf-8',
                dataType: 'json',
                beforeSend: function(xhr){ xhr.setRequestHeader('Authorization', 'Bearer ' + app.utility.getToken());},
                success: function(response, status, jqXHR) {  
                    app.main.showMessage('success', (obj.user_id > 0 ? 'Successfully edited user.' : 'Successfully added user')); 
                    getUsers();
                },
                error: function(response) {
                    if(response.status == 401)
                    {
                        app.utility.removeLoginData();
                        app.router.navigate('login');
                    }
                },
                complete: function() {                
                    $('#edit-user-modal').modal('hide');
                    //app.main.showLoading(false);
                }
            });
        }
    }

    var fillRolesDropdown = function(data)
    {
        var html = '';

        for(var i=0; i<data.length; i++)        
            html += '<option value="'+ data[i].role_id +'">' + data[i].name + '</option>';
            
        $('#role_id').html(html);
    }

    return {
        init: init,
        previousPage: previousPage,
        nextPage: nextPage,
        goToPage: goToPage,
        saveUser: saveUser,
        editUser: editUser,
        changePassword: changePassword,
        savePassword: savePassword,
        openDeleteModal: openDeleteModal
    }
}();