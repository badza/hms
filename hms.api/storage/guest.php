<?php

class GuestStorage 
{
    private $config;
    private $database;

    public function __construct()
    {
        $this->config = include('config.php');
        $this->database = new Database();
    }

    public function get_guests($page)
    {
        $page_size = $this->config['page_size'];
        $starting_limit = ($page - 1) * $page_size;
        $stmt = $this->database->handler->prepare('SELECT * FROM guest ORDER BY guest_id DESC LIMIT :starting_limit, :page_size');
        $stmt->execute(['starting_limit' => $starting_limit, 'page_size' => $page_size]);
        $rooms = $stmt->fetchAll();        
        return $rooms;
    }

    public function get_guest($id)
    {
        $stmt = $this->database->handler->prepare('SELECT * FROM guest WHERE guest_id = :id');
        $stmt->execute(['id' => $id]);
        $user = $stmt->fetch();        
        return $user;
    }

    public function insert_guest($data)
    {
        $query = "";
        $query .= "INSERT INTO room (firstname, lastname, address, city, phone_no, email) VALUES ";
        $query .= "(:firstname, :lastname, :address, :city, :phone_no, :email)";
        $stmt = $this->database->handler->prepare($query);
        $stmt->execute($data);
        $stmt->fetch();
        return $this->database->handler->lastInsertId();
    }

    public function update_guest($id, $data)
    {
        $data['id'] = $id;
        $query = "";
        $query .= "UPDATE guest SET ";
        $query .= "firstname=:firstname,";
        $query .= "lastname=:lastname,";
        $query .= "address=:address,";
        $query .= "city=:city,";  
        $query .= "phone_no=:phone_no,";  
        $query .= "email=:email ";  
        $query .= "WHERE guest_id = :id"; 
        
        $stmt = $this->database->handler->prepare($query);
        $stmt->execute($data);
        $stmt->fetch();
    }

    public function delete_guest($id)
    {
        $stmt = $this->database->handler->prepare('DELETE FROM guest WHERE guest_id = :id');
        $stmt->execute(['id' => $id]);                
        $stmt->fetch();
    }
}