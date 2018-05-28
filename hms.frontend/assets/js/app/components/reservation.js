var app = app || {};

app.reservations = function () {
    var searchStr = '';
    var status = 'upcoming';
    var page = 1;
    var from;
    var to;

    var init = function () {
        $('#reservation-form').validate({
            rules: {
                room_id: 'required',
                meal_option_id: 'required',
                guest_id: 'required',
                from_date: 'required',
                to_date: 'required',
                adult_count: 'required'
            },
            messages: {
                room_id: 'Room is required.',
                meal_option_id: 'Meal is required.',
                guest_id: 'Guest is required.',
                from_date: 'From is required.',
                to_date: 'To is required.',
                adult_count: 'Adult count is required.'
            }
        });

        from = $("#from_date").datepicker({
                defaultDate: "+1w",
                changeMonth: true,
                numberOfMonths: 1
            })
            .on("change", function () {                
                to.datepicker("option", "minDate", getDate(this));
                calculateRoomRate();
            });

        to = $("#to_date").datepicker({
            defaultDate: "+1w",
            changeMonth: true,
            numberOfMonths: 1
        }).on("change", function () {
                from.datepicker("option", "maxDate", getDate(this));
                calculateRoomRate();
            });
            
        $('#room_id, #meal_option_id, #adult_count').on('change', function() {
            calculateRoomRate();
        });

        $('#status').on('change', function() {
            status = $(this).val();
            getReservations();
        });

        var searchTimeout;

        $("#search-reservation").keyup(function () {
            var $this = $(this);
            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }
            searchTimeout = setTimeout(function () {
                searchStr = $this.val();
                getReservations();
            }, 1500);
        });

        getReservations();
    }

    var getDate = function (element) {
        var date;
        try {
            date = $.datepicker.parseDate("mm/dd/yy", element.value);
        } catch (error) {
            date = null;
        }

        return date;
    }

    var getDaysBetween = function(from, to) {
        if(from && to)
        {
            // The number of milliseconds in one day
            var ONE_DAY = 1000 * 60 * 60 * 24
        
            // Convert both dates to milliseconds
            var date1_ms = from.getTime()
            var date2_ms = to.getTime()
        
            // Calculate the difference in milliseconds
            var difference_ms = Math.abs(date1_ms - date2_ms)
        
            // Convert back to days and return
            return Math.round(difference_ms/ONE_DAY);    
        }

        return 0;
    }

    var getReservations = function () {
        var html = '';
        
        $.ajax({
            url: app.config.getApiUrl() + 'reservations?page=' + page + '&searchStr=' + searchStr + '&status=' + status,
            type: 'GET',
            dataType: 'json',
            beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + app.utility.getToken()); },
            success: function (response, status, jqXHR) {
                html += buildTableHtml(response.data);
                html += buildPaginationHtml(response.page_count);
                $('#reservation-data-placeholder').html(html);
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

    var getReservation = function (id) {
        return $.ajax({
            url: app.config.getApiUrl() + 'reservations/' + id,
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
        html += 'Guest';
        html += '</td>';
        html += '<td>';
        html += 'From';
        html += '</td>';
        html += '<td>';
        html += 'To';
        html += '</td>';
        html += '<td>';
        html += 'Checked In';
        html += '</td>';
        html += '<td>';
        html += 'Checked Out';
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
            html += data[i].room_reservation_id;
            html += '</td>';
            html += '<td>';
            html += data[i].guest_name;
            html += '</td>';
            html += '<td>';
            html += new Date(data[i].from_date).toLocaleDateString('en-US');
            html += '</td>';
            html += '<td>';
            html += new Date(data[i].to_date).toLocaleDateString('en-US');
            html += '</td>';
            html += '<td>';
            html += data[i].checked_in ? data[i].checked_in : '';
            html += '</td>';
            html += '<td>';
            html += data[i].checked_out ? data[i].checked_out : '';
            html += '</td>';
            html += '<td class="actions-column" style="width: 450px;">';
            html += '<button class="btn btn-secondary" onclick="app.reservations.editReservation(' + data[i].room_reservation_id + ')" href="#"><i class="fas fa-pencil-alt"></i> Edit</button>';            
            html += '<button class="btn btn-danger" onclick="app.reservations.cancelReservationConfirmation(' + data[i].room_reservation_id + ')"><i class="fas fa-ban"></i> Cancel</button>';
            html += '<button class="btn btn-primary" onclick="app.reservations.checkInConfirmation(' + data[i].room_reservation_id + ')"><i class="fas fa-user-check"></i> Check-In</button>';
            html += '<button class="btn btn-primary" onclick="app.reservations.checkOutConfirmation(' + data[i].room_reservation_id + ')"><i class="fas fa-sign-out-alt"></i> Check-Out</button>';
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
        html += '<button class="page-link previous-page" onclick="app.reservations.previousPage()">Previous</button>';
        html += '</li>';

        for (var i = 0; i < pageCount; i++) {
            html += '<li class="page-item ' + (page == i + 1 ? 'active' : '') + '">';
            html += '<button class="page-link page" onclick="app.reservations.goToPage(' + (i + 1) + ')">' + (i + 1) + '</button>';
            html += '</li>';
        }

        html += '<li class="page-item ' + (page == pageCount ? 'disabled' : '') + '">';
        html += '<button class="page-link next-page" onclick="app.reservations.nextPage()">Next</button>';
        html += '</li>';

        html += '</ul>';
        html += '</nav>';

        return html;
    }

    var openEditModal = function (title, reservation) {
        $('#edit-reservation-modal .modal-title').html(title);
        app.utility.clearForm($('#reservation-form'));
        fillRooms(reservation.rooms);
        fillGuests(reservation.guests);        
        fillMealOptions(reservation.meal_options);

        if (reservation.data) {
            app.utility.formalizeObject(reservation.data, $('#reservation-form'));
            $('#edit-reservation-modal').modal('show');
        }
        else
            $('#edit-reservation-modal').modal('show');
    }

    var editReservation = function (id) {
        var title = id > 0 ? 'Edit Reservation' : 'Create New Reservation';

        $.when(getReservation(id)).then(function (data) {
            openEditModal(title, data);
        });
    }

    var saveReservation = function() {
        var obj = app.utility.objectifyForm($('#reservation-form'));
        var type = obj.room_reservation_id > 0 ? 'PUT' : 'POST';
        var url = obj.room_reservation_id > 0 ? app.config.getApiUrl() + 'reservations/' + obj.room_reservation_id : app.config.getApiUrl() + 'reservations/';
        
        if($('#reservation-form').valid())
        {
            $.ajax({
                url: url,
                type: type,
                data: JSON.stringify(obj),
                contentType: 'application/json; charset=utf-8',
                dataType: 'json',
                beforeSend: function(xhr){ xhr.setRequestHeader('Authorization', 'Bearer ' + app.utility.getToken());},
                success: function(response, status, jqXHR) {  
                    app.main.showMessage('success', (obj.room_reservation_id > 0 ? 'Successfully edited reservation.' : 'Successfully added reservation.')); 
                    getReservations();
                },
                error: function(response) {
                    if(response.status == 401)
                    {
                        app.utility.removeLoginData();
                        app.router.navigate('login');
                    }
                },
                complete: function() {                
                    $('#edit-reservation-modal').modal('hide');
                    //app.main.showLoading(false);
                }
            });
        }
    }

    var calculateRoomRate = function()
    {
        var obj = app.utility.objectifyForm($('#reservation-form'));
        var url = app.config.getApiUrl() + 'roomrates/calculate';

        $.ajax({
            url: url,
            type: 'GET',
            data: { room_id: obj.room_id, meal_option_id: obj.meal_option_id, adult_count: obj.adult_count, days: getDaysBetween(from.datepicker("getDate"), to.datepicker("getDate")) },
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            beforeSend: function(xhr){ xhr.setRequestHeader('Authorization', 'Bearer ' + app.utility.getToken());},
            success: function(response, status, jqXHR) {  
                $('#calculated_price').val(response);
            },
            error: function(response) {
                if(response.status == 401)
                {
                    app.utility.removeLoginData();
                    app.router.navigate('login');
                }
            },
            complete: function() {                

            }
        });
    }

    var cancelReservationConfirmation = function(id)
    {
        app.main.showConfirmation('Canceling reservation', 'Are you sure that you want to cancel selected reservation?', cancelReservation, id);
    }

    var cancelReservation = function(id)
    {
        var url = app.config.getApiUrl() + 'reservations/' + id + '/cancel';

        $.ajax({
            url: url,
            type: 'PUT',            
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            beforeSend: function(xhr){ xhr.setRequestHeader('Authorization', 'Bearer ' + app.utility.getToken());},
            success: function(response, status, jqXHR) {  
                getReservations();
            },
            error: function(response) {
                if(response.status == 401)
                {
                    app.utility.removeLoginData();
                    app.router.navigate('login');
                }
            },
            complete: function() {                

            }
        });
    }

    var checkInConfirmation = function(id)
    {
        app.main.showConfirmation('Check-In', 'Are you sure that you want to check-in selected guest?', checkInReservation, id);
    }

    var checkInReservation = function(id)
    {
        var url = app.config.getApiUrl() + 'reservations/' + id + '/check_in';

        $.ajax({
            url: url,
            type: 'PUT',            
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            beforeSend: function(xhr){ xhr.setRequestHeader('Authorization', 'Bearer ' + app.utility.getToken());},
            success: function(response, status, jqXHR) {  
                getReservations();
            },
            error: function(response) {
                if(response.status == 401)
                {
                    app.utility.removeLoginData();
                    app.router.navigate('login');
                }
            },
            complete: function() {                

            }
        });
    }

    var checkOutConfirmation = function(id)
    {
        app.main.showConfirmation('Check-Out', 'Are you sure that you want to check-out selected guest?', checkOutReservation, id);
    }

    var checkOutReservation = function(id)
    {
        var url = app.config.getApiUrl() + 'reservations/' + id + '/check_out';

        $.ajax({
            url: url,
            type: 'PUT',            
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            beforeSend: function(xhr){ xhr.setRequestHeader('Authorization', 'Bearer ' + app.utility.getToken());},
            success: function(response, status, jqXHR) {  
                getReservations();
            },
            error: function(response) {
                if(response.status == 401)
                {
                    app.utility.removeLoginData();
                    app.router.navigate('login');
                }
            },
            complete: function() {                

            }
        });
    }

    var fillRooms = function (rooms) {
        var html = '';

        for (var i = 0; i < rooms.length; i++)
            html += '<option value="' + rooms[i].room_id + '">' + rooms[i].name + '</option>';

        $('#room_id').html(html);
    }

    var fillGuests = function (guests) {
        var html = '';

        for (var i = 0; i < guests.length; i++)
            html += '<option value="' + guests[i].guest_id + '">' + guests[i].name + '</option>';

        $('#guest_id').html(html);
    }

    var fillMealOptions = function (mealOptions) {
        var html = '';

        for (var i = 0; i < mealOptions.length; i++)
            html += '<option value="' + mealOptions[i].meal_option_id + '">' + mealOptions[i].name + '</option>';

        $('#meal_option_id').html(html);
    }

    var previousPage = function() {
        page = page - 1;
        getReservations();
    }

    var nextPage = function() {
        page = page + 1;
        getReservations();
    }

    var goToPage = function(number) {
        page = number;
        getReservations();
    }

    return {
        init: init,
        editReservation: editReservation,
        saveReservation: saveReservation,
        cancelReservationConfirmation: cancelReservationConfirmation,
        checkInConfirmation: checkInConfirmation,
        checkOutConfirmation: checkOutConfirmation,
        previousPage: previousPage,
        nextPage: nextPage,
        goToPage: goToPage
    }
}();