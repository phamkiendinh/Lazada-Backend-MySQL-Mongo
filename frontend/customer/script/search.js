let list = document.getElementById('list');
let filter = document.querySelector('.filter');
let count = document.getElementById('count');
let listProducts = [
    {
        id: 1,
        name: 'Iphone 14 Pro Max',
        description: 'This is title 1',
        category: 'electronic',
        price: 10,
        image: 'Image 1.jpg',
        wid: 1,
        nature: {
            length: 5,
            width: 10,
            height: 15
        }
    },
    {
        id: 2,
        name: 'Iphone 14 Pro Max',
        description: 'This is title 2',
        category: 'mobilephone',
        price: 10,
        image: 'Image 2.jpg',
        wid: 1,
        nature: {
            length: 5,
            width: 10,
            height: 15
        }
    },
    {
        id: 3,
        name: 'Iphone 14 Pro Max',
        description: 'This is title 3',
        category: 'television',
        price: 10,
        image: 'Image 3.jpg',
        wid: 1,
        nature: {
            length: 5,
            width: 10,
            height: 15
        }
    },
    {
        id: 4,
        name: 'Iphone 14 Pro Max',
        description: 'This is title 4',
        category: 'shoes',
        price: 10,
        image: 'Image 4.jpg',
        wid: 1,
        nature: {
            length: 5,
            width: 10,
            height: 15
        }
    },
];
let productFilter = listProducts;
showProduct(productFilter);
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
filter.addEventListener('submit', function(event){
    event.preventDefault();
    let valueFilter = event.target.elements;
    productFilter = listProducts.filter(item => {
        // check category
        if(valueFilter.category.value != ''){
            if(item.nature.type != valueFilter.category.value){
                return false;
            }
        }
        // check warehouse available
        if(valueFilter.wid.value != ''){
            if(!item.nature.color.includes(valueFilter.color.value)){
                return false;
            }
        }
        // check name
        if(valueFilter.name.value != ''){
            if(!item.name.includes(valueFilter.name.value)){
                return false;
            }
        }
        // check min price
        if(valueFilter.minPrice.value != ''){
            if(item.price < valueFilter.minPrice.value){
                return false;
            }
        }
        //  check max price
        if(valueFilter.maxPrice.value != ''){
            if(item.price > valueFilter.maxPrice.value){
                return false;
            }
        }


        return true;
    })
    showProduct(productFilter);
})

console.log(listProducts);