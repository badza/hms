<?php

// All config values
$config = include('config.php');

// Common
require 'vendor/autoload.php';
require 'lib/auth.php';
require 'lib/database.php';

// Storage
require 'storage/user.php';
require 'storage/room.php';
require 'storage/guest.php';

// Include auth module
require 'modules/auth.php';

// Include users module
require 'modules/user.php';

// Include rooms module
require 'modules/room.php';

// Include guest module
require 'modules/guest.php';

Flight::start();