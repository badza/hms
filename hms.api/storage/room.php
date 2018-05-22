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
        $page_size = $this->config['page_size'];
        $starting_limit = ($page - 1) * $page_size;
        $stmt = $this->database->handler->prepare('SELECT * FROM room ORDER BY room_id DESC LIMIT :starting_limit, :page_size');
        $stmt->execute(['starting_limit' => $starting_limit, 'page_size' => $page_size]);
        $rooms = $stmt->fetchAll();        
        return $rooms;
    }

    public function get_room($id)
    {
        $stmt = $this->database->handler->prepare('SELECT * FROM room WHERE room_id = :id');
        $stmt->execute(['id' => $id]);
        $user = $stmt->fetch();        
        return $user;
    }

    public function insert_room($data)
    {
        $query = "";
        $query .= "INSERT INTO room (door_number, room_category_id, capacity, comment) VALUES ";
        $query .= "(:door_number, :room_category_id, :capacity, :comment)";
        $stmt = $this->database->handler->prepare($query);
        $stmt->execute($data);
        $stmt->fetch();
        return $this->database->handler->lastInsertId();
    }

    public function update_room($id, $data)
    {
        $data['id'] = $id;
        $query = "";
        $query .= "UPDATE room SET ";
        $query .= "door_number=:door_number,";
        $query .= "room_category_id=:room_category_id,";
        $query .= "capacity=:capacity,";
        $query .= "comment=:comment ";  
        $query .= "WHERE room_id = :id"; 
        
        $stmt = $this->database->handler->prepare($query);
        $stmt->execute($data);
        $stmt->fetch();
    }

    public function delete_room($id)
    {
        $stmt = $this->database->handler->prepare('DELETE FROM room WHERE room_id = :id');
        $stmt->execute(['id' => $id]);                
        $stmt->fetch();
    }
}