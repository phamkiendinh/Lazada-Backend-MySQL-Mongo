const db = require('../database/mySQL.js')
const fs = require('fs')
const multer = require('multer');
const path = require('path');
const client = require('../database/mongoDB.js');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, '../frontend/seller/Assets');
    },
    filename: (req, file, cb) => {
      const filename = Date.now() + path.extname(file.originalname);
      cb(null, filename);
    }
});
  
const upload = multer({ storage });

async function create_product(req, res) {
    const { title, description, price, category, length, width, height } = req.body;
    const image = req.file ? req.file.filename : "thumbnail.png";
    var attributes = JSON.parse(req.body.category_attr)

    const query = `
        INSERT INTO product_template (title, description, price, category, length, width, height, image)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?);
    `;
    const values = [title, description, price, category, length, width, height, image];
    
    try {
        db.query(query, values, async (err, result) => {
            if (err) {
                console.error('Error creating product:', err);
                res.status(500).json({ error: 'Error creating product' });
            } else {
                var collection = client.db('lazada').collection('product_template');
                attributes['pid'] = result.insertId

                collection.insertOne(attributes, async (err, result) => {
                    if (err) {
                        console.error('Error inserting document:', err);
                    } else {
                        console.log('Inserted document into "product" collection');
                    }
                });

                res.status(200).json({ message: 'Product created successfully', productId: result.insertId });
            }
        });
    } catch (error) {
        console.log(error);
    }
}

async function update_product(req, res) {
    const productId = req.params.id;
    const { title, description, price, category, length, width, height } = req.body;

    // Check if a new image is provided
    const newImage = req.file ? req.file.filename : undefined;

    const query = `
        UPDATE product_template
        SET product_template.title = ?, product_template.description = ?, product_template.price = ?, product_template.category = ?, product_template.length = ?, product_template.width = ?, product_template.height = ? ${newImage !== undefined ? ', product_template.image = ?' : ''}
        WHERE product_template.id = ?;
    `;

    const values = [title, description, price, category, length, width, height];
    if (newImage !== undefined) {
        values.push(newImage);
    }
    values.push(productId);

    db.query(query, values, async (err, result) => {
        if (err) {
            console.error('Error updating product:', err);
            res.status(500).json({ error: 'Error updating product' });
        } else {
            res.status(200).json({ message: 'Product updated successfully' });
        }
    });
}

async function delete_product(req, res) {
    const productId = req.params.id;

    var collection = client.db('lazada').collection('product_template'); 
    const result = await collection.deleteOne({pid : productId});

    if (result.deletedCount === 1) {
        console.log(`Document with pid ${productId} deleted successfully.`);
    } else {
        console.log(`No document with pid ${productId} found for deletion.`);
    }

    const getImageQuery = `SELECT image FROM product_template WHERE id = ?`;
    db.query(getImageQuery, [productId], async (err, result) => {
        if (err) {
            console.error('Error retrieving image filename:', err);
            res.status(500).json({ error: 'Error deleting product' });
            return;
        }

        if (result.length === 0) {
            res.status(404).json({ error: 'Product not found' });
            return;
        }

        const imageFilename = result[0].image;

        const deleteProductQuery = `DELETE FROM product_template WHERE id = ?`;
        db.query(deleteProductQuery, [productId], async (err, result) => {
            if (err) {
                console.error('Error deleting product:', err);
                res.status(500).json({ error: 'Error deleting product' });
            } else {
                console.log(imageFilename)
                if (imageFilename != "thumbnail.png") {
                    const imagePath = path.join('../frontend/seller/Assets', imageFilename);
                    fs.unlink(imagePath, (err) => {
                        if (err) {
                            console.error('Error deleting image file:', err);
                        }
                    });
                }
                res.status(200).json({ message: 'Product and image deleted successfully' });
            }
        });
    });
}

async function get_product(req, res) {
    const productId = req.params.id;
    const query = `SELECT * FROM product_template WHERE id = ?`;
    
    db.query(query, [productId], async (err, results) => {
        if (err) {
            console.error('Error fetching product:', err);
            res.status(500).json({ error: 'Error fetching product' });
        } else {
            if (results.length === 0) {
                res.status(404).json({ error: 'Product not found' });
            } else {
                const product = results[0];
                res.status(200).json(product);
            }
        }
    });
}

async function get_all_products(req, res) {
    const query = `SELECT pt.id, pt.title, COALESCE(q.quantity, 0) as quantity, pt.image
                   FROM product_template pt LEFT JOIN (
                        SELECT template_id, COUNT(id) AS quantity
                        FROM product
                        GROUP BY template_id
                    ) q
                    ON pt.id = q.template_id;`;

    db.query(query, async (err, results) => {
        if (err) {
            console.error('Error fetching product:', err);
            res.status(500).json({ error: 'Error fetching product' });
        } else {
            res.status(200).json(results);
        }
    });
}

async function get_category_attributes(req, res) {
    try {
        const productId = req.params.id;
        const collection = client.db('lazada').collection('product_template'); 
        const result = await collection.findOne({ pid : parseInt(productId) }, { projection : { _id : 0 , pid : 0}});

        if (result) {
            res.json(result);
        } else {
            res.status(404).json({ error: 'Item Not Found' });
        }

    } catch (error) {
        console.error('An error occurred while fetching category attributes:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports = {
    create_product,
    update_product,
    delete_product,
    get_product,
    get_all_products, 
    get_category_attributes
};