var app = app || {};

app.roomRates = function () {
    var page = 1;

    var init = function () {
        /*$('#room-rate-form').validate({
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

        getRoomRates();
    }

    var getRoomRates = function () {
        var html = '';

        $.ajax({
            url: app.config.getApiUrl() + 'roomrates?page=' + page,
            type: 'GET',
            dataType: 'json',
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + app.utility.getToken()); },
            success: function (response, status, jqXHR) {
                html += buildTableHtml(response.data);
                html += buildPaginationHtml(response.page_count);
                $('#room-rate-data-placeholder').html(html);
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

    var getRoomRate = function (id) {
        return $.ajax({
            url: app.config.getApiUrl() + 'roomrates/' + id,
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
        var current_door_number = '';

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
        html += '<td>';
        html += 'Meal Option';
        html += '</td>';
        html += '<td>';
        html += 'Price per Adult';
        html += '</td>';
        html += '<td style="width:200px;">';
        html += 'Actions';
        html += '</td>';
        html += '</tr>';
        html += '</thead>'

        html += '<tbody>';
        for (var i = 0; i < data.length; i++) {
            if (current_door_number != data[i].door_number) {
                html += '<tr class="subheader">';
                html += '<td colspan="7">';
                html += 'Room #' + data[i].door_number;
                html += '</td>';
                html += '</tr>';
                current_door_number = data[i].door_number;
            }

            html += '<tr>';
            html += '<td>';
            html += data[i].room_rate_id;
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
            html += '<td>';
            html += data[i].meal_option;
            html += '</td>';
            html += '<td>';
            html += data[i].price_per_adult;
            html += '</td>';
            html += '<td class="actions-column remove-width">';
            html += '<button class="btn btn-secondary" onclick="app.roomRates.editRoomRate(' + data[i].room_rate_id + ')" href="#"><i class="fas fa-pencil-alt"></i> Edit</button>';
            html += '<button class="btn btn-secondary" onclick="app.roomRates.openDeleteModal(' + data[i].room_rate_id + ')"><i class="far fa-trash-alt"></i> Delete</button>';
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
        html += '<button class="page-link previous-page" onclick="app.roomRates.previousPage()">Previous</button>';
        html += '</li>';

        for (var i = 0; i < pageCount; i++) {
            html += '<li class="page-item ' + (page == i + 1 ? 'active' : '') + '">';
            html += '<button class="page-link page" onclick="app.roomRates.goToPage(' + (i + 1) + ')">' + (i + 1) + '</button>';
            html += '</li>';
        }

        html += '<li class="page-item ' + (page == pageCount ? 'disabled' : '') + '">';
        html += '<button class="page-link next-page" onclick="app.roomRates.nextPage()">Next</button>';
        html += '</li>';

        html += '</ul>';
        html += '</nav>';

        return html;
    }

    var openEditModal = function (title, roomRate) {
        $('#edit-room-rate-modal .modal-title').html(title);
        app.utility.clearForm($('#room-rate-form'));
        fillMealOptions(roomRate.meal_options);
        fillRooms(roomRate.rooms);
        console.log(roomRate.data);
        if (roomRate.data) {
            app.utility.formalizeObject(roomRate.data, $('#room-rate-form'));
            $('#edit-room-rate-modal').modal('show');
        }
        else
            $('#edit-room-rate-modal').modal('show');
    }

    var editRoomRate = function (id) {
        var title = id > 0 ? 'Edit Room Rate' : 'Add Room Rate';

        $.when(getRoomRate(id)).then(function (data) {
            openEditModal(title, data);
        });
    }

    var saveRoomRate = function () {
        var obj = app.utility.objectifyForm($('#room-rate-form'));
        var type = obj.room_rate_id > 0 ? 'PUT' : 'POST';
        var url = obj.room_rate_id > 0 ? app.config.getApiUrl() + 'roomrates/' + obj.room_rate_id : app.config.getApiUrl() + 'roomrates/';

        if ($('#room-rate-form').valid()) {
            $.ajax({
                url: url,
                type: type,
                data: JSON.stringify(obj),
                contentType: 'application/json; charset=utf-8',
                dataType: 'json',
                beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + app.utility.getToken()); },
                success: function (response, status, jqXHR) {
                    app.main.showMessage('success', (obj.room_rate_id > 0 ? 'Successfully edited room rate.' : 'Successfully added room rate.'));
                    getRoomRates();
                },
                error: function (response) {
                    if (response.status == 401) {
                        app.utility.removeLoginData();
                        app.router.navigate('login');
                    }
                },
                complete: function () {
                    $('#edit-room-rate-modal').modal('hide');
                    //app.main.showLoading(false);
                }
            });
        }
    }

    var openDeleteModal = function (id) {
        app.main.showConfirmation('Deleting room rate', 'Are you sure that you want to delete selected room rate?', deleteRoomRate, id);
    }

    var deleteRoomRate = function (id) {
        var url = app.config.getApiUrl() + 'roomrates/' + id;

        $.ajax({
            url: url,
            type: 'DELETE',
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + app.utility.getToken()); },
            success: function (response, status, jqXHR) {
                app.main.showMessage('success', 'Successfully deleted room rate.');
                getRoomRates();
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

    var fillMealOptions = function (mealOptions) {
        var html = '';

        for (var i = 0; i < mealOptions.length; i++)
            html += '<option value="' + mealOptions[i].meal_option_id + '">' + mealOptions[i].name + '</option>';

        $('#meal_option_id').html(html);
    }

    var fillRooms = function (rooms) {
        var html = '';

        for (var i = 0; i < rooms.length; i++)
            html += '<option value="' + rooms[i].room_id + '">' + rooms[i].name + '</option>';

        $('#room_id').html(html);
    }

    var previousPage = function () {
        page = page - 1;
        getRoomRates();
    }

    var nextPage = function () {
        page = page + 1;
        getRoomRates();
    }

    var goToPage = function (number) {
        page = number;
        getRoomRates();
    }

    return {
        init: init,
        previousPage: previousPage,
        nextPage: nextPage,
        goToPage: goToPage,
        editRoomRate: editRoomRate,
        saveRoomRate: saveRoomRate,
        openDeleteModal: openDeleteModal
    }
}();