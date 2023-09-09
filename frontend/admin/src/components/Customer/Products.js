import { useEffect, useState } from 'react';
import {Link, redirect, useLoaderData, useParams} from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
function Products() {
    const navigate = useNavigate();
    const loadData = useLoaderData();
    const params = useParams();
    const customerID = params.customerID;
    
    const [categories, setCategories] = useState([]);
    
    const [category, setCategory] = useState(null);
    const [products, setProducts] = useState(loadData);
    const [defaultProducts, setDefaultProducts] = useState(loadData);
    const [searchInput, setSearchInput] = useState('');
    
    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(100000);
    
    const [sortPrice, setSortPrice] = useState('sort');
    const [sortTime, setSortTime] = useState('sort');

    const [quantity, setQuantity] = useState(0);
    const [orderProduct, setOrderProduct] = useState(null);
    const [orderVisibility, setOrderVisibility] = useState('none');
    const [cart, setCart] = useState([]);

    useEffect(() => {
        fetch('http://localhost:3001/product/category')
        .then(res => res.json()) 
        .then(data => {
            setCategories(data);
        })
        .catch(e => console.log(e))

        if (localStorage.getItem('cart') === null || localStorage.getItem('cart') === undefined) {
    
        }
        else {
            setCart(JSON.parse(localStorage.getItem('cart')));
        }
    }, []);

    function handleGoBack() {
        if (localStorage.getItem('cart') !== null) {
            window.alert("Please complete your transaction by going to cart to accept or reject~");
        }
        else {
            return navigate('/customer');
        }
    }

    console.log(cart);
    // Category Filter
    function handleCategory(e) {
        const newArray = [];
        for (const product of products) {
            if (product.category === e.target.value){
                newArray.push(product);
            }
        }
        setProducts(newArray);
        setCategory(e.target.value);
    }
    // console.log(category);

    // Search Input
    function handleSearchInput(e) {
        setSearchInput(e.target.value);
    }

    function searchProduct(e) {
        const newArray = [];
        for (const product of products) {
            if (product.title.includes(searchInput) || product.description.includes(searchInput)){
                newArray.push(product);
            }
        }
        setProducts(newArray);
        setSearchInput('');
    }

    //Price Input
    function handleMinPriceInput(e) {
        setMinPrice(e.target.value);
    }

    function handleMaxPriceInput(e) {
        setMaxPrice(e.target.value);
    }
    
    function searchPrice(e) {
        if (parseFloat(minPrice) >= parseFloat(maxPrice)) {
            window.alert('Min price must be smaller than max price');
            return;
        }
        const newArray = [];
        for (const product of products) {
            if (parseFloat(minPrice) <= parseFloat(product.price) && parseFloat(product.price) <= parseFloat(maxPrice)){
                newArray.push(product);
            }
        }
        setProducts(newArray);
        setMinPrice(0);
        setMaxPrice(100000);
    }

    function resetFilter(e) {
        setProducts(defaultProducts);
        setSearchInput('');
    }

    // Sorting
    function handleSortPrice(e) {
        setSortPrice(e.target.value);
        if (e.target.value === "asc") {
            products.sort((a,b) => {
                return a.price - b.price;
            });
        }
        else {
            products.sort((a,b) => {
                return b.price - a.price;
            });
        }
    }

    function handleSortTime(e) {
        setSortTime(e.target.value);
        if (e.target.value === "asc") {
            products.sort((a,b) => {
                return a.id - b.id;
            });
        }
        else {
            products.sort((a,b) => {
                return b.id - a.id;
            });
        }
    }


    // Cart

    function handleDecreaseQuantity() {
        if (quantity === 0) {
            window.alert("Order must be greater than 0");
        }
        else {
            setQuantity(quantity - 1);
        }
    }

    function handleIncreaseQuantity() {
        if (quantity + 1 > orderProduct.quantity) {
            window.alert("Insufficient products, you reached max stocks");
        }
        else {
            setQuantity(quantity + 1);
        }
    }

    function closeOrderForm() {
        setOrderVisibility('none');
        setOrderProduct(null);
        setQuantity(0);
    }

    async function submitOrderForm() {
        var refresh = false;
        if (quantity === 0) {
            window.alert(`Ordered 0 items`);
            refresh = true;
        }
        else {
            var _rollback = false;
            var newObject = {
                'product_template_id' : orderProduct.id,
                'customer_id' : parseInt(customerID),
                'product_quantity' : quantity,
                'title' : orderProduct.title,
                'price' : orderProduct.price
            }
            await fetch('http://localhost:3001/product/order', 
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newObject)
            })
            .then(res => res.json())
            .then(data => {
                // console.log(data);
                if (data[0]._rollback === 1) {
                    _rollback = true;
                } 
                else {
                    newObject['product_order_id'] = data[0].new_product_order_id;
                }
            })
            .catch(e => {
                console.log(e);
                return null;
            })
            if (!_rollback) {
                const newArray = [
                    ...cart,
                    newObject
                ];
                setCart(newArray);
                localStorage.removeItem('cart');
                localStorage.setItem('cart', JSON.stringify(newArray));
                orderProduct.quantity -= quantity;
                window.alert(`Ordered ${quantity} items`);
            }
            else {
                window.alert("Somebody already ordered it!");
                refresh = true;
            }
        }
        if (refresh) {
            navigate(0);
        }
        closeOrderForm();
    }

    function addToCart(product) {
        setOrderProduct(product);
        setOrderVisibility('block');
    }
    // console.log(cart);

    return (
        <div className='row mt-2'>
            <div className='col-2'>
                <div style={{position : "fixed"}} className='mx-4'>
                    <button className='btn btn-primary' onClick={handleGoBack}>
                        Go Back
                    </button>
                    <div className='mt-2'>  
                        <h4><strong>Category Filter</strong></h4>
                        
                        <select onChange={handleCategory} defaultValue="none">
                            <option value="none" disabled>Category</option>
                            {
                                categories.map(item => {
                                    return (
                                        <option value={item.category}>{item.category}</option>
                                    );
                                })
                            }
                        </select>
                    </div>
                </div>
            </div>
            <div className='col-8'>
                <div>
                    <div className='border border-2 border-danger mb-2'>
                        <h4 className='mb-2 d-flex justify-content-center fw-bold'>Filter By Title & Description</h4>
                        <div className='mb-2 d-flex justify-content-center'>
                            <input type="text" placeholder="Search here..." onChange={handleSearchInput} value={searchInput} />
                            <button className='btn btn-primary mx-2' onClick={searchProduct}>Search</button>
                        </div >
                    </div>
                    <div className='mb-2 border border-2 border-danger p-2'>
                        <h4 className='mb-2 d-flex justify-content-center fw-bold'>Filter By Price Range</h4>
                        <div className='d-flex justify-content-center'>
                            <label htmlFor='min-price'>Min Price</label>
                            <input type="number" name="min-price" placeholder="Minimum price..." onChange={handleMinPriceInput} value={minPrice} />
                        </div>
                        <div className='d-flex justify-content-center'>
                            <label htmlFor='max-price'>Max Price</label>
                            <input type="number" name='max-price' placeholder="Maximum price..." onChange={handleMaxPriceInput} value={maxPrice} />
                        </div>
                        <div className='d-flex justify-content-center'>
                            <button className='btn btn-primary mx-2' onClick={searchPrice}>Search Price</button>
                        </div>
                    </div>
                    <div className='mb-2 d-flex justify-content-center'>
                        <button className='btn btn-danger mx-2' onClick={resetFilter}>Reset Filter</button>
                    </div>
                </div>
                <div style={{display: orderVisibility, position: "fixed", marginLeft: "20%"}} id='orderForm'>
                    <div className='border border-3 border-warning bg-black text-white' id='orderSubForm'>
                        <div className='d-flex justify-content-center'>
                            <h1>Product ID: {(orderProduct !== null) ? orderProduct.id : 0}</h1>
                        </div>
                        <div className='d-flex justify-content-center'>
                            <h1>Quantity in stock: {(orderProduct !== null) ? orderProduct.quantity : 0}</h1>
                        </div>
                        <div className='d-flex justify-content-center'>
                            <button className='btn btn-primary mx-2' onClick={handleDecreaseQuantity}> - </button>
                            <span className='fw-bold h3'>{quantity}</span>
                            <button className='btn btn-primary mx-2' onClick={handleIncreaseQuantity}> + </button>
                        </div>
                        <div className='d-flex justify-content-center mt-2'>
                            <button className='btn btn-success mx-2' onClick={submitOrderForm}>Add To Cart</button>
                            <button className='btn btn-danger mx-2' onClick={closeOrderForm}>Close</button>
                        </div>
                    </div>
                </div>
                {
                    products.map(product => {
                        // console.log(product.quantity);
                        // console.log(product);
                        return (
                            <div className='container border border-2 border-primary mb-2 d-flex justify-content-between'>
                                <div className='d-block'>
                                    <h6>Id: {product.id}</h6>
                                    <h6>Title: {product.title}</h6>
                                    <h6>Description: {product.description}</h6>
                                    <h6>Price: {product.price}</h6>
                                    <h6>Category: {product.category}</h6>
                                </div>
                                <div className='mt-5'>
                                    <button className='btn btn-danger' onClick={() => addToCart(product)}>Add To Cart</button>
                                </div>
                                <img src={product.image} alt={product.image}/>
                            </div>
                        );
                    })
                }
            </div>
            <div className='col-2'>
                <div style={{position : "fixed"}}>
                    <div>
                        <Link to="cart" className='fw-bold' state={cart}>
                            <h3>
                                <div>
                                    Cart Item : {cart.length}
                                </div>
                                Go To Cart
                            </h3>
                        </Link>
                    </div>
                    <h2>Sort By Price</h2>
                    <select onChange={handleSortPrice} defaultValue="sort">
                        <option value="sort" disabled>Sort</option>
                        <option value="asc">Ascending</option>
                        <option value="desc">Descending</option>
                    </select>

                    <h2>Sort By Time</h2>
                    <select onChange={handleSortTime} defaultValue="sort">
                        <option value="sort" disabled>Sort</option>
                        <option value="asc">Ascending</option>
                        <option value="desc">Descending</option>
                    </select>
                </div>
            </div>
        </div>

    );

}


export default Products;



export async function loadCustomerProducts({params}) {
    var data = await
    fetch('http://localhost:3001/product')
    .then(res => res.json())
    .then(data => {
        // console.log(data);
        return data;
    })
    .catch(e => {
        console.log(e);
        return null;
    })
    await data.map(async item => {
        const templateID = item.id;
        // console.log(templateID);
        const quantity = await fetch(`http://localhost:3001/product/${templateID}/count`)
        .then(res => res.json()) 
        .then(data => {
            return data[0].count;
        })
        .catch (e => console.log(e));

        // console.log(templateID + " : " + quantity);
        item['quantity'] = quantity;
        // console.log(item);
        return item;
    })
    // console.log(data);
    return data;
}

