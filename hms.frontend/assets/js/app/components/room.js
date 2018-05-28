var app = app || {};

app.room = function () {
    var page = 1;

    var init = function () {
        $('#room-form').validate({
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
        });

        getRooms();
    }

    var getRooms = function () {
        var html = '';

        $.ajax({
            url: app.config.getApiUrl() + 'rooms?page=' + page,
            type: 'GET',
            dataType: 'json',
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + app.utility.getToken()); },
            success: function (response, status, jqXHR) {
                html += buildTableHtml(response.data);
                html += buildPaginationHtml(response.page_count);
                $('#room-data-placeholder').html(html);
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

    var getRoom = function (id) {
        return $.ajax({
            url: app.config.getApiUrl() + 'rooms/' + id,
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
        html += '<table class="table table-striped table-responsive w-100 d-block d-md-table">';

        html += '<thead class="thead-dark">';
        html += '<tr>';
        html += '<td style="width: 50px;">';
        html += '#';
        html += '</td>';
        html += '<td>';
        html += 'Door Number';
        html += '</td>';
        html += '<td>';
        html += 'Category';
        html += '</td>';
        html += '<td>';
        html += 'Capacity';
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
            html += data[i].room_id;
            html += '</td>';
            html += '<td>';
            html += data[i].door_number;
            html += '</td>';
            html += '<td>';
            html += data[i].room_category;
            html += '</td>';
            html += '<td>';
            html += data[i].capacity;
            html += '</td>';
            html += '<td class="actions-column remove-width">';
            html += '<button class="btn btn-secondary" onclick="app.room.editRoom(' + data[i].room_id + ')" href="#"><i class="fas fa-pencil-alt"></i> Edit</button>';
            html += '<button class="btn btn-secondary" onclick="app.room.openDeleteModal(' + data[i].room_id + ')"><i class="far fa-trash-alt"></i> Delete</button>';
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
        html += '<button class="page-link previous-page" onclick="app.room.previousPage()">Previous</button>';
        html += '</li>';

        for (var i = 0; i < pageCount; i++) {
            html += '<li class="page-item ' + (page == i + 1 ? 'active' : '') + '">';
            html += '<button class="page-link page" onclick="app.room.goToPage(' + (i + 1) + ')">' + (i + 1) + '</button>';
            html += '</li>';
        }

        html += '<li class="page-item ' + (page == pageCount ? 'disabled' : '') + '">';
        html += '<button class="page-link next-page" onclick="app.room.nextPage()">Next</button>';
        html += '</li>';

        html += '</ul>';
        html += '</nav>';

        return html;
    }

    var openEditModal = function (title, room) {
        $('#edit-room-modal .modal-title').html(title);
        app.utility.clearForm($('#room-form'));
        fillRoomCategoriesDropdown(room.room_categories);

        if (room.data) {
            app.utility.formalizeObject(room.data, $('#room-form'));
            $('#edit-room-modal').modal('show');
        }
        else
            $('#edit-room-modal').modal('show');
    }

    var editRoom = function (id) {
        var title = id > 0 ? 'Edit Room' : 'Add Room';

        $.when(getRoom(id)).then(function (data) {
            openEditModal(title, data);
        });
    }

    var saveRoom = function()
    {
        var obj = app.utility.objectifyForm($('#room-form'));
        var type = obj.room_id > 0 ? 'PUT' : 'POST';
        var url = obj.room_id > 0 ? app.config.getApiUrl() + 'rooms/' + obj.room_id : app.config.getApiUrl() + 'rooms/';
        
        if($('#room-form').valid())
        {
            $.ajax({
                url: url,
                type: type,
                data: JSON.stringify(obj),
                contentType: 'application/json; charset=utf-8',
                dataType: 'json',
                beforeSend: function(xhr){ xhr.setRequestHeader('Authorization', 'Bearer ' + app.utility.getToken());},
                success: function(response, status, jqXHR) {  
                    app.main.showMessage('success', (obj.user_id > 0 ? 'Successfully edited room.' : 'Successfully added room.')); 
                    getRooms();
                },
                error: function(response) {
                    if(response.status == 401)
                    {
                        app.utility.removeLoginData();
                        app.router.navigate('login');
                    }
                },
                complete: function() {                
                    $('#edit-room-modal').modal('hide');
                    //app.main.showLoading(false);
                }
            });
        }
    }

    var openDeleteModal = function(id)
    {
        app.main.showConfirmation('Deleting room', 'Are you sure that you want to delete selected room?', deleteRoom, id);
    }

    var deleteRoom = function(id)
    {
        var url = app.config.getApiUrl() + 'rooms/' + id;

        $.ajax({
            url: url,
            type: 'DELETE',
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            beforeSend: function(xhr){ xhr.setRequestHeader('Authorization', 'Bearer ' + app.utility.getToken());},
            success: function(response, status, jqXHR) {  
                app.main.showMessage('success', 'Successfully deleted room.'); 
                getRooms();
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

    var fillRoomCategoriesDropdown = function (roomCategories) {
        var html = '';

        for (var i = 0; i < roomCategories.length; i++)
            html += '<option value="' + roomCategories[i].room_category_id + '">' + roomCategories[i].name + '</option>';

        $('#room_category_id').html(html);
    }

    var previousPage = function() {
        page = page - 1;
        getRooms();
    }

    var nextPage = function() {
        page = page + 1;
        getRooms();
    }

    var goToPage = function(number) {
        page = number;
        getRooms();
    }

    return {
        init: init,
        previousPage: previousPage,
        nextPage: nextPage,
        goToPage: goToPage,
        editRoom: editRoom,
        saveRoom: saveRoom,
        openDeleteModal: openDeleteModal
    }
}();