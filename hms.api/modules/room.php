<?php

Flight::route('GET /rooms', function(){
    $auth = new Auth();
    $room = new RoomStorage();
    $request = Flight::request();  
    $token_data = $auth->is_jwt_valid($auth->getBearerToken());

    if($token_data[0])
    {
        $rooms = $room->get_rooms($request->query['page']);
        Flight::halt(200, json_encode($rooms));
    }

    Flight::halt(401, 'Unauthorized');
});

Flight::route('GET /rooms/@id', function($id){
    $data = array();
    $auth = new Auth();
    $room = new RoomStorage();
    $token_data = $auth->is_jwt_valid($auth->getBearerToken());

    if($token_data[0])
    {
        $data['data'] = $room->get_room($id);
        $data['room_categories'] = $room->get_room_categories();
        Flight::halt(200, json_encode($data));
    }

    Flight::halt(401, 'Unauthorized');
});

Flight::route('POST /rooms', function(){
    $auth = new Auth();
    $room = new RoomStorage();
    $request = Flight::request();
    $token_data = $auth->is_jwt_valid($auth->getBearerToken());
    
    if($token_data[0])
    {
        $room = $room->insert_room($request->data->getData());
        Flight::halt(200, json_encode($room));
    }

    Flight::halt(401, 'Unauthorized');
});

Flight::route('PUT /rooms/@id', function($id){
    $auth = new Auth();
    $room = new RoomStorage();
    $request = Flight::request();
    $token_data = $auth->is_jwt_valid($auth->getBearerToken());
    
    if($token_data[0])
    {
        $room = $room->update_room($id, $request->data->getData());
        Flight::halt(200, json_encode($room));
    }

    Flight::halt(401, 'Unauthorized');
});

Flight::route('DELETE /rooms/@id', function($id){
    $auth = new Auth();
    $room = new RoomStorage();
    $token_data = $auth->is_jwt_valid($auth->getBearerToken());

    if($token_data[0])
    {
        $room = $room->delete_room($id);
        Flight::halt(200, json_encode($room));
    }

    Flight::halt(401, 'Unauthorized');
});

?>