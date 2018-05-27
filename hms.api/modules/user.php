<?php

Flight::route('GET /users', function(){
    $auth = new Auth();
    $user = new UserStorage();
    $request = Flight::request();  
    $token_data = $auth->is_jwt_valid($auth->getBearerToken());

    if($token_data[0])
    {
        $users = $user->get_users($request->query['page']);
        Flight::halt(200, json_encode($users));
    }

    Flight::halt(401, 'Unauthorized');
});

Flight::route('GET /users/@id', function($id){
    $data = array();
    $auth = new Auth();
    $user = new UserStorage();
    $token_data = $auth->is_jwt_valid($auth->getBearerToken());

    if($token_data[0])
    {
        $data['data'] = $user->get_user($id);   
        $data['roles'] = $user->get_roles();     
        Flight::halt(200, json_encode($data));
    }

    Flight::halt(401, 'Unauthorized');
});

Flight::route('POST /users', function(){
    $auth = new Auth();
    $user = new UserStorage();
    $request = Flight::request();
    $token_data = $auth->is_jwt_valid($auth->getBearerToken());
    
    if($token_data[0])
    {
        $user = $user->insert_user($request->data->getData());
        Flight::halt(200, json_encode($user));
    }

    Flight::halt(401, 'Unauthorized');
});

Flight::route('PUT /users/@id', function($id){
    $auth = new Auth();
    $user = new UserStorage();
    $request = Flight::request();
    $token_data = $auth->is_jwt_valid($auth->getBearerToken());

    if($token_data[0])
    {
        $user = $user->update_user($id, $request->data->getData());
        Flight::halt(200, json_encode($user));
    }

    Flight::halt(401, 'Unauthorized');
});

Flight::route('PUT /users/@id/password', function($id){
    $auth = new Auth();
    $user = new UserStorage();
    $request = Flight::request();
    $token_data = $auth->is_jwt_valid($auth->getBearerToken());

    if($token_data[0])
    {
        $user = $user->update_user_password($id, $request->data->getData());
        Flight::halt(200, json_encode($user));
    }

    Flight::halt(401, 'Unauthorized');
});

Flight::route('DELETE /users/@id', function($id){
    $auth = new Auth();
    $user = new UserStorage();
    $token_data = $auth->is_jwt_valid($auth->getBearerToken());

    if($token_data[0])
    {
        $user = $user->delete_user($id);
        Flight::halt(200, json_encode($user));
    }

    Flight::halt(401, 'Unauthorized');
});

?>