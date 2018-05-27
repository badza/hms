<?php

class ReservationStorage 
{
    private $config;
    private $database;

    public function __construct()
    {
        $this->config = include('config.php');
        $this->database = new Database();
    }

    public function get_reservations($page, $search, $status)
    {
        $data = array();

        if(!empty($search))
        {
            $query = "SET @search = :search";
            $stmt = $this->database->handler->prepare($query);
            $stmt->bindValue(":search", "%$search%", PDO::PARAM_STR); 
            $stmt->execute();
        }

        $query = "";
        $query .= "SELECT room_reservation_id, CONCAT(g.firstname, ' ', g.lastname) AS guest_name, from_date, to_date, checked_in, checked_out ";
        $query .= "FROM room_reservation AS rr ";
        $query .= "INNER JOIN guest AS g on g.guest_id = rr.guest_id ";
        $query .= "INNER JOIN room AS r on r.room_id = rr.room_id ";  
        
        if(!empty($search))        
            $query .= "WHERE (room_reservation_id LIKE @search OR g.firstname LIKE @search OR g.lastname LIKE @search) ";

        if(empty($search))
            $query .= "WHERE ";
        else
            $query .= "AND ";
        
        switch($status)
        {
            case 'upcoming':
                $query .= "from_date >= NOW() AND (canceled <> 1 OR canceled IS NULL) ";
            break;
            case 'current':
                $query .= "from_date <= NOW() AND to_date >= NOW() AND (canceled <> 1 OR canceled IS NULL) ";
            break;
            case 'past': 
                $query .= "to_date <= NOW() AND (canceled <> 1 OR canceled IS NULL) ";
            break;
            case 'never-checked-in':
                $query .= "checked_in IS NULL AND (canceled <> 1 OR canceled IS NULL) ";
            break;
            case 'canceled':
                $query .= "canceled = 1 ";
            break;
        }   
        
        // Getting row count and pages, for paging. A bit ugly, because we trigger query for everything
        // Need to be resolved later in more beautiful manner
        $page_size = $this->config['page_size'];
        $stmt_row_count = $this->database->handler->prepare($query);
        $stmt_row_count->execute();
        $row_count = $stmt_row_count->rowCount();
        $page_count = ceil($row_count/$page_size);

        $query .= "ORDER BY from_date DESC ";
        $query .= "LIMIT :starting_limit, :page_size"; 

        $starting_limit = ($page - 1) * $page_size;
        $stmt = $this->database->handler->prepare($query);
        $stmt->execute(['starting_limit' => $starting_limit, 'page_size' => $page_size]);
        
        $room_reservations = $stmt->fetchAll(); 
        $data['data'] = $room_reservations;
        $data['row_count'] = $row_count;
        $data['page_count'] = $page_count; 

        return $data;
    }

    public function get_reservation($id)
    {
        $stmt = $this->database->handler->prepare('SELECT room_reservation_id, guest_id, room_id, from_date, to_date, checked_in, checked_out, adult_count, meal_option_id, calculated_price FROM room_reservation WHERE room_reservation_id = :id');
        $stmt->execute(['id' => $id]);
        $reservation = $stmt->fetch();  

        if($reservation)
        {
            $from_date = new DateTime($reservation['from_date']);
            $reservation['from_date'] = $from_date->format('m/d/Y');
            $to_date = new DateTime($reservation['to_date']);
            $reservation['to_date'] = $to_date->format('m/d/Y');
        }

        return $reservation;
    }

    public function insert_reservation($data)
    {
        unset($data['room_reservation_id']);

        // Format from date
        $from_date = new DateTime($data['from_date']);
        $data['from_date'] = $from_date->format('Y-m-d');

        // Format to date
        $to_date = new DateTime($data['to_date']);
        $data['to_date'] = $to_date->format('Y-m-d');

        $query = "";
        $query .= "INSERT INTO room_reservation (room_id, meal_option_id, guest_id, from_date, to_date, adult_count, calculated_price) VALUES ";
        $query .= "(:room_id, :meal_option_id, :guest_id, :from_date, :to_date, :adult_count, :calculated_price)";
        $stmt = $this->database->handler->prepare($query);
        $stmt->execute($data);
        $stmt->fetch();
        return $this->database->handler->lastInsertId();
    }

    public function update_reservation($id, $data)
    {
        $data['room_reservation_id'] = $id;

        // Format from date
        $from_date = new DateTime($data['from_date']);
        $data['from_date'] = $from_date->format('Y-m-d');

        // Format to date
        $to_date = new DateTime($data['to_date']);
        $data['to_date'] = $to_date->format('Y-m-d');

        $query = "";
        $query .= "UPDATE room_reservation SET ";
        $query .= "room_id=:room_id,";
        $query .= "meal_option_id=:meal_option_id,";
        $query .= "guest_id=:guest_id,";
        $query .= "from_date=:from_date,";
        $query .= "to_date=:to_date,";
        $query .= "adult_count=:adult_count,";
        $query .= "calculated_price=:calculated_price ";            
        $query .= "WHERE room_reservation_id = :room_reservation_id"; 
        
        $stmt = $this->database->handler->prepare($query);
        $stmt->execute($data);
        $stmt->fetch();
    }

    public function cancel_reservation($id)
    {
        $stmt = $this->database->handler->prepare("UPDATE room_reservation SET canceled = 1 WHERE room_reservation_id = :id");
        $stmt->execute(['id' => $id]);
        $stmt->fetch();
    }

    public function check_in($id)
    {
        $stmt = $this->database->handler->prepare("UPDATE room_reservation SET checked_in = NOW() WHERE room_reservation_id = :id");
        $stmt->execute(['id' => $id]);
        $stmt->fetch();
    }

    public function check_out($id)
    {
        $stmt = $this->database->handler->prepare("UPDATE room_reservation SET checked_out = NOW() WHERE room_reservation_id = :id");
        $stmt->execute(['id' => $id]);
        $stmt->fetch();
    }

    public function delete_guest($id)
    {
        $stmt = $this->database->handler->prepare('DELETE FROM guest WHERE guest_id = :id');
        $stmt->execute(['id' => $id]);                
        $stmt->fetch();
    }

    public function get_guests()
    {
        $query = "";
        $query .= "SELECT guest_id, CONCAT(firstname, ' ', lastname) AS name ";
        $query .= "FROM guest ";        
        $query .= "ORDER BY guest_id DESC";

        $stmt = $this->database->handler->prepare($query);      
        $stmt->execute();  
        $guests = $stmt->fetchAll();        
        return $guests;
    }
}