<?php

Flight::route('GET /guests', function(){
    $auth = new Auth();
    $guest = new GuestStorage();
    $request = Flight::request();  
    $token_data = $auth->is_jwt_valid($auth->getBearerToken());

    if($token_data[0])
    {
        $guests = $guest->get_guests($request->query['page']);
        Flight::halt(200, json_encode($guests));
    }

    Flight::halt(401, 'Unauthorized');
});

Flight::route('GET /guests/@id', function($id){
    $auth = new Auth();
    $guest = new GuestStorage();
    $token_data = $auth->is_jwt_valid($auth->getBearerToken());

    if($token_data[0])
    {
        $guest = $guest->get_guest($id);
        Flight::halt(200, json_encode($guest));
    }

    Flight::halt(401, 'Unauthorized');
});

Flight::route('POST /rooms', function(){
    $auth = new Auth();
    $guest = new GuestStorage();
    $request = Flight::request();
    $token_data = $auth->is_jwt_valid($auth->getBearerToken());
    
    if($token_data[0])
    {
        $guest = $guest->insert_guest($request->data->getData());
        Flight::halt(200, json_encode($guest));
    }

    Flight::halt(401, 'Unauthorized');
});

Flight::route('PUT /guests/@id', function($id){
    $auth = new Auth();
    $guest = new GuestStorage();
    $request = Flight::request();
    $token_data = $auth->is_jwt_valid($auth->getBearerToken());
    
    if($token_data[0])
    {
        $guest = $guest->update_guest($id, $request->data->getData());
        Flight::halt(200, json_encode($guest));
    }

    Flight::halt(401, 'Unauthorized');
});

Flight::route('DELETE /guests/@id', function($id){
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