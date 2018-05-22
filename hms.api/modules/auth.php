<?php

Flight::route('POST /token', function(){
    $auth = new Auth();
    $user = new UserStorage();
    $request = Flight::request();        
    $user = $user->validate_user($request->data['username'], $request->data['password']);
    
    // If array is returned and there is data
    if(is_array($user) && count($user) > 0)    
    {
        $jwt = $auth->generate_jwt($user);
        
        $return_data = [
            'fullname' => $user['firstname'].' '.$user['lastname'],
            'token' => $jwt
        ];

        Flight::halt(200, json_encode($return_data));
    }

    Flight::halt(401, 'Unauthorized');    
});

?>