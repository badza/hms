<?php

class UserStorage 
{
    private $config;
    private $database;

    public function __construct()
    {
        $this->config = include('config.php');
        $this->database = new Database();
    }

    public function validate_user($username, $password)
    {                      
        $hashed_password = password_hash('test123', PASSWORD_DEFAULT);
        $stmt = $this->database->handler->prepare('SELECT * FROM user WHERE username = :username');
        $stmt->execute(['username' => $username]);
        $user = $stmt->fetch();
        
        if(password_verify($password, $user['password']))
            return $user;
            
        return false;        
    }

    public function get_users($page)
    {
        $page_size = $this->config['page_size'];
        $starting_limit = ($page - 1) * $page_size;
        $stmt = $this->database->handler->prepare('SELECT * FROM user ORDER BY user_id DESC LIMIT :starting_limit, :page_size');
        $stmt->execute(['starting_limit' => $starting_limit, 'page_size' => $page_size]);
        $users = $stmt->fetchAll();        
        return $users;
    }

    public function get_user($id)
    {
        $stmt = $this->database->handler->prepare('SELECT * FROM user WHERE user_id = :id');
        $stmt->execute(['id' => $id]);
        $user = $stmt->fetch();        
        return $user;
    }

    public function insert_user($data)
    {
        $query = "";
        $query .= "INSERT INTO user (firstname, lastname, username, password, email, role_id) VALUES ";
        $query .= "(:firstname, :lastname, 'test', 'test', :email, :role_id)";
        $stmt = $this->database->handler->prepare($query);
        $stmt->execute($data);
        $stmt->fetch();
        return $this->database->handler->lastInsertId();
    }

    public function update_user($id, $data)
    {
        $data['id'] = $id;
        $query = "";
        $query .= "UPDATE user SET ";
        $query .= "firstname=:firstname,";
        $query .= "lastname=:lastname,";
        $query .= "email=:email,";
        $query .= "role_id=:role_id ";  
        $query .= "WHERE user_id = :id"; 
        
        $stmt = $this->database->handler->prepare($query);
        $stmt->execute($data);
        $stmt->fetch();
    }

    public function delete_user($id)
    {
        $stmt = $this->database->handler->prepare('DELETE FROM user WHERE user_id = :id');
        $stmt->execute(['id' => $id]);                
        $stmt->fetch();
    }
}

?>