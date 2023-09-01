-- CREATE DATABASE lazada;
USE lazada;

-- Recreate tables
DROP TABLES IF EXISTS product;
DROP TABLE IF EXISTS product_template;
DROP TABLE IF EXISTS customer;
DROP TABLE IF EXISTS product_order;
DROP TABLE IF EXISTS warehouse;
DROP TABLE IF EXISTS warehouse_address;

-- Drop Procedure
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
) ENGINE=InnoDB;	

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
    category VARCHAR(100),
    length DECIMAL(8,2),
    width DECIMAL(8,2),
    height DECIMAL(8,2),
    image VARCHAR(255),
    template_id INT,
    wid INT,
    oid INT,
    PRIMARY KEY(id)
);

CREATE TABLE customer (
	id INT auto_increment,
    customer_name VARCHAR(50),
	PRIMARY KEY(id)
);

CREATE TABLE product_order (
	id INT auto_increment,
    cid INT NOT NULL,
    template_id INT NOT NULL,
    product_quantity INT,
    order_status INT DEFAULT 0,
    PRIMARY KEY(id)
);

-- Indexing

CREATE INDEX address_index ON warehouse(address_id);
CREATE INDEX warehouse_index ON product(wid);
CREATE INDEX order_index ON product(oid);

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
    
    -- Get the latest id if this product is added
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
    
    SELECT `new_volume`, `new_product_id`, `warehouseID`;
END $$
DELIMITER ;


-- Should declare a flag to check if all products can be ordered before calling this function for each template
DELIMITER $$
CREATE PROCEDURE `order_product`(IN product_template_id INT, IN quantity INT)
BEGIN
	-- Declare variables
	DECLARE `_rollback` BOOL DEFAULT 0;
    DECLARE `available_quantity` INT DEFAULT 0;
	DECLARE CONTINUE HANDLER FOR SQLEXCEPTION SET `_rollback` = 1; 
    SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
    START TRANSACTION;
    
    -- Recheck current product quantity in stock
    SELECT COUNT(product.id) INTO `available_quantity`
    FROM product
    WHERE product.template_id = `product_template_id`;
    
    -- If not enough then roll back
    IF `available_quantity` < quantity THEN
		SET `_rollback` = 1;
	END IF;
    
    -- If enough then run while loop to make multiple orders
    
    
	IF `_rollback` THEN
		ROLLBACK;
	ELSE
		COMMIT;
	END IF;
    
    SELECT `available_quantity`;
    -- WHILE quantity
END $$
DELIMITER ;

-- Sample Datas
INSERT INTO customer (customer_name) VALUES ('Customer 1'), ('Customer 2');

INSERT INTO warehouse_address (province, city, district, street, street_number) values ('Khanh Hoa', 'Nha Trang', 'Vinh Tho', 'Hai Ba Trung', '123');
INSERT INTO warehouse_address (province, city, district, street, street_number) values ('Sai Gon', 'Ho Chi Minh', 'Quan 1', 'Ly Thai To', '245');
INSERT INTO warehouse_address (province, city, district, street, street_number) values ('Da Nang', 'Da Nang', 'Da Nang', 'Nguyen Truong To', '789');

INSERT INTO warehouse (address_id, warehouse_name, volume, current_volume) values (1, "Nha Trang ABC", 10000, 75);
INSERT INTO warehouse (address_id, warehouse_name, volume, current_volume) values (2, "Saigon Tiger", 10000, 1000);
INSERT INTO warehouse (address_id, warehouse_name, volume, current_volume) values (3, "Da Nang Coop", 10000, 8000);


INSERT INTO product_template (title, description, price, category, length, width, height, image, wid, oid)
VALUES ('title 1', 'This is title 1', 10, 'electronic', 5, 5, 5, 'Image 1', NULL, NULL),
	   ('title 2', 'This is title 2', 20, 'furniture', 10, 10, 10, 'Image 2', NULL, NULL),
       ('title 3', 'This is title 3', 30, 'phone', 20, 20, 20, 'Image 3', NULL, NULL),
	   ('title 4', 'This is title 4', 40, 'chair', 40, 40, 40, 'Image 4', NULL, NULL);


INSERT INTO product (title, description, price, category, length, width, height, image, template_id, wid)
VALUES ('title 1', 'This is title 1', 10, 'electronic', 5, 5, 5, 'Image 1', 1, 1),
	   ('title 2', 'This is title 2', 20, 'mobilephone', 10, 10, 10, 'Image 2', 2, 2),
       ('title 3', 'This is title 3', 30, 'television', 20, 20, 20, 'Image 3', 3, 3),
	   ('title 4', 'This is title 4', 40, 'Shoes', 40, 40, 40, 'Image 4', 4, NULL);

INSERT INTO product_order (cid, template_id, product_quantity) VALUES (1, 2, 1);
INSERT INTO product_order (cid, template_id, product_quantity) VALUES (2, 3, 1);