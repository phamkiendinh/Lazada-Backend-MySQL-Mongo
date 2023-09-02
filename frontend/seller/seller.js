const productList = document.querySelector("#product-list")
const createImageTag = document.getElementById('create-product-img');
const updateImageTag = document.getElementById('update-product-img');
const maxWidth = 350;
const maxHeight = 350;
const overlay = document.getElementById('overlay');
const createFormContainer = document.getElementById('create-form-container');
const updateFormContainer = document.getElementById('update-form-container');

fetch ('http://127.0.0.1:3001/admin/category')
    .then(response => response.json())
    .then(categories => {
        const createSelectedMenu = document.getElementById('create-category')
        const updateSelectedMenu = document.getElementById('update-category')
        categories.forEach(category => {
            createSelectedMenu.innerHTML += `<option value="${category.name}">${category.name}</option>`;
            updateSelectedMenu.innerHTML += `<option value="${category.name}">${category.name}</option>`;
        });
    })
    .catch(error => {
        console.error('Error fetching products:', error);
    });


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
            overlay.style.display = 'block';
            createFormContainer.style.display = 'none';
            updateFormContainer.style.display = 'block';
    })
}

fetch('http://127.0.0.1:3001/products')
    .then(response => response.json())
    .then(products => {
        products.forEach(product => {
            productList.innerHTML += 
                `<div data-product-id="${product.id}" class="product-item">
                    <div class="product-image">
                        <img src="Assets/${product.image}" alt="${product.title}">
                    </div>
                    <h3 class="product-name">${product.title}</h3>
                    <p class="product-price">${product.price}</p>
                </div>`;
        });


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

document.getElementById('create-button').addEventListener('click', () => {
    overlay.style.display = 'block';
    createFormContainer.style.display = 'block';
    updateFormContainer.style.display = 'none';
});

document.getElementById('cancel-button-1').addEventListener('click', () => {
    overlay.style.display = 'none';
    createFormContainer.style.display = 'none';
    updateFormContainer.style.display = 'none';
});

document.getElementById('cancel-button-2').addEventListener('click', () => {
    overlay.style.display = 'none';
    createFormContainer.style.display = 'none';
    updateFormContainer.style.display = 'none';
});

document.getElementById('form-create-button').addEventListener('click', async event => {
    const formData = new FormData()
    formData.append('title', document.getElementById('create-title-input').value);
    formData.append('description', document.getElementById('create-description-input').value);
    formData.append('category', document.getElementById('create-category').value);
    formData.append('price', parseFloat(document.getElementById('create-price-input').value));
    formData.append('length', parseFloat(document.getElementById('create-length-input').value));
    formData.append('width', parseFloat(document.getElementById('create-width-input').value));
    formData.append('height', parseFloat(document.getElementById('create-height-input').value));
    
    const imageInput = document.getElementById('create-image-input').files[0];
    formData.append('image', imageInput !== undefined ? imageInput : '');

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

document.getElementById('form-delete-button').addEventListener('click', async () => {
    const productID = document.getElementById('update-id').textContent

    try {
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

document.getElementById('form-update-button').addEventListener('click', async () => {
    const productID = document.getElementById('update-id').textContent

    const formData = new FormData()
    formData.append('title', document.getElementById('update-title-input').value);
    formData.append('description', document.getElementById('update-description-input').value);
    formData.append('category', document.getElementById('update-category').value);
    formData.append('price', parseFloat(document.getElementById('update-price-input').value));
    formData.append('length', parseFloat(document.getElementById('update-length-input').value));
    formData.append('width', parseFloat(document.getElementById('update-width-input').value));
    formData.append('height', parseFloat(document.getElementById('update-height-input').value));

    const imageInput = document.getElementById('update-image-input').files[0];
    formData.append('image', imageInput !== undefined ? imageInput : '');

    try {
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