import { useEffect, useState } from "react";
import { useLoaderData } from "react-router";
import { Form, useNavigate } from "react-router-dom";

function ViewProducts() {
    const data = useLoaderData();
    const navigate = useNavigate();
    const [productID, setProductID] = useState(0);
    const [allWareHouse, setAllWareHouse] = useState([]);
    const [oldWareHouseID, setOldWareHouseID] = useState(0);
    const [newWareHouseID, setNewWareHouseID] = useState(0);
    const [formVisibility, setFormVisibility] = useState('none');
    const [divSize, setDivSize] = useState("col-8 mt-2 d-block justify-content-center");
;

    useEffect(() => { 
        fetch(`http://localhost:3001/admin/warehouse`)
        .then(res => res.json())
        .then(data => {
            setAllWareHouse(data);
        })
        .catch(e => {
            console.log(e);
        })
    },[]);

    function updateNewWareHouseID(newWareHouseID) {
        setNewWareHouseID(newWareHouseID);
    }
    
    function moveProduct(productID, oldWareHouseID) {
        setProductID(productID);
        setOldWareHouseID(oldWareHouseID);
        setFormVisibility('block');
        setDivSize("col-4 mt-2 d-block justify-content-center");
    }

    async function submitForm() {
        const json = {
            "productID" : productID,
            "old_warehouse_id" : oldWareHouseID,
            "new_warehouse_id" : newWareHouseID,
        }
        const data = await
        await fetch(`http://localhost:3001/admin/warehouse/${oldWareHouseID}/products/move`, 
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(json)
        })
        .then(res => res.json())
        .then(data => {
            console.log(data);
            return data;
        })
        .catch(e => {
            console.log(e);
            return null;
        })
        var response = data[0][0];
        console.log(response);
        
        if (data === null || data === undefined) {
            alert("Volume Exceeded, can't move to this warehouse");
        }
        else if (response._rollback === 1) {
            alert("Volume Exceeded, can't move to this warehouse");
        }
        else {
            navigate(0);
        }

    };

    function closeForm() {
        setProductID(0);
        setNewWareHouseID(0);
        setFormVisibility('none');
        setDivSize("col-8 mt-2 d-block justify-content-center");
    }

    if (data === null || data.length === 0){
        return (
            <div className="row">
                <div className="col-2 mt-2">
                    <button className="btn btn-primary mx-5" onClick={() => navigate('/admin/warehouse')}>
                        Go Back
                    </button>
                </div>
                <div className="col-8 mt-2 d-flex justify-content-center">
                    <h1 className="fw-bold">No Products Added</h1>
                </div>
            </div>
        );
    }


    return (
        <div className="row">
        <div className="col-2 mt-2">
            <button className="btn btn-primary mx-5" onClick={() => navigate('/admin/warehouse')}>
                Go Back
            </button>
        </div>
        <div className={divSize}>
            {
                data.map(item => {
                    var entries = Object.entries(item);
                    // console.log(entries);
                    return (
                        <div className="border border-2 border-primary mb-2" key={item.id}>
                            {
                                entries.map(entry => {
                                var key = entry[0];
                                var value = entry[1];
                                return (
                                        <span> <strong> @{key} </strong>: "{value}" </span>
                                );
                                })
                            }
                            <div className="mb-2 d-flex justify-content-center" key={item.id}> 
                                <button className="btn btn-primary" onClick={() => moveProduct(item.id, item.wid)}>
                                    Move Product
                                </button>
                            </div>
                        </div>
                    )
                })
            }
        </div>
        <div className="col-6 mt-2">
            <Form onSubmit={() => {submitForm()}} style={{display: formVisibility}} className="border border-warning border-2">
                <div className="d-block mb-2">
                    <h3>Move Product {productID}</h3>
                    <h3>Chose {newWareHouseID === 0 ?  "?" : newWareHouseID}</h3>
                    {
                        allWareHouse.map(item => {
                            // console.log(item);
                            if (item.id !== oldWareHouseID) {
                                return (
                                    <div>
                                        <input type="radio" name="newWareHouseID" checked={item.id === newWareHouseID} value={item.id} onChange={() => updateNewWareHouseID(item.id)}/>
                                        <label htmlFor="newWareHouseID">{item.id} : {item.warehouse_name} - Max Volume : {item.volume} - Current Volume : {item.current_volume}</label>
                                    </div>
                                );
                            }
                        })
                    }
                </div>
                <div className="">
                    <button type="submit" className="btn btn-primary mx-1">Submit</button>
                    <button type="reset" className="btn btn-warning mx-1">Reset</button>
                    <button type="reset" className="btn btn-danger" onClick={() => closeForm()}>Close</button>
                </div>
            </Form>
        </div>
    </div>
    );
}

export async function loadProducts({request, params}) {
    const warehouseID = params.warehouseID;
    const data = await
    fetch(`http://localhost:3001/admin/warehouse/${warehouseID}/products`)
    .then(res => res.json())
    .then(data => {
        // console.log(data);
        return data;
    })
    .catch(e => {
        console.log(e);
        return null;
    })
    return data;
}

export default ViewProducts;