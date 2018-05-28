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
        $data = array();
        $query = "";
        $query .= "SELECT user_id, firstname, lastname, username, email, r.name AS role ";
        $query .= "FROM user ";
        $query .= "INNER JOIN role AS r ON r.role_id = user.role_id ";
        $query .= "ORDER BY user_id DESC ";
        $query .= "LIMIT :starting_limit, :page_size";
        $page_size = $this->config['page_size'];

        // Getting row count and pages, for paging
        $stmt_row_count = $this->database->handler->prepare("SELECT COUNT(*) FROM user");
        $stmt_row_count->execute();
        $row_count = $stmt_row_count->fetchColumn();
        $page_count = ceil($row_count/$page_size);
        
        // Executing real query
        $starting_limit = ($page - 1) * $page_size;
        $stmt = $this->database->handler->prepare($query);
        $stmt->execute(['starting_limit' => $starting_limit, 'page_size' => $page_size]);
        $users = $stmt->fetchAll(); 
        $data['data'] = $users;
        $data['row_count'] = $row_count;
        $data['page_count'] = $page_count;

        return $data;
    }

    public function get_user($id)
    {
        $query = "";
        $query .= "SELECT user_id, firstname, lastname, username, email, r.role_id, r.name AS role ";
        $query .= "FROM user ";
        $query .= "INNER JOIN role AS r ON r.role_id = user.role_id ";
        $query .= "WHERE user_id = :id";

        $stmt = $this->database->handler->prepare($query);
        $stmt->execute(['id' => $id]);
        $user = $stmt->fetch();        
        return $user;
    }

    public function insert_user($data)
    {
        // PDO complains if there are unused parameters, so we are removing additional parameters
        unset($data['user_id']);

        $query = "";
        $query .= "INSERT INTO user (firstname, lastname, username, password, email, role_id) VALUES ";
        $query .= "(:firstname, :lastname, :username, 'test', :email, :role_id)";
        $stmt = $this->database->handler->prepare($query);
        $stmt->execute($data);
        //$stmt->fetch();
        return $this->database->handler->lastInsertId();
    }

    public function update_user($id, $data)
    {
        // PDO complains if there are unused parameters, so we are renaming some parameters
        $data['user_id'] = $id;

        $query = "";
        $query .= "UPDATE user SET ";
        $query .= "firstname=:firstname,";
        $query .= "lastname=:lastname,";
        $query .= "username=:username,";
        $query .= "email=:email,";
        $query .= "role_id=:role_id ";  
        $query .= "WHERE user_id =:user_id"; 
        
        $stmt = $this->database->handler->prepare($query);
        $stmt->execute($data);
        //$stmt->fetch();
    }

    public function update_user_password($id, $data)
    {    
        unset($data['username']);   
        unset($data['confirm_password']);        
        $hashed_password = password_hash($data['password'], PASSWORD_DEFAULT);
        $data['user_id'] = $id;        
        $data['password'] = $hashed_password;
        $query = "";
        $query .= "UPDATE user SET ";
        $query .= "password=:password ";
        $query .= "WHERE user_id =:user_id"; 
        $stmt = $this->database->handler->prepare($query);
        $stmt->execute($data);
        //$stmt->fetch();
    }

    public function delete_user($id)
    {
        $stmt = $this->database->handler->prepare('DELETE FROM user WHERE user_id = :id');
        $stmt->execute(['id' => $id]);                
        //$stmt->fetch();
    }

    public function get_roles()
    {
        $stmt = $this->database->handler->prepare('SELECT * FROM role ORDER BY role_id DESC');
        $stmt->execute();
        return $stmt->fetchAll();
    }
}

?>