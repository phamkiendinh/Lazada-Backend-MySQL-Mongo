-- CREATE DATABASE lazada;
USE lazada;

-- These drops are used for fast reseting tables and datas for testing and experimenting purposes

-- DROP Users
DROP USER IF EXISTS `lazada_admin`@`localhost`;
DROP USER IF EXISTS `lazada_seller`@`localhost`;
DROP USER IF EXISTS `lazada_customer`@`localhost`;

-- Drop Roles
DROP ROLE IF EXISTS `admin`;
DROP ROLE IF EXISTS `seller`;
DROP ROLE IF EXISTS `customer`;

-- Recreate tables
DROP TABLE IF EXISTS product;
DROP TABLE IF EXISTS product_template;
DROP TABLE IF EXISTS customer;
DROP TABLE IF EXISTS product_order;
DROP TABLE IF EXISTS warehouse;
DROP TABLE IF EXISTS warehouse_address;
DROP TABLE IF EXISTS seller;

-- Drop triggers
DROP TRIGGER IF EXISTS complete_order_trigger;

-- Drop Procedure
DROP PROCEDURE IF EXISTS clean_up_order;
DROP PROCEDURE IF EXISTS accept_order;
DROP PROCEDURE IF EXISTS reject_order;
DROP PROCEDURE IF EXISTS insert_product;
DROP PROCEDURE IF EXISTS move_product;
DROP PROCEDURE IF EXISTS order_product;

-- Create tables
CREATE TABLE warehouse_address(
	id INT auto_increment,
    province VARCHAR(50) NOT NULL,
    city VARCHAR(50) NOT NULL,
    district VARCHAR(50) NOT NULL,
    street VARCHAR(50) NOT NULL,
    street_number VARCHAR(50) NOT NULL,
    PRIMARY KEY(id)
) ENGINE=InnoDB;

CREATE TABLE warehouse (
	id INT auto_increment,
    warehouse_name VARCHAR(50) NOT NULL UNIQUE,
    address_id INT NOT NULL,
    volume INT NOT NULL,
    current_volume INT NOT NULL,
	PRIMARY KEY (id),
    FOREIGN KEY (address_id) REFERENCES warehouse_address(id)
) ENGINE = InnoDB;

CREATE TABLE product_template(
	id INT auto_increment,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(100),
    length DECIMAL(8,2),
    width DECIMAL(8,2),
    height DECIMAL(8,2),
    image VARCHAR(255),
    wid INT,
    oid INT,
    PRIMARY KEY(id)
);

CREATE TABLE product (
	id INT auto_increment,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    length DECIMAL(8,2) NOT NULL,
    width DECIMAL(8,2) NOT NULL,
    height DECIMAL(8,2) NOT NULL,
    image VARCHAR(255),
    template_id INT,
    wid INT,
    oid INT,
    PRIMARY KEY(id, category)
) ENGINE = InnoDB;

CREATE TABLE customer (
	id INT auto_increment,
    customer_name VARCHAR(50),
	PRIMARY KEY(id)
);

CREATE TABLE seller (
	id INT auto_increment,
    seller_name VARCHAR(50),
	PRIMARY KEY(id)
);

-- Accept = 1, Reject = 0
CREATE TABLE product_order (
	id INT auto_increment,
    cid INT NOT NULL,
    template_id INT NOT NULL,
    product_quantity INT,
    order_status INT DEFAULT -1,
    PRIMARY KEY(id, order_status)
) ENGINE = InnoDB
PARTITION BY LIST(order_status) (
	PARTITION order_accept VALUES IN (1),
    PARTITION order_reject VALUES IN (0),
    PARTITION order_waiting VALUES IN (-1)
);

-- Indexing
CREATE INDEX warehouse_index ON product(wid);
CREATE INDEX order_index ON product(oid);
CREATE INDEX category_index ON product(category);
CREATE INDEX customer_product_order_index ON product_order(cid);
CREATE INDEX product_order_template_index ON product_order(template_id);

-- Transaction
-- Ensuring total number of products in all warehouses is consistent before and after a move
-- Step:
-- READ volume from product, then check available volume from new warehouse, if sufficient 
-- then subtract the available volume from old warehouse, add new product volume to new ware house volume, and update product
-- warehouse id. Repeatable Read Can Be Use

DELIMITER $$
CREATE PROCEDURE `move_product`(IN product_id INT, IN old_warehouse_id INT, IN new_warehouse_id INT)
BEGIN
	DECLARE `_rollback` BOOL DEFAULT 0;
	DECLARE `product_volume` INT;
    DECLARE `old_warehouse_current_volume` INT;
	DECLARE `new_warehouse_current_volume` INT;
    DECLARE `new_warehouse_volume` INT;
	DECLARE CONTINUE HANDLER FOR SQLEXCEPTION SET `_rollback` = 1; 
    SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
    START TRANSACTION;
    
    -- Calculate the product volume
	SELECT p.width * p.height * p.length INTO `product_volume`
    FROM product p
    WHERE p.id = product_id;
    
    -- Get the old warehouse availalbe volume
    SELECT w.current_volume INTO `old_warehouse_current_volume`
    FROM warehouse w
    WHERE w.id = old_warehouse_id;
    
    -- Get new warehouse available volume
    SELECT w.current_volume INTO `new_warehouse_current_volume`
    FROM warehouse w
    WHERE w.id = new_warehouse_id;
    
	-- Get new warehouse max volume
    SELECT w.volume INTO `new_warehouse_volume`
    FROM warehouse w
    WHERE w.id = new_warehouse_id;
    
    -- If insufficient then abort
    IF `new_warehouse_current_volume` + `product_volume` > `new_warehouse_volume` THEN
		SET `_rollback` = 1;
	END IF;
    
    -- If sufficient then migrate product
    -- Add product volume to new warehouse volume
    UPDATE warehouse
    SET warehouse.current_volume = `product_volume` + `new_warehouse_current_volume`
    WHERE warehouse.id = new_warehouse_id;
	
	-- Add product volume to new warehouse volume
    UPDATE warehouse
    SET warehouse.current_volume = `old_warehouse_current_volume` - `product_volume`
    WHERE warehouse.id = old_warehouse_id;
    
    -- Change product warehouse id to new warehouse
    UPDATE product
    SET product.wid = new_warehouse_id
    WHERE product.id = product_id;

	if `_rollback` THEN
		ROLLBACK;
	ELSE
		COMMIT;
	END IF;
    SELECT _rollback, new_warehouse_current_volume, product_volume, new_warehouse_volume;
END $$
DELIMITER ;



DELIMITER $$
CREATE PROCEDURE `insert_product`(IN product_template_id INT, IN product_volume INT)
BEGIN
	DECLARE `remaining_warehouse_volume` INT;
    DECLARE `warehouseID` INT DEFAULT 0;
    DECLARE `inserted` BOOL DEFAULT 0;
    DECLARE `new_product_id` INT DEFAULT 0;
    DECLARE `new_volume` INT DEFAULT 0;
    
    -- Read the first max warehouse current volume 
	SELECT warehouse.id INTO `warehouseID`
    From warehouse
    ORDER BY (volume - current_volume) DESC LIMIT 1;
	
    -- Calculate the remaining volume of the gotten warehouse
    SELECT (volume - current_volume) INTO `remaining_warehouse_volume`
    FROM warehouse
    WHERE warehouse.id  = `warehouseID`;
    
    -- Get the latest id if this product is added, need to add 1
    SELECT product.id + 1 INTO `new_product_id`
	FROM product
	ORDER BY product.id DESC  LIMIT 1;

    -- If product volume exceeds this warehouse then move the product to waiting list for admin to move
    IF product_volume > `remaining_warehouse_volume` THEN
		INSERT INTO product (title, description, price, category, length, width, height, image, wid)
		SELECT title, description, price, category, length, width, height, image, wid
		FROM product_template
		WHERE product_template.id = `product_template_id`;
        
		-- Set product template_id to product_template id
        UPDATE product
		SET product.template_id = `product_template_id`
		WHERE product.id = `new_product_id`;
        
        SET `warehouseID` = NULL;
        
	-- If product volume doesn't exceed, update its warehouse id
	ELSE
		-- Copy data from product_template to new product and update its warehouse id. Seller can update this product information later
		INSERT INTO product (title, description, price, category, length, width, height, image, wid)
		SELECT title, description, price, category, length, width, height, image, wid
		FROM product_template
		WHERE product_template.id =  `product_template_id`;
        
        -- Set product wid to new warehouse id
        UPDATE product
		SET product.wid = `warehouseID`
		WHERE product.id = `new_product_id`;
        
		-- Set product template_id to product_template id
        UPDATE product
		SET product.template_id = `product_template_id`
		WHERE product.id = `new_product_id`;
        
        -- Update warehouse current_volume
        UPDATE warehouse
        SET warehouse.current_volume = warehouse.current_volume + `product_volume`
        WHERE warehouse.id = `warehouseID`;
        
        -- Get the new update volume
        SELECT warehouse.current_volume INTO `new_volume`
        FROM warehouse
        WHERE warehouse.id = `warehouseID`;
    END IF;
    
    SELECT new_volume, new_product_id, warehouseID;
END $$
DELIMITER ;


-- Should declare a flag to check if all products can be ordered before calling this function for each template
DELIMITER $$
CREATE PROCEDURE `order_product`(IN product_template_id INT, IN customer_id INT, IN product_quantity INT)
BEGIN
	-- Declare variables
	DECLARE `_rollback` BOOL DEFAULT 0;
    DECLARE `available_quantity` INT DEFAULT 0;
    DECLARE `new_product_order_id` INT DEFAULT 0;
    DECLARE `customer_id_check` INT DEFAULT 0;
	DECLARE CONTINUE HANDLER FOR SQLEXCEPTION SET `_rollback` = 1; 
    SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
    START TRANSACTION;
    
    SELECT COUNT(customer.id) INTO `customer_id_check`
    FROM customer
    WHERE customer.id = `customer_id`;
    
    -- Recheck current product quantity in stock, make sure it is not in any order and product is stored in a warehouse
    SELECT COUNT(product.id) INTO `available_quantity`
    FROM product
    WHERE product.template_id = `product_template_id` AND product.oid IS NULL AND product.wid IS NOT NULL;
    
    -- If not enough then roll back
    IF `available_quantity` < `product_quantity` THEN
		SET `_rollback` = 1;
	END IF;
    
    -- If no stock available, rollback
    IF `available_quantity` <= 0 THEN
		SET `_rollback` = 1;
	END IF;
    
    -- Customer id check
    IF `customer_id_check` = 0 THEN
		SET `_rollback` = 1;
	END IF;
    
    
	IF `_rollback` = 0 THEN
		-- Create new order
		INSERT INTO product_order(cid, template_id, product_quantity) VALUES(`customer_id`, `product_template_id`, `product_quantity`);
		
		-- Get the newly created product order
		SELECT product_order.id INTO `new_product_order_id`
		FROM product_order
		ORDER BY product_order.id DESC LIMIT 1;
        
		-- If enough then run while loop to update the product's order id to new added product_order id 
		WHILE `product_quantity` > 0 DO
			SET `product_quantity` = `product_quantity` - 1;
			
			UPDATE product
			SET product.oid = `new_product_order_id`
			WHERE product.template_id = `product_template_id` AND product.oid IS NULL
			LIMIT 1;
		END WHILE;
    END IF;
    
	IF `_rollback` THEN
		ROLLBACK;
	ELSE
		COMMIT;
	END IF;
    
    SELECT new_product_order_id, _rollback, available_quantity, product_quantity, customer_id, product_template_id;
    -- WHILE quantity
END $$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE `accept_order`(IN order_id INT)
BEGIN
	-- Find all products that have order id equal to this order id to calculate its volume
    -- Then subtract product volume from its warehouse volume
    -- Delete the product
    -- When all products deleted, delete the order as well
	DECLARE `quantity` INT DEFAULT 0; -- Store total product in the order
    DECLARE `product_id` INT DEFAULT 0; -- Store current product id each while loop
    DECLARE `product_volume` INT DEFAULT 0; -- Store current product volume
    DECLARE `warehouse_id` INT DEFAULT 0; -- Store current product warehouse ID
    
    SELECT COUNT(product.id) INTO `quantity`
    FROM product
    WHERE product.oid = `order_id`;
    
    WHILE `quantity` > 0 DO
		SET `quantity` = `quantity` - 1;
        
		SELECT product.id INTO `product_id`
        FROM product
        WHERE product.oid = `order_id` LIMIT 1;
        
        SELECT product.length * product.width * product.height INTO `product_volume`
        FROM product
        WHERE product.id = `product_id`;
        
        SELECT product.wid INTO `warehouse_id`
        FROM product
        WHERE product.id = `product_id`;
        
        UPDATE warehouse
        SET warehouse.current_volume = warehouse.current_volume - `product_volume`
        WHERE warehouse.id = `warehouse_id`;
        
        DELETE FROM product
        WHERE product.id = `product_id`;
			
    END WHILE;
END $$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE `reject_order`(IN order_id INT)
BEGIN
	-- Find all products that have order id equal to this order id
    -- Change their order id to null
	UPDATE product
	SET product.oid = NULL
	WHERE product.oid = `order_id`;
END $$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE `clean_up_order`()
BEGIN
	-- Find all orders that are already accepted or rejected and delete them
	DELETE FROM product_order
    WHERE product_order.order_status = 1 OR product_order.order_status = 0;
END $$
DELIMITER ;

-- Triggers
DELIMITER $$
CREATE TRIGGER complete_order_trigger
AFTER UPDATE ON product_order 
FOR EACH ROW
BEGIN
	-- On default order_status is -1
	IF NEW.order_status = 1 THEN
		CALL accept_order(NEW.id);
    END IF;
    
	IF NEW.order_status = 0 THEN
		CALL reject_order(NEW.id);
    END IF;
    
END $$
DELIMITER ;

-- Sample Datas
INSERT INTO customer (customer_name) VALUES ('Customer 1'), ('Customer 2');

INSERT INTO seller (seller_name) VALUES ('Seller 1'), ('Seller 2');

INSERT INTO warehouse_address (province, city, district, street, street_number) values ('Khanh Hoa', 'Nha Trang', 'Vinh Tho', 'Hai Ba Trung', '123');
INSERT INTO warehouse_address (province, city, district, street, street_number) values ('Sai Gon', 'Ho Chi Minh', 'Quan 1', 'Ly Thai To', '245');
INSERT INTO warehouse_address (province, city, district, street, street_number) values ('Da Nang', 'Da Nang', 'Da Nang', 'Nguyen Truong To', '789');

INSERT INTO warehouse (address_id, warehouse_name, volume, current_volume) values (1, "Nha Trang ABC", 10000, 0);
INSERT INTO warehouse (address_id, warehouse_name, volume, current_volume) values (2, "Saigon Tiger", 10000, 0);
INSERT INTO warehouse (address_id, warehouse_name, volume, current_volume) values (3, "Da Nang Coop", 10000, 0);


-- INSERT INTO product_template (title, description, price, category, length, width, height, image, wid, oid)
-- VALUES ('title 1', 'This is title 1', 10.10, 'electronic', 5, 5, 5, 'thumbnail.png', NULL, NULL),
-- 	   ('title 2', 'This is title 2', 20.20, 'furniture', 10, 10, 10, 'thumbnail.png', NULL, NULL),
--        ('title 3', 'This is title 3', 30.30, 'phone', 20, 20, 20, 'thumbnail.png', NULL, NULL),
-- 	   ('title 4', 'This is title 4', 40.40, 'chair', 40, 40, 40, 'thumbnail.png', NULL, NULL);


-- INSERT INTO product (title, description, price, category, length, width, height, image, template_id, wid)
-- VALUES ('title 1', 'This is title 1 book', 10.10, 'electronic', 5, 5, 5, 'thumbnail.png', 1, 1),
-- 	   ('title 2', 'This is title 2 book', 20.20, 'furniture', 10, 10, 10, 'thumbnail.png', 2, 2),
--        ('title 3', 'This is title 3 song', 30.30, 'phone', 20, 20, 20, 'thumbnail.png', 3, 3),
-- 	   ('title 4', 'This is title 4 pet', 40.40, 'chair', 5, 5, 5, 'thumbnail.png', 4, NULL),
--        ('title 1 second', 'This is title 1 book', 10.10, 'electronic', 5, 5, 5, 'thumbnail.png', 1, 1);
       


-- CALL order_product(1,1,2); -- Order 2 products from template 1 for customer 1
-- CALL order_product(2,2,1); -- Order 1 product from template 2 for customer 2
-- ROLLBACK;

-- Create Users
CREATE USER `lazada_admin`@`localhost` IDENTIFIED WITH SHA256_PASSWORD BY 'admin';
CREATE USER `lazada_seller`@`localhost` IDENTIFIED WITH SHA256_PASSWORD BY 'seller';
CREATE USER `lazada_customer`@`localhost` IDENTIFIED WITH SHA256_PASSWORD BY 'customer';

-- Create Roles
CREATE ROLE `admin`;
CREATE ROLE `seller`;
CREATE ROLE `customer`;

-- Grant privileges to roles
GRANT ALL PRIVILEGES ON lazada.* to `admin` WITH GRANT OPTION;
GRANT SELECT, UPDATE, DELETE ON lazada.product to `seller`;
GRANT SELECT, UPDATE, DELETE ON lazada.product_order to `seller`;
GRANT SELECT, UPDATE ON lazada.product to `customer`;
FLUSH PRIVILEGES;

-- Assign roles to accounts
GRANT `admin` TO `lazada_admin`@`localhost`;
GRANT `seller` TO `lazada_seller`@`localhost`;
GRANT `customer` TO `lazada_customer`@`localhost`;

-- show grants for `lazada_customer`@`localhost`;
-- select host, user, plugin, authentication_string from mysql.user;