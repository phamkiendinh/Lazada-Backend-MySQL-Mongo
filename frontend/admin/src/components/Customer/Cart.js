import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";


function Cart() {
    const navigate = useNavigate();
    const cart = useLocation().state;
    const customerID = useParams().customerID;
    const [totalPrice, setTotalPrice] = useState(0.0);
    
    useEffect(() => {
        var sum = 0.0;
        cart.map(item => {
            sum += parseFloat(item.price * item.product_quantity);
        })
        setTotalPrice(sum.toFixed(2));
    },[]);

    async function handleOrder(status) {
        for (const item of cart) {
            await fetch('http://localhost:3001/product/order/finish', 
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(
                    {
                        order_status: status,
                        product_order_id: item.product_order_id
                    }
                )
            })
        }
        localStorage.removeItem('cart');
        navigate(`/customer/${customerID}`);
    }

    if (cart.length === 0) {
        return (
            <div className="d-flex justify-content-center fw-bold">
                <h1 className="fw-bold">
                    Cart has no items!
                    <div className="d-flex justify-content-center fw-bold">
                        <Link to={`/customer/${customerID}`}>Go Back</Link>
                    </div>
                </h1>
            </div>
        );
    }
    // console.log(cart);    

    return (
        <div className="row mt-2">
            <div className="col-5 mx-1">
                <div className="d-flex justify-content-center fw-bold">
                    <button className="btn btn-primary mb-2">
                        <Link to={`/customer/${customerID}`} className="text text-white">Go Back</Link>
                    </button>
                </div>
                <div>
                    {
                        cart.map(item => {
                            return (
                                <div className="border border-2 border-primary mb-2 mb-2">
                                    <h2><strong>Order ID: </strong>{item.product_order_id}</h2>
                                    <h2><strong>Product ID: </strong>{item.product_template_id}</h2>
                                    <h2><strong>Title: </strong>{item.title}</h2>
                                    <h2><strong>Ordered Quantity: </strong>{item.product_quantity}</h2>
                                    <h2><strong>Product Price: </strong>{item.price}</h2>
                                    <h2><strong>Total Product Price: </strong>{parseFloat(item.price * item.product_quantity).toFixed(2)}</h2>
                                </div>
                            );
                        })
                    }
                </div>
            </div>

            <div className="col-5">
                <div style={{position: "fixed", marginTop: "30%"}}>
                    <div>
                        <h1>Total Price: {totalPrice}</h1>
                    </div>
                    <button className="btn btn-primary mx-2" onClick={() => handleOrder(1)}>Accept Order</button>
                    <button className="btn btn-danger" onClick={() => handleOrder(0)}>Reject Order</button>
                </div>
            </div>
        </div>
    );
}


export default Cart;