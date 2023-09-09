// Variables
const productList = document.querySelector("#product-list")
const createImageTag = document.getElementById('create-product-img');
const updateImageTag = document.getElementById('update-product-img');
const maxWidth = 350;
const maxHeight = 350;
const overlay = document.getElementById('overlay');
const createFormContainer = document.getElementById('create-form-container');
const updateFormContainer = document.getElementById('update-form-container');
const categoryFormContainer = document.getElementById('category-form-container');
const createSelectedMenu = document.getElementById('create-category')
const updateSelectedMenu = document.getElementById('update-category')
const createCateAttrDiv = document.getElementById('create-category-attributes')
const updateCateAttrDiv = document.getElementById('update-category-attributes')

// Retrieve all the product templates
fetch('http://127.0.0.1:3001/products')
    .then(response => response.json())
    .then(products => {
        products.forEach(product => {
            // Display product as a box with name, image and quantity
            productList.innerHTML += 
                `<div data-product-id="${product.id}" class="product-item">
                    <div class="product-image">
                        <img src="Assets/${product.image}" alt="${product.title}">
                    </div>
                    <h3 class="product-name">${product.title}</h3>
                    <p class="product-quantity">Quantity: <span>${product.quantity}</span></p>
                </div>`;
        });

        // Add listener to all the products above
        // Create a update form when the box is clicked
        const productItems = document.querySelectorAll('.product-item');
        productItems.forEach(productItem => {
            productItem.addEventListener('click', async () => {
                const productId = productItem.getAttribute('data-product-id');
                fillInUpdateForm(productId);
            });
        });
    })
    .catch(error => {
        console.error('Error fetching products:', error);
    });

// Get all the categories
fetch ('http://127.0.0.1:3001/admin/all-category')
    .then(response => response.json())
    .then(categories => {
        addCategory("", categories)
    })
    .catch(error => {
        console.error('Error fetching products:', error);
    });

// Recursive to the selected category then get all its attributes
function getAttributesInCreate(path, des) {
    if (path["name"] == des) {
        const keys = Object.keys(path)

        keys.forEach(key => {
            if (key != "sub_category" && key != "name") {
                createCateAttrDiv.innerHTML += `<label for="${key}">${key}</label>`
                createCateAttrDiv.innerHTML += `<input id="create-category-${key}-input" name="${key}" placeholder="${key}" type="${path[key].type}" ${path[key].type == "number" ? 'value="0" min="0"' : "" } ${path[key].required ? "required" : "" }>`
            }
        })
        return true
    }

    if (path['sub_category']) {
        path['sub_category'].forEach(cate => {
            const result = getAttributesInCreate(cate, des)
            if (result) {
                return result;
            }
        });
    }
    return false
}

// Recursive to the selected category then get all its attributes
function getAttributesInUpdate(path, des) {
    if (path["name"] == des) {
        const keys = Object.keys(path)

        keys.forEach(key => {
            if (key != "sub_category" && key != "name") {
                updateCateAttrDiv.innerHTML += `<label for="${key}">${key}</label>`
                updateCateAttrDiv.innerHTML += `<input id="update-category-${key}-input" name="${key}" placeholder="${key}" type="${path[key].type}" ${path[key].type == "number" ? 'value="0" min="0"' : "" } ${path[key].required ? "required" : "" }>`
            }
        })
        return true
    }

    if (path['sub_category']) {
        path['sub_category'].forEach(cate => {
            const result = getAttributesInUpdate(cate, des)
            if (result) {
                return result;
            }
        });
    }
    return false
}

// Recursive to get all the top categories and their sub-categories
function addCategory(from, category) {
    for (const cate of category) {
        var value = from ? `${from}-${cate.name}` : cate.name;

        createSelectedMenu.innerHTML += `<option value="${value}">${cate.name}</option>`;
        updateSelectedMenu.innerHTML += `<option value="${value}">${cate.name}</option>`;
        
        if (cate.sub_category) {
            addCategory(cate.name, cate.sub_category);
        }
    }
}

// Retrieve and fill in the data from the selected product to 
function fillInUpdateForm(productId) {
    fetch(`http://127.0.0.1:3001/products/${productId}`)
        .then(response => response.json())
        .then(product => {
            document.getElementById('update-id').textContent = product.id;
            document.getElementById('update-title-input').value = product.title;
            document.getElementById('update-category').value = product.category;
            document.getElementById('update-description-input').value = product.description;
            document.getElementById('update-price-input').value = product.price;
            document.getElementById('update-length-input').value = product.length;
            document.getElementById('update-width-input').value = product.width;
            document.getElementById('update-height-input').value = product.height;

            // Process and resize image
            const img = new Image();
            img.src = `Assets/${product.image}`;

            img.onload = function() {
                const width = img.width;
                const height = img.height;

                let newWidth = width;
                let newHeight = height;

                if (width > maxWidth || height > maxHeight) {
                    const aspectRatio = width / height;

                    if (width > maxWidth) {
                    newWidth = maxWidth;
                    newHeight = newWidth / aspectRatio;
                    }

                    if (newHeight > maxHeight) {
                    newHeight = maxHeight;
                    newWidth = newHeight * aspectRatio;
                    }
                }

                updateImageTag.src = img.src;
                updateImageTag.style.width = newWidth + "px";
                updateImageTag.style.height = newHeight + "px";
            };

            const value = product.category
            const category = value.split("-")
            updateCateAttrDiv.innerHTML = ""

            // Retrieve all the attributes of the selected category and fill in the data of the selected product
            fetch (`http://localhost:3001/admin/category/${value}`)
                .then(response => response.json())
                .then(attributes => {
                    getAttributesInUpdate(attributes, category[category.length-1])
                    
                    fetch (`http://localhost:3001/products/category/${productId}`)
                        .then(response => response.json())
                        .then(attributes => {
                            const keys = Object.keys(attributes)
                            keys.forEach(key => {
                                document.getElementById(`update-category-${key}-input`).value = attributes[key] ? attributes[key] : ""
                            })
                        })
                        .catch(error => {
                            console.error('Error fetching products:', error);
                        });
                
                })
                .catch(error => {
                    console.error('Error fetching products:', error);
                });
        });

    // Show update form after filling in
    overlay.style.display = 'block';
    createFormContainer.style.display = 'none';
    updateFormContainer.style.display = 'block';
}

// Update the attribute inputs based on the selected category in Update form
updateSelectedMenu.addEventListener("change", function(event) {
    const value = updateSelectedMenu.value
    const category = value.split("-")
    updateCateAttrDiv.innerHTML = ""

    fetch (`http://localhost:3001/admin/category/${value}`)
        .then(response => response.json())
        .then(attributes => {
            getAttributesInUpdate(attributes, category[category.length-1])
        })
        .catch(error => {
            console.error('Error fetching products:', error);
        });
});

// Update the attribute inputs based on the selected category in Create form
createSelectedMenu.addEventListener("change", function(event) {
    const value = createSelectedMenu.value
    createCateAttrDiv.innerHTML = ""
    const category = value.split("-")
    

    fetch (`http://localhost:3001/admin/category/${value}`)
        .then(response => response.json())
        .then(attributes => {
            getAttributesInCreate(attributes, category[category.length-1])
        })
        .catch(error => {
            console.error('Error fetching products:', error);
        });
});

// Process and resize image when inputting in Create form
document.getElementById("create-image-input").addEventListener("change", function(event) {
    var reader = new FileReader();

    reader.onload = function(e) {
        const img = new Image();
        img.src = e.target.result;

        img.onload = function() {
            const width = img.width;
            const height = img.height;

            let newWidth = width;
            let newHeight = height;

            if (width > maxWidth || height > maxHeight) {
                const aspectRatio = width / height;

                if (width > maxWidth) {
                    newWidth = maxWidth;
                    newHeight = newWidth / aspectRatio;
                }

                if (newHeight > maxHeight) {
                    newHeight = maxHeight;
                    newWidth = newHeight * aspectRatio;
                }
            }

            createImageTag.src = img.src;
            createImageTag.style.width = newWidth + "px";
            createImageTag.style.height = newHeight + "px";
        };
    };
    
    reader.readAsDataURL(event.target.files[0]);
});

// Process and resize image after inputting in Update form
document.getElementById("update-image-input").addEventListener("change", function(event) {
    var reader = new FileReader();
  
    reader.onload = function(e) {
        const img = new Image();
        img.src = e.target.result;
    
        img.onload = function() {
            const width = img.width;
            const height = img.height;
    
            let newWidth = width;
            let newHeight = height;
    
            if (width > maxWidth || height > maxHeight) {
                const aspectRatio = width / height;
        
                if (width > maxWidth) {
                    newWidth = maxWidth;
                    newHeight = newWidth / aspectRatio;
                }
        
                if (newHeight > maxHeight) {
                    newHeight = maxHeight;
                    newWidth = newHeight * aspectRatio;
                }
            }
    
            updateImageTag.src = img.src;
            updateImageTag.style.width = newWidth + "px";
            updateImageTag.style.height = newHeight + "px";
        };
    };
        
    reader.readAsDataURL(event.target.files[0]);
});

// Display Create form
document.getElementById('create-button').addEventListener('click', () => {
    overlay.style.display = 'block';
    createFormContainer.style.display = 'block';
    updateFormContainer.style.display = 'none';

    const value = createSelectedMenu.value
    createCateAttrDiv.innerHTML = ""
    const category = value.split("-")

    fetch (`http://localhost:3001/admin/category/${value}`)
        .then(response => response.json())
        .then(attributes => {
            getAttributesInCreate(attributes, category[category.length-1])
        })
        .catch(error => {
            console.error('Error fetching products:', error);
        });
});

// Hide Create form
document.getElementById('cancel-button-1').addEventListener('click', () => {
    overlay.style.display = 'none';
    createFormContainer.style.display = 'none';
    updateFormContainer.style.display = 'none';
    location.reload()
});

// Hide Update form
document.getElementById('cancel-button-2').addEventListener('click', () => {
    overlay.style.display = 'none';
    createFormContainer.style.display = 'none';
    updateFormContainer.style.display = 'none';
    location.reload()
});

// Create product template
document.getElementById('form-create-button').addEventListener('click', async event => {
    // Get all the input data from the form
    const title = document.getElementById('create-title-input').value;
    const description = document.getElementById('create-description-input').value;
    const category = document.getElementById('create-category').value;
    const price = parseFloat(document.getElementById('create-price-input').value);
    const length = parseFloat(document.getElementById('create-length-input').value);
    const width = parseFloat(document.getElementById('create-width-input').value);
    const height = parseFloat(document.getElementById('create-height-input').value);
    const imageInput = document.getElementById('create-image-input').files[0];
    
    // Check invalid inputs
    if (title === "") {
        alert("Invalid Input! Product should have title!")
        return
    }

    if (description === "") {
        alert("Invalid Input! Product should have description!")
        return
    }

    if (category === "") {
        alert("Invalid Input! Product should have category!")
        return
    }

    if (price <= 0) {
        alert("Invalid Input! Product should have price!")
        return
    }

    if (length <= 0) {
        alert("Invalid Input! Product should have length!")
        return
    }

    if (width <= 0) {
        alert("Invalid Input! Product should have width!")
        return
    }

    if (height <= 0) {
        alert("Invalid Input! Product should have height!")
        return
    }

    // Create and append data into FormData
    const formData = new FormData()
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('price', price);
    formData.append('length', length);
    formData.append('width', width);
    formData.append('height', height);
    formData.append('image', imageInput !== undefined ? imageInput : '');

    const input_tags = document.querySelectorAll("#create-category-attributes input")
    var attributes = {}
    for (var i = 0; i < input_tags.length; i++) {
        const itemKey = input_tags[i].id
        const itemValue = input_tags[i].value
        attributes[itemKey.split("-")[2]] = itemValue;
    }

    formData.append('category_attr', JSON.stringify(attributes));

    // Send data
    try {
        const response = await fetch('http://127.0.0.1:3001/products', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const responseData = await response.json();
            alert(`Product created with ID: ${responseData.productId}`);
            location.reload();
        } else {
            console.error('Failed to create product');
        }
    } catch (error) {
        console.error('Error creating product:', error);
    }

    createFormContainer.style.display = 'none';
    overlay.style.display = 'none';
});

// Delete product template
document.getElementById('form-delete-button').addEventListener('click', async (event) => {
    const productID = document.getElementById('update-id').textContent

    try {
        // Check if the current product template has inbounded orders
        const result = await fetch(`http://127.0.0.1:3001/product/${productID}/count`)
            .then(response => response.json())
            .then(data => {return data})
            .catch(error => {
                console.error('Error fetching products:', error);
            });

        // Alert cannot delete the product template that has inbounded orders
        if (result[0].count !== 0) {
            alert("Cannot delete the template if there are products")
            return
        }

        // Else delete product template
        const response = await fetch(`http://127.0.0.1:3001/products/${productID}`, {method: 'DELETE'});

        if (response.ok) {
            const responseData = await response.json();
            alert('Product deleted');
            location.reload();
        } else {
            console.error('Failed to create product');
        }
        
    } catch (error) {
        console.error('Error creating product:', error);
    }
    
    updateFormContainer.style.display = 'none';
    overlay.style.display = 'none';
});

// Update product template
document.getElementById('form-update-button').addEventListener('click', async () => {
    const productID = document.getElementById('update-id').textContent

    // Check if the current product template has inbounded orders
    const result = await fetch(`http://127.0.0.1:3001/product/${productID}/count`)
        .then(response => response.json())
        .then(data => {return data})
        .catch(error => {
            console.error('Error fetching products:', error);
        });

    // Alert cannot delete the product template that has inbounded orders
    if (result[0].count !== 0) {
        alert("Cannot update the template if there are products")
        return
    }

    // Get all the input data from the Update form
    const title = document.getElementById('update-title-input').value;
    const description = document.getElementById('update-description-input').value;
    const category = document.getElementById('update-category').value;
    const price = parseFloat(document.getElementById('update-price-input').value);
    const length = parseFloat(document.getElementById('update-length-input').value);
    const width = parseFloat(document.getElementById('update-width-input').value);
    const height = parseFloat(document.getElementById('update-height-input').value);
    const imageInput = document.getElementById('update-image-input').files[0];
    
    // Check invalid inputs
    if (title === "") {
        alert("Invalid Input! Product should have title!")
        return
    }

    if (description === "") {
        alert("Invalid Input! Product should have description!")
        return
    }

    if (category === "") {
        alert("Invalid Input! Product should have category!")
        return
    }

    if (price <= 0) {
        alert("Invalid Input! Product should have price!")
        return
    }

    if (length <= 0) {
        alert("Invalid Input! Product should have length!")
        return
    }

    if (width <= 0) {
        alert("Invalid Input! Product should have width!")
        return
    }

    if (height <= 0) {
        alert("Invalid Input! Product should have height!")
        return
    }

    // Create and append the data into FormData
    const formData = new FormData()
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('price', price);
    formData.append('length', length);
    formData.append('width', width);
    formData.append('height', height);
    formData.append('image', imageInput !== undefined ? imageInput : '');

    try {
        // Send data
        const response = await fetch(`http://127.0.0.1:3001/products/${productID}`, {
            method: 'PUT',
            body: formData
        });

        if (response.ok) {
            const responseData = await response.json();
            alert(`Product updated`);
            location.reload();
        } else {
            console.error('Failed to update product');
        }
    } catch (error) {
        console.error('Error updating product:', error);
    }
});

// Create inbounded orders
document.getElementById('form-order-button').addEventListener('click', async () => {
    // Ask the user to prompt the quantity of the order
    var quantity = prompt('Enter the quantity:', '1');

    // Check invalid input
    if (quantity === null) {
        alert('Invalid Input');
        return
    }

    // Evaluate the volume of the product
    const volume = parseInt(document.getElementById('update-length-input').value) * 
                   parseInt(document.getElementById('update-width-input').value) *
                   parseInt(document.getElementById('update-height-input').value);

    // Create JSON data
    const data = {
        'pid': parseInt(document.getElementById('update-id').textContent),
        'quantity': parseInt(quantity),
        'volume': parseInt(volume)
    }

    try {
        // Send data
        const response = await fetch('http://127.0.0.1:3001/orders/insert_orders', {
            method: 'POST',
            headers:{'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });

        if (response.ok) {
            const responseData = await response.json();
            alert(`Order created!`);
            location.reload();
        } else {
            console.error('Failed to create product');
        }
    } catch (error) {
        console.error('Error creating product:', error);
    }
    overlay.style.display = 'none';
});