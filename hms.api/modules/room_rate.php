<?php

Flight::route('GET /roomrates', function(){
    $auth = new Auth();
    $room = new RoomRateStorage();
    $request = Flight::request();  
    $token_data = $auth->is_jwt_valid($auth->getBearerToken());

    if($token_data[0])
    {
        $room_rates = $room->get_room_rates($request->query['page']);
        Flight::halt(200, json_encode($room_rates));
    }

    Flight::halt(401, 'Unauthorized');
});

Flight::route('GET /roomrates/calculate', function(){
    $auth = new Auth();
    $room = new RoomRateStorage();
    $request = Flight::request();  
    $token_data = $auth->is_jwt_valid($auth->getBearerToken());

    if($token_data[0])
    {
        $room_rates = $room->calculate_room_rate($request->query['room_id'], $request->query['meal_option_id'], $request->query['adult_count'], $request->query['days']);
        Flight::halt(200, json_encode($room_rates));
    }

    Flight::halt(401, 'Unauthorized');
});

Flight::route('GET /roomrates/@id', function($id){
    $data = array();
    $auth = new Auth();
    $room = new RoomRateStorage();
    $token_data = $auth->is_jwt_valid($auth->getBearerToken());

    if($token_data[0])
    {
        $data['data'] = $room->get_room_rate($id);
        $data['rooms'] = $room->get_rooms();
        $data['meal_options'] = $room->get_meal_options();
        Flight::halt(200, json_encode($data));
    }

    Flight::halt(401, 'Unauthorized');
});

Flight::route('POST /roomrates', function(){
    $auth = new Auth();
    $room = new RoomRateStorage();
    $request = Flight::request();
    $token_data = $auth->is_jwt_valid($auth->getBearerToken());
    
    if($token_data[0])
    {
        $room = $room->insert_room_rate($request->data->getData());
        Flight::halt(200, json_encode($room));
    }

    Flight::halt(401, 'Unauthorized');
});

Flight::route('PUT /roomrates/@id', function($id){
    $auth = new Auth();
    $room = new RoomRateStorage();
    $request = Flight::request();
    $token_data = $auth->is_jwt_valid($auth->getBearerToken());
    
    if($token_data[0])
    {
        $room = $room->update_room_rate($id, $request->data->getData());
        Flight::halt(200, json_encode($room));
    }

    Flight::halt(401, 'Unauthorized');
});

Flight::route('DELETE /roomrates/@id', function($id){
    $auth = new Auth();
    $room = new RoomRateStorage();
    $token_data = $auth->is_jwt_valid($auth->getBearerToken());

    if($token_data[0])
    {
        $room = $room->delete_room_rate($id);
        Flight::halt(200, json_encode($room));
    }

    Flight::halt(401, 'Unauthorized');
});

?>