-- CREATE DATABASE lazada;
USE lazada;

-- Recreate tables
DROP TABLES IF EXISTS product;
DROP TABLE IF EXISTS warehouse;
DROP TABLE IF EXISTS warehouse_address;

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
    wid INT,
    PRIMARY KEY(id),
    FOREIGN KEY (wid) REFERENCES warehouse(id)
);

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
    PRIMARY KEY(id)
);

-- Indexing

CREATE INDEX address_index ON warehouse(address_id);
CREATE INDEX warehouse_index ON product(wid);
CREATE INDEX user_index ON product(uid);


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


-- DELIMITER $$
-- CREATE PROCEDURE `insert_product`(IN product_id INT, IN product_volume INT)
-- BEGIN
-- 	DECLARE `remaining_warehouse_volume` INT;
--     DECLARE `warehouseID` INT;
--     DECLARE `inserted` BOOL DEFAULT 0;
-- 	SELECT warehouse.id INTO `warehouseID`
--     From warehouse
--     ORDER BY (volume - current_volume) DESC LIMIT 1;

--     SELECT (volume - current_volume) INTO `remaining_warehouse_volume`
--     FROM warehouse
--     WHERE warehouse.id  = `warehouseID`;
--     
--     IF product_volume < `remaining_warehouse_volume` THEN
-- 		
-- -- 	ELSE
-- 		SET `inserted` = 1;
--     END IF;
--     
--     SELECT `warehouseID`, `remaining_warehouse_volume`;
-- END $$
-- DELIMITER ;

-- INSERT INTO product
-- SELECT title, description, price, category, length, width, height, image, wid
-- FROM product
-- WHERE product.id = 1;

-- CALL insert_product(1, 750);
-- DROP PROCEDURE insert_product;
-- drop procedure move_product; 

-- Sample Datas
INSERT INTO warehouse_address (province, city, district, street, street_number) values ('Khanh Hoa', 'Nha Trang', 'Vinh Tho', 'Hai Ba Trung', '123');
INSERT INTO warehouse_address (province, city, district, street, street_number) values ('Sai Gon', 'Ho Chi Minh', 'Quan 1', 'Ly Thai To', '245');
INSERT INTO warehouse_address (province, city, district, street, street_number) values ('Da Nang', 'Da Nang', 'Da Nang', 'Nguyen Truong To', '789');

INSERT INTO warehouse (address_id, warehouse_name, volume, current_volume) values (1, "Nha Trang ABC", 10000, 1000);
INSERT INTO warehouse (address_id, warehouse_name, volume, current_volume) values (2, "Saigon Tiger", 20000, 2000);
INSERT INTO warehouse (address_id, warehouse_name, volume, current_volume) values (3, "Da Nang Coop", 30000, 3000);

-- Test, need delete later
INSERT INTO warehouse (address_id, warehouse_name, volume, current_volume) values (3, "Da Nang Poor Market", 5000, 3000);

INSERT INTO product (title, description, price, category, length, width, height, image, wid)
VALUES ('title 1', 'This is title 1', 10, 'electronic', 5, 10, 15, 'Image 1', 1),
	   ('title 2', 'This is title 2', 20, 'mobilephone', 5, 5, 10, 'Image 2', 2),
       ('title 3', 'This is title 3', 30, 'television', 5, 10, 10, 'Image 3', 3),
	   ('title 4', 'This is title 4', 40, 'Shoes', 5, 10, 10, 'Image 4', 1);
