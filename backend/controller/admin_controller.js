const client = require('../database/mongoDB.js');
const db = require('../database/mySQL.js');

// Check if current category have products belonged to it for deletion/update
async function countProducts(req, res) {
    console.log("Called");
    var categoryName = req.params.categoryName;
    var query = `
        SELECT COUNT(product.id) as count
        FROM product
        WHERE product.category = ?;
    `;
    db.query(query, [categoryName], async (err, response) => {
        if (err) {
            console.log(err);
            res.send({status : 400});
        }
        else {
            res.send(response[0]);
            return;
        }
    });
}

// Check admin
async function getOneAdmin(req, res) {
    try {
        var db = client.db('lazada');
        var collection = db.collection('admin');
        var query = {"username" : "admin"};
        const data = await collection.findOne(query, {projection: {_id: 0}});
        res.send(data);
    } catch (error) {
        console.log(error);
    }
}

// Fetch all top categories
async function getAllTopCategory(req, res) {
    try {
        var db = client.db('lazada');
        var collection = db.collection('category');
        const data = await collection.find({}, {projection: {_id:0, sub_category: 0}}).toArray();
        // console.log(data);
        if (data.length == 0) {
            res.send(null);
        }
        res.send(data);
    } catch (error) {
        console.log(error);
    }
}

// Fetch all top categories
async function getAllCategory(req, res) {
    try {
        var db = client.db('lazada');
        var collection = db.collection('category');
        const data = await collection.find({}, {projection: {_id:0}}).toArray();
        // console.log(data);
        if (data.length == 0) {
            res.send(null);
        }
        res.send(data);
    } catch (error) {
        console.log(error);
    }
}


// Get category attribute by path
async function getCategoryAttributesByPath(req, res) {
    try {
        const categoryPath = req.params.path;
        var db = client.db('lazada');
        var collection = db.collection('category');

        const pathComponents = categoryPath.split('-');

        let query = { name: pathComponents[0] };

        const result = await collection.findOne(query, {projection: {_id:0}});

        if (result) {
            res.send(result);
        } else {
            res.status(404).send('Category not found.');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
}

// Create new top category
async function addTopCategory(req, res) {
    // console.log(req.body);
    let json = req.body;
    console.log(json);
    try {
        var db = client.db('lazada');
        var collection = db.collection('category');
        var object = {
            name: ""
        };
        var subject = "";
        json.map(data => { 
            var entries = Object.entries(data);
            var subObject = {}
            entries.map(entry => {
                var key = entry[0];
                var value = entry[1];
                if (key === "categoryName") {
                    object.name = value;
                    // console.log(object);
                }
                else if (key === "name") {
                    subject = value;
                }
                else {
                    subObject[key] = value;
                }
            });
            if (subject !== "") {
                object[subject] = subObject;
            }
        })
        console.log(object);
        const data = await collection.insertOne(object);
        var query = "";

        res.send({status: 200});
    } catch (error) {
        console.log(error);
    }
}

// Delete a top category
async function deleteTopCategory(req, res) {
    // console.log(req.body);
    // let json = req.body;
    const categoryName = req.params.categoryName;
    // console.log(json);
    try {
        var db = client.db('lazada');
        var collection = db.collection('category');
        
        const subCategories = await collection.find({name : categoryName}, {projection: {_id: 0, sub_category : 1}}).toArray();
        
        const keys = Object.keys(subCategories[0]);
        if (keys.length !== 0) {
            if (subCategories[0]['sub_category'].length !== 0) {
                console.log(subCategories[0]['sub_category'].length);
                res.send({status : 445});
                return;
            }
        }
        const data = await collection.deleteOne({name : categoryName});
        res.send({status: 200});
        return;
        // console.log(json);
    } catch (error) {
        console.log(error);
    }
}

// Update top category
async function updateTopCategory(req, res) {
    let json = req.body;
    const categoryName = req.params.categoryName;
    try {
        var db = client.db('lazada');
        var collection = db.collection('category');
        const subCategories = await collection.find({name : categoryName}, {projection: {_id: 0, sub_category : 1}}).toArray();
        
        const keys = Object.keys(subCategories[0]);
        if (keys.length !== 0) {
            if (subCategories[0]['sub_category'].length !== 0) {
                console.log(subCategories[0]['sub_category'].length);
                res.send({status : 445});
                return;
            }
        }
        const data = {};
        json.map(item => {
            var entry = Object.entries(item);
            const entryData = entry[0];
            const key = entryData[0];
            const value = entryData[1];
            data[key] = value;
        })
        await collection.deleteOne({name : categoryName});
        await collection.insertOne(data);
        res.send({status: 200});
        return;
    } catch (error) {
        console.log(error);
    }
}

// Retrieve a single top category
async function getTopCategory(req,res) {
    const categoryName = req.params.categoryName;
    try {
        var db = client.db('lazada');
        var collection = db.collection('category');
        const data = await collection.findOne({name : categoryName}, {projection: {_id: 0}});
        // console.log(json);
        res.send(data);
    } catch (error) {
        console.log(error);
    }
}

//  Get all subcategories of all top-categories
async function getAllSubCategory(req, res) {
    // console.log(req.body);
    const category = req.body.category;
    try {
        var db = client.db('lazada');
        var collection = db.collection('category');
        const json = await collection.find({"name" : category}, {projection: {_id:0, sub_category: 1}}).toArray();
        // console.log(json);
        if (json.length > 0) {
            res.send(json[0].sub_category);
        }
        else {
            res.send(null);
        }
    } catch (error) {
        console.log(error);
    }
}

// Add new sub-category to current top-category
async function addSubCategory(req, res) {
    // console.log(req.body);
    let json = req.body;

    console.log(json);
    try {
        var db = client.db('lazada');
        var collection = db.collection('category');
        var topCategory = "";
        var object = {
            name: ""
        };
        var subject = "";
        json.map(data => { 
            var entries = Object.entries(data);
            var subObject = {}
            entries.map(entry => {
                var key = entry[0];
                var value = entry[1];
                if (key === "category") {
                    topCategory = value;
                }
                else if (key === "categoryName") {
                    object.name = value;
                    // console.log(object);
                }
                else if (key === "name") {
                    subject = value;
                }
                else {
                    subObject[key] = value;
                }
            });
            // console.log(subObject);
            if (subject !== "") {
                object[subject] = subObject;
                subject = "";
            }
            if (subObject !== null || subObject !== undefined) {
                var newEntry = Object.entries(subObject);
                newEntry.map(item => {
                    var k = item[0];
                    var v = item[1];
                    if (k !== "type" && k !== "required") {
                        object[k] = v;
                    }
                });
            }
        })
        console.log(object);
        // const data = await collection.insertOne(object);
        const data = await collection.updateOne({name : topCategory}, {$push: {"sub_category" : object}});
        console.log(data);

        var query = "";

        res.send({status: 200});
    } catch (error) {
        console.log(error);
    }
}


// Delete a sub-category
async function deleteSubCategory(req, res) {
    // console.log(req.body);
    // let json = req.body;
    const categoryName = req.params.categoryName;
    const subCategoryName = req.params.subCategoryName;
    // console.log(json);
    try {
        var db = client.db('lazada');
        var collection = db.collection('category');
        const data = await collection.updateOne({name : categoryName}, {$pull: {"sub_category" : {name : subCategoryName}}});
        // console.log(json);
        res.send({status: 200});
    } catch (error) {
        console.log(error);
    }
}

// get one sub-category based on top-category
async function getSubCategory(req, res) {
    // console.log(req.body);
    // let json = req.body;
    const categoryName = req.params.categoryName;
    const subCategoryName = req.params.subCategoryName;
    // console.log(json);
    // console.log("Called");
    try {
        var db = client.db('lazada');
        var collection = db.collection('category');
        const data = await collection.findOne({name : categoryName, "sub_category.name" : subCategoryName}, {projection: {_id:0, sub_category: 1}});
        // console.log(json);
        // res.send({status: 200});
        res.send(data);
    } catch (error) {
        console.log(error);
    }
}

// Update sub-category based on top-category
async function updateSubCategory(req, res) {
    let json = req.body;
    const categoryName = req.params.categoryName;
    const subCategoryName = req.params.subCategoryName;
    try {
        var db = client.db('lazada');
        var collection = db.collection('category');
        var topCategory = "";
        var object = {
            name: ""
        };
        var subject = "";
        json.map(data => { 
            var entries = Object.entries(data);
            var subObject = {}
            entries.map(entry => {
                var key = entry[0];
                var value = entry[1];
                if (key === "category") {
                    topCategory = value;
                }
                else if (key === "categoryName") {
                    object.name = value;
                    // console.log(object);
                }
                else if (key === "name") {
                    subject = value;
                }
                else {
                    subObject[key] = value;
                }
            });
            // console.log(subObject);
            if (subject !== "") {
                object[subject] = subObject;
                subject = "";
            }
            if (subObject !== null || subObject !== undefined) {
                var newEntry = Object.entries(subObject);
                newEntry.map(item => {
                    var k = item[0];
                    var v = item[1];
                    if (k !== "type" && k !== "required") {
                        object[k] = v;
                    }
                });
            }
        })
        await collection.updateOne({name : categoryName}, {$pull: {"sub_category" : {name : subCategoryName}}});
        const data = await collection.updateOne({name : categoryName}, {$push: {"sub_category" : object}});
        res.send({status: 200});
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    countProducts,
    getOneAdmin,
    getAllTopCategory,
    getAllCategory,
    getCategoryAttributesByPath,
    getTopCategory,
    addTopCategory,
    updateTopCategory,
    deleteTopCategory,
    getAllSubCategory,
    addSubCategory,
    deleteSubCategory,
    getSubCategory,
    updateSubCategory
}