let list = document.getElementById('list');
let filter = document.querySelector('.filter');
let count = document.getElementById('count');
let listProducts = [];
let productFilter = listProducts;

async function getProduct() {
    const data = await fetch(`http://localhost:3001/product`);
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }

    const data = await response.json();
    listProducts = data;

    // Call showProduct to display the product data in HTML
    showProduct(listProducts);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

getProduct();


function showProduct(productFilter){
    count.innerText = productFilter.length;
    list.innerHTML = '';
    productFilter.forEach(item => {
        let newItem = document.createElement('div');
        newItem.classList.add('item');

        // create image
        let newImage = new Image();
        newImage.src = item.image;
        newItem.appendChild(newImage);

        // create name product
        let newTitle = document.createElement('div');
        newTitle.classList.add('title');
        newTitle.innerText = item.name;
        newItem.appendChild(newTitle);

        //create product's description
        let newDescription = document.createElement('div');
        newDescription.classList.add('description');
        newDescription.innerText = item.description;
        newItem.appendChild(newDescription);
        
        // create price
        let newPrice = document.createElement('div');
        newPrice.classList.add('price');
        newPrice.innerText = '$' + item.price.toLocaleString();
        newItem.appendChild(newPrice);

        list.appendChild(newItem);
    });
}


// Add event listener for the filter form submission
filter.addEventListener('submit', function (event) {
    event.preventDefault();
  
    // Get filter values
    let valueFilter = event.target.elements;
  
    productFilter = listProducts.filter(item => {
      // Check category
      if (valueFilter.category.value !== '') {
        if (item.category !== valueFilter.category.value) {
          return false;
        }
      }
      // Check warehouse available
      if (valueFilter.wid.value !== '') {
        if (!item.warehouse.includes(parseInt(valueFilter.wid.value))) {
          return false;
        }
      }
      // Check name
      if (valueFilter.name.value !== '') {
        if (!item.name.includes(valueFilter.name.value)) {
          return false;
        }
      }
      // Check min price
      if (valueFilter.minPrice.value !== '') {
        if (item.price < parseFloat(valueFilter.minPrice.value)) {
          return false;
        }
      }
      // Check max price
      if (valueFilter.maxPrice.value !== '') {
        if (item.price > parseFloat(valueFilter.maxPrice.value)) {
          return false;
        }
      }
  
      return true;
    });
  
    // Update the displayed products based on the filter
    showProduct(productFilter);
  });
  