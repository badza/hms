<?php

class RoomStorage 
{
    private $config;
    private $database;

    public function __construct()
    {
        $this->config = include('config.php');
        $this->database = new Database();
    }

    public function get_rooms($page)
    {
        $data = array();
        $query = "";
        $query .= "SELECT room_id, door_number, rc.name as room_category, CONCAT(capacity_adults, ' Adult(s), ', capacity_children, ' Children ') AS capacity ";
        $query .= "FROM room ";
        $query .= "INNER JOIN room_category AS rc ON rc.room_category_id = room.room_category_id ";
        $query .= "ORDER BY room_id DESC ";
        $query .= "LIMIT :starting_limit, :page_size";
        $page_size = $this->config['page_size'];

        // Getting row count and pages, for paging
        $stmt_row_count = $this->database->handler->prepare("SELECT COUNT(*) FROM room");
        $stmt_row_count->execute();
        $row_count = $stmt_row_count->fetchColumn();
        $page_count = ceil($row_count/$page_size);

        $starting_limit = ($page - 1) * $page_size;
        $stmt = $this->database->handler->prepare($query);
        $stmt->execute(['starting_limit' => $starting_limit, 'page_size' => $page_size]);
        $rooms = $stmt->fetchAll(); 
        $data['data'] = $rooms;
        $data['row_count'] = $row_count;
        $data['page_count'] = $page_count; 

        return $data;
    }

    public function get_room($id)
    {
        $stmt = $this->database->handler->prepare('SELECT * FROM room WHERE room_id = :id');
        $stmt->execute(['id' => $id]);
        $room = $stmt->fetch();        
        return $room;
    }    

    public function insert_room($data)
    {
        // PDO complains if there are unused parameters, so we are removing additional parameters
        unset($data['room_id']);

        $query = "";
        $query .= "INSERT INTO room (door_number, room_category_id, capacity_adults, capacity_children) VALUES ";
        $query .= "(:door_number, :room_category_id, :capacity_adults, :capacity_children)";
        $stmt = $this->database->handler->prepare($query);
        $stmt->execute($data);
        //$stmt->fetch();
        return $this->database->handler->lastInsertId();
    }

    public function update_room($id, $data)
    {
        $data['room_id'] = $id;
        $query = "";
        $query .= "UPDATE room SET ";
        $query .= "door_number=:door_number,";
        $query .= "room_category_id=:room_category_id,";
        $query .= "capacity_adults=:capacity_adults,";
        $query .= "capacity_children=:capacity_children ";
        $query .= "WHERE room_id = :room_id"; 
        
        $stmt = $this->database->handler->prepare($query);
        $stmt->execute($data);
        //$stmt->fetch();
    }

    public function delete_room($id)
    {
        $stmt = $this->database->handler->prepare('DELETE FROM room WHERE room_id = :id');
        $stmt->execute(['id' => $id]);                
        //$stmt->fetch();
    }

    public function get_room_categories()
    {
        $stmt = $this->database->handler->prepare('SELECT * FROM room_category ORDER BY room_category_id DESC');      
        $stmt->execute();  
        $room_categories = $stmt->fetchAll();        
        return $room_categories;
    }
}