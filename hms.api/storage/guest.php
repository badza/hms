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
        $data = array();
        $query = "";
        $query .= "SELECT guest_id, firstname, lastname, address, city, phone_no, email, points ";
        $query .= "FROM guest ";        
        $query .= "ORDER BY guest_id DESC ";
        $query .= "LIMIT :starting_limit, :page_size";
        $page_size = $this->config['page_size'];

        // Getting row count and pages, for paging
        $stmt_row_count = $this->database->handler->prepare("SELECT COUNT(*) FROM guest");
        $stmt_row_count->execute();
        $row_count = $stmt_row_count->fetchColumn();
        $page_count = ceil($row_count/$page_size);

        $starting_limit = ($page - 1) * $page_size;
        $stmt = $this->database->handler->prepare($query);
        $stmt->execute(['starting_limit' => $starting_limit, 'page_size' => $page_size]);
        $guests = $stmt->fetchAll(); 
        $data['data'] = $guests;
        $data['row_count'] = $row_count;
        $data['page_count'] = $page_count; 

        return $data;
    }

    public function get_guest($id)
    {
        $stmt = $this->database->handler->prepare('SELECT guest_id, firstname, lastname, address, city, phone_no, email FROM guest WHERE guest_id = :id');
        $stmt->execute(['id' => $id]);
        $user = $stmt->fetch();        
        return $user;
    }

    public function insert_guest($data)
    {
        unset($data['guest_id']);
        $query = "";
        $query .= "INSERT INTO guest (firstname, lastname, address, city, phone_no, email) VALUES ";
        $query .= "(:firstname, :lastname, :address, :city, :phone_no, :email)";
        $stmt = $this->database->handler->prepare($query);
        $stmt->execute($data);
        //$stmt->fetch();
        return $this->database->handler->lastInsertId();
    }

    public function update_guest($id, $data)
    {
        $data['guest_id'] = $id;
        $query = "";
        $query .= "UPDATE guest SET ";
        $query .= "firstname=:firstname,";
        $query .= "lastname=:lastname,";
        $query .= "address=:address,";
        $query .= "city=:city,";  
        $query .= "phone_no=:phone_no,";  
        $query .= "email=:email ";  
        $query .= "WHERE guest_id = :guest_id"; 
        
        $stmt = $this->database->handler->prepare($query);
        $stmt->execute($data);
        //$stmt->fetch();
    }

    public function delete_guest($id)
    {
        $stmt = $this->database->handler->prepare('DELETE FROM guest WHERE guest_id = :id');
        $stmt->execute(['id' => $id]);                
        //$stmt->fetch();
    }
}