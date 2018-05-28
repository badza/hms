<?php

class RoomRateStorage 
{
    private $config;
    private $database;

    public function __construct()
    {
        $this->config = include('config.php');
        $this->database = new Database();
    }

    public function get_room_rates($page)
    {
        $data = array();
        $query = "";
        $query .= "SELECT room_rate_id, room.room_id, door_number, mo.name AS meal_option, rc.name as room_category, ";
        $query .= "CONCAT(capacity_adults, ' Adult(s), ', capacity_children, ' Children ') AS capacity, CONCAT(price_per_adult, ' BAM') AS price_per_adult ";
        $query .= "FROM room ";
        $query .= "INNER JOIN room_category AS rc ON rc.room_category_id = room.room_category_id ";
        $query .= "INNER JOIN room_rate AS rr ON rr.room_id = room.room_id ";
        $query .= "INNER JOIN meal_option AS mo ON mo.meal_option_id = rr.meal_option_id ";
        $query .= "ORDER BY room_id, room_rate_id DESC ";
        $query .= "LIMIT :starting_limit, :page_size";
        $page_size = $this->config['page_size'];

        // Getting row count and pages, for paging
        $stmt_row_count = $this->database->handler->prepare("SELECT COUNT(*) FROM room_rate");
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

    public function get_room_rate($id)
    {
        $stmt = $this->database->handler->prepare('SELECT room_rate_id, room_id, meal_option_id, price_per_adult FROM room_rate WHERE room_rate_id = :id');
        $stmt->execute(['id' => $id]);
        $room = $stmt->fetch();        
        return $room;
    }    

    public function insert_room_rate($data)
    {
        // PDO complains if there are unused parameters, so we are removing additional parameters
        unset($data['room_rate_id']);

        $query = "";
        $query .= "INSERT INTO room_rate (room_id, meal_option_id, price_per_adult) VALUES ";
        $query .= "(:room_id, :meal_option_id, :price_per_adult)";
        $stmt = $this->database->handler->prepare($query);
        $stmt->execute($data);
        //$stmt->fetch();
        return $this->database->handler->lastInsertId();
    }

    public function update_room_rate($id, $data)
    {
        $data['room_rate_id'] = $id;
        $query = "";
        $query .= "UPDATE room_rate SET ";
        $query .= "room_id=:room_id,";
        $query .= "meal_option_id=:meal_option_id,";
        $query .= "price_per_adult=:price_per_adult ";
        $query .= "WHERE room_rate_id = :room_rate_id"; 
        
        $stmt = $this->database->handler->prepare($query);
        $stmt->execute($data);
        //$stmt->fetch();
    }

    public function delete_room_rate($id)
    {
        $stmt = $this->database->handler->prepare('DELETE FROM room_rate WHERE room_rate_id = :id');
        $stmt->execute(['id' => $id]);                
        //$stmt->fetch();
    }

    public function calculate_room_rate($room_id, $meal_option_id, $adult_count, $days)
    {
        $query = "";
        $query .="SELECT price_per_adult FROM room_rate WHERE room_id = :room_id AND meal_option_id = :meal_option_id";
        $stmt = $this->database->handler->prepare($query);
        $stmt->execute(['room_id' => $room_id, 'meal_option_id' => $meal_option_id]);                
        $data = $stmt->fetch();
        return ($data['price_per_adult'] * $adult_count) * $days;
    }

    public function get_rooms()
    {
        $query = "";
        $query .= "SELECT room_id, CONCAT('Door #', door_number, ' | ', rc.name) AS name ";
        $query .= "FROM room ";
        $query .= "INNER JOIN room_category AS rc ON rc.room_category_id = room.room_category_id ";
        $query .= "ORDER BY room_id DESC";

        $stmt = $this->database->handler->prepare($query);      
        $stmt->execute();  
        $rooms = $stmt->fetchAll();        
        return $rooms;
    }

    public function get_meal_options()
    {
        $stmt = $this->database->handler->prepare('SELECT * FROM meal_option ORDER BY meal_option_id DESC');      
        $stmt->execute();  
        $rooms = $stmt->fetchAll();        
        return $rooms;
    }
}