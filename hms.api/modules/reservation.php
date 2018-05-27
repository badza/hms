<?php

Flight::route('GET /reservations', function(){
    $auth = new Auth();
    $reservation = new ReservationStorage();
    $request = Flight::request();  
    $token_data = $auth->is_jwt_valid($auth->getBearerToken());

    if($token_data[0])
    {
        $reservations = $reservation->get_reservations($request->query['page'], $request->query['searchStr'], $request->query['status']);
        Flight::halt(200, json_encode($reservations));
    }

    Flight::halt(401, 'Unauthorized');
});

Flight::route('GET /reservations/@id', function($id){
    $data = array();
    $auth = new Auth();
    $reservation = new ReservationStorage();
    $room_rate = new RoomRateStorage();
    $token_data = $auth->is_jwt_valid($auth->getBearerToken());

    if($token_data[0])
    {
        $data['data'] = $reservation->get_reservation($id);
        $data['rooms'] = $room_rate->get_rooms();
        $data['meal_options'] = $room_rate->get_meal_options();
        $data['guests'] = $reservation->get_guests();
        Flight::halt(200, json_encode($data));
    }

    Flight::halt(401, 'Unauthorized');
});

Flight::route('POST /reservations', function(){
    $auth = new Auth();
    $reservation = new ReservationStorage();
    $request = Flight::request();
    $token_data = $auth->is_jwt_valid($auth->getBearerToken());
    
    if($token_data[0])
    {
        $reservation = $reservation->insert_reservation($request->data->getData());
        Flight::halt(200, json_encode($reservation));
    }

    Flight::halt(401, 'Unauthorized');
});

Flight::route('PUT /reservations/@id', function($id){
    $auth = new Auth();
    $reservation = new ReservationStorage();
    $request = Flight::request();
    $token_data = $auth->is_jwt_valid($auth->getBearerToken());
    
    if($token_data[0])
    {
        $reservation = $reservation->update_reservation($id, $request->data->getData());
        Flight::halt(200, json_encode($reservation));
    }

    Flight::halt(401, 'Unauthorized');
});

Flight::route('PUT /reservations/@id/cancel', function($id){
    $auth = new Auth();
    $reservation = new ReservationStorage();
    $request = Flight::request();
    $token_data = $auth->is_jwt_valid($auth->getBearerToken());
    
    if($token_data[0])
    {
        $reservation = $reservation->cancel_reservation($id);
        Flight::halt(200, json_encode($reservation));
    }

    Flight::halt(401, 'Unauthorized');
});

Flight::route('PUT /reservations/@id/check_in', function($id){
    $auth = new Auth();
    $reservation = new ReservationStorage();
    $request = Flight::request();
    $token_data = $auth->is_jwt_valid($auth->getBearerToken());
    
    if($token_data[0])
    {
        $reservation = $reservation->check_in($id);
        Flight::halt(200, json_encode($reservation));
    }

    Flight::halt(401, 'Unauthorized');
});

Flight::route('PUT /reservations/@id/check_out', function($id){
    $auth = new Auth();
    $reservation = new ReservationStorage();
    $request = Flight::request();
    $token_data = $auth->is_jwt_valid($auth->getBearerToken());
    
    if($token_data[0])
    {
        $reservation = $reservation->check_out($id);
        Flight::halt(200, json_encode($reservation));
    }

    Flight::halt(401, 'Unauthorized');
});

Flight::route('DELETE /reservations/@id', function($id){
    $auth = new Auth();
    $guest = new GuestStorage();
    $token_data = $auth->is_jwt_valid($auth->getBearerToken());

    if($token_data[0])
    {
        $guest = $guest->delete_guest($id);
        Flight::halt(200, json_encode($guest));
    }

    Flight::halt(401, 'Unauthorized');
});

?>