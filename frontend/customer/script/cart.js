 // Function to fetch data from localhost:3001/product
 async function fetchData() {
    try {
        const response = await fetch('http://localhost:3001/product');
        const data = await response.json();
        displayData(data); // Call a function to display the data
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Function to display the fetched data
function displayData(products) {
    const rootTable = document.getElementById('root');

    // Clear any existing data in the table
    rootTable.innerHTML = '';

    // Iterate over the products and create rows for each product
    products.forEach(product => {
        const { title, price } = product;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td width="150"><div class="img-box"><img class="img" src="${product.image}"></div></td>
            <td width="360"><p style='font-size:15px;'>${title}</p></td>
            <td width="150"><h2 style='font-size:15px; color:red; '>$ ${price}</h2></td>
            <td width="70"><i class='fa-solid fa-trash' onclick='delElement("${title}")'></i></td>
        `;
        rootTable.appendChild(row);
    });

    // Update the total and item count
    const itemA = document.getElementById('itemA');
    const itemB = document.getElementById('itemB');
    const totalA = document.getElementById('totalA');
    const totalB = document.getElementById('totalB');

    const itemCount = products.length;
    itemA.textContent = `${itemCount} Items`;
    itemB.textContent = `${itemCount} Items`;

    const total = products.reduce((acc, product) => acc + product.price, 0);
    totalA.textContent = `$ ${total.toFixed(2)}`;
    totalB.textContent = `$ ${total.toFixed(2)}`;
}

// Call the fetchData function to initiate the data retrieval
fetchData();