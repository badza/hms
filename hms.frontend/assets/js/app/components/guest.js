var app = app || {};

app.guest = function () {
    var page = 1;

    var init = function () {
        /*$('#room-form').validate({
            rules: {
                door_number: 'required',
                capacity_adults: 'required',
                capacity_children: 'required'
            },
            messages: {
                door_number: 'Door Number is required.',
                capacity_adults: 'Capacity Adults is required.',
                capacity_children: 'Capacity Adults is required.'
            }
        });*/

        getGuests();
    }

    var getGuests = function () {
        var html = '';

        $.ajax({
            url: app.config.getApiUrl() + 'guests?page=' + page,
            type: 'GET',
            dataType: 'json',
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + app.utility.getToken()); },
            success: function (response, status, jqXHR) {                
                html += buildTableHtml(response.data);
                html += buildPaginationHtml(response.page_count);
                $('#guest-data-placeholder').html(html);
            },
            error: function (response) {
                if (response.status == 401) {
                    app.utility.removeLoginData();
                    app.router.navigate('login');
                }
            },
            complete: function () {
                //app.main.showLoading(false);
            }
        });
    }

    var getGuest = function (id) {
        return $.ajax({
            url: app.config.getApiUrl() + 'guests/' + id,
            type: 'GET',
            dataType: 'json',
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + app.utility.getToken()); },
            success: function (response, status, jqXHR) {

            },
            error: function (response) {
                if (response.status == 401) {
                    app.utility.removeLoginData();
                    app.router.navigate('login');
                }
            },
            complete: function () {
                //app.main.showLoading(false);
            }
        });
    }

    var buildTableHtml = function (data) {
        var html = '';
        html += '<table class="table table-striped">';

        html += '<thead class="thead-dark">';
        html += '<tr>';
        html += '<td style="width: 50px;">';
        html += '#';
        html += '</td>';
        html += '<td>';
        html += 'Firstname';
        html += '</td>';
        html += '<td>';
        html += 'Lastname';
        html += '</td>';
        html += '<td>';
        html += 'Address';
        html += '</td>';
        html += '<td>';
        html += 'City';
        html += '</td>';
        html += '<td>';
        html += 'Phone #';
        html += '</td>';
        html += '<td>';
        html += 'Email';
        html += '</td>';
        html += '<td style="width:200px;">';
        html += 'Actions';
        html += '</td>';
        html += '</tr>';
        html += '</thead>'

        html += '<tbody>';
        for (var i = 0; i < data.length; i++) {
            html += '<tr>';
            html += '<td>';
            html += data[i].guest_id;
            html += '</td>';
            html += '<td>';
            html += data[i].firstname;
            html += '</td>';
            html += '<td>';
            html += data[i].lastname;
            html += '</td>';
            html += '<td>';
            html += data[i].address;
            html += '</td>';
            html += '<td>';
            html += data[i].city;
            html += '</td>';
            html += '<td>';
            html += data[i].phone_no;
            html += '</td>';
            html += '<td>';
            html += data[i].email;
            html += '</td>';
            html += '<td class="actions-column remove-width">';
            html += '<button class="btn btn-secondary" onclick="app.guest.editGuest(' + data[i].guest_id + ')" href="#"><i class="fas fa-pencil-alt"></i> Edit</button>';
            html += '<button class="btn btn-secondary" onclick="app.guest.openDeleteModal(' + data[i].guest_id + ')"><i class="far fa-trash-alt"></i> Delete</button>';
            html += '</td>';
            html += '</tr>';
        }
        html += '</tbody>'

        html += '</table>';

        return html;
    }

    var buildPaginationHtml = function (pageCount) {
        var html = '';
        html += '<nav>';
        html += '<ul class="pagination">';

        html += '<li class="page-item ' + (page == 1 ? 'disabled' : '') + '">';
        html += '<button class="page-link previous-page" onclick="app.guest.previousPage()">Previous</button>';
        html += '</li>';

        for (var i = 0; i < pageCount; i++) {
            html += '<li class="page-item ' + (page == i + 1 ? 'active' : '') + '">';
            html += '<button class="page-link page" onclick="app.guest.goToPage(' + (i + 1) + ')">' + (i + 1) + '</button>';
            html += '</li>';
        }

        html += '<li class="page-item ' + (page == pageCount ? 'disabled' : '') + '">';
        html += '<button class="page-link next-page" onclick="app.guest.nextPage()">Next</button>';
        html += '</li>';

        html += '</ul>';
        html += '</nav>';

        return html;
    }

    var openEditModal = function (title, guest) {
        $('#edit-guest-modal .modal-title').html(title);
        app.utility.clearForm($('#guest-form'));        

        if (guest.data) {
            app.utility.formalizeObject(guest.data, $('#guest-form'));
            $('#edit-guest-modal').modal('show');
        }
        else
            $('#edit-guest-modal').modal('show');
    }

    var editGuest = function (id) {
        var title = id > 0 ? 'Edit Guest' : 'Add Guest';

        $.when(getGuest(id)).then(function (data) {
            openEditModal(title, data);
        });
    }

    var saveGuest = function()
    {
        var obj = app.utility.objectifyForm($('#guest-form'));
        var type = obj.guest_id > 0 ? 'PUT' : 'POST';
        var url = obj.guest_id > 0 ? app.config.getApiUrl() + 'guests/' + obj.guest_id : app.config.getApiUrl() + 'guests/';
        
        if($('#guest-form').valid())
        {
            $.ajax({
                url: url,
                type: type,
                data: JSON.stringify(obj),
                contentType: 'application/json; charset=utf-8',
                dataType: 'json',
                beforeSend: function(xhr){ xhr.setRequestHeader('Authorization', 'Bearer ' + app.utility.getToken());},
                success: function(response, status, jqXHR) {  
                    app.main.showMessage('success', (obj.guest_id > 0 ? 'Successfully edited guest.' : 'Successfully added guest.')); 
                    getGuests();
                },
                error: function(response) {
                    if(response.status == 401)
                    {
                        app.utility.removeLoginData();
                        app.router.navigate('login');
                    }
                },
                complete: function() {                
                    $('#edit-guest-modal').modal('hide');
                    //app.main.showLoading(false);
                }
            });
        }
    }

    var openDeleteModal = function(id)
    {
        app.main.showConfirmation('Deleting guest', 'Are you sure that you want to delete selected guest?', deleteGuest, id);
    }

    var deleteGuest = function(id)
    {
        var url = app.config.getApiUrl() + 'guests/' + id;

        $.ajax({
            url: url,
            type: 'DELETE',
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            beforeSend: function(xhr){ xhr.setRequestHeader('Authorization', 'Bearer ' + app.utility.getToken());},
            success: function(response, status, jqXHR) {  
                app.main.showMessage('success', 'Successfully deleted guest.'); 
                getGuests();
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

    var previousPage = function() {
        page = page - 1;
        getGuests();
    }

    var nextPage = function() {
        page = page + 1;
        getGuests();
    }

    var goToPage = function(number) {
        page = number;
        getGuests();
    }

    return {
        init: init,
        previousPage: previousPage,
        nextPage: nextPage,
        goToPage: goToPage,
        editGuest: editGuest,
        saveGuest: saveGuest,
        openDeleteModal: openDeleteModal
    }
}();