const orderFormContainer = document.getElementById('order-form-container');
const tableBody = document.querySelector('#orderTable tbody');
const selectedMenu = document.getElementById('order-product');
const maxWidth = 250;
const maxHeight = 250;

fetch('http://127.0.0.1:3001/orders')
    .then(response => response.json())
    .then(orders => {
        if (orders.length === 0) {
            const noOrdersRow = `
                <tr>
                    <td colspan="4">No orders available.</td>
                </tr>`;
            tableBody.innerHTML += noOrdersRow;
        } else {
            orders.forEach(order => {
                var row = `
                    <tr>
                        <td>${order.id}</td>
                        <td>${order.pname}</td>
                        <td>${order.quantity}</td>
                        <td>${order.status}</td>
                    </tr>`;
                tableBody.innerHTML += row;
            });
        }
    })
    .catch(error => {
        console.error('Error fetching products:', error);
    });


fetch('http://127.0.0.1:3001/products')
    .then(response => response.json())
    .then(products => {
        products.forEach(product => {
        selectedMenu.innerHTML += 
            `<option value="${product.id}">${product.title}</option>`;
        });
    })
    .catch(error => {
        console.error('Error fetching products:', error);
    });


document.getElementById('order-button').addEventListener('click', () => {
    overlay.style.display = 'block';
    orderFormContainer.style.display = 'block';
});

document.getElementById('cancel-button-1').addEventListener('click', () => {
    overlay.style.display = 'none';
    orderFormContainer.style.display = 'none';
});


selectedMenu.addEventListener('change', event => {
    if (event.target.value == 0) {
        document.getElementById('order-product-img').src = ''
    } else {
        const value = selectedMenu.value

        fetch(`http://127.0.0.1:3001/products/${value}`)
            .then(response => response.json())
            .then(product => {
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

                    document.getElementById('order-product-img').src = img.src;
                    document.getElementById('order-product-img').style.width = newWidth + "px";
                    document.getElementById('order-product-img').style.height = newHeight + "px";
                };

                document.getElementById('order-volume-input').textContent = product.length * product.width * product.height
            })
            .catch(error => {
                console.error('Error fetching products:', error);
            });

    }
});

document.getElementById('form-order-button').addEventListener('click', async () => {
    const data = {
        'pid': document.getElementById("order-product").value,
        'quantity': document.getElementById('order-quantity-input').value,
        'status':'Pending'
    }

    try {
        const response = await fetch('http://127.0.0.1:3001/orders', {
            method: 'POST',
            headers:{'Content-Type': 'application/json'}, // default is application/x-www-form-urlencoded
            body: JSON.stringify(data)
        });

        if (response.ok) {
            const responseData = await response.json();
            alert(`Order created with ID: ${responseData.orderId}`);
            location.reload();
        } else {
            console.error('Failed to create product');
        }
    } catch (error) {
        console.error('Error creating product:', error);
    }

    orderFormContainer.style.display = 'none';
    overlay.style.display = 'none';
});