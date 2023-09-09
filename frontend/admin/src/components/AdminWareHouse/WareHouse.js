import { Link, useLoaderData, useNavigate } from "react-router-dom";

function WareHouse() {
    const navigate = useNavigate();
    const data = useLoaderData();

    async function countWareHouseProduct(warehouseID) {
        const data = await 
        fetch(`http://localhost:3001/admin/warehouse/${warehouseID}/products/count`)
        .then(res => res.json())
        .then(data => {
            return data;
        })
        .catch(e => console.log(e))
        return data;
    }

    async function deleteWareHouse(warehouseID) {
        const response = await countWareHouseProduct(warehouseID);
        // console.log(response);
        if (response.count === 0) {
            await fetch(`http://localhost:3001/admin/warehouse/${warehouseID}/delete`, {
                method: "DELETE"
            })
            .then(res => res.json())
            .then(data => {
                console.log(data);
            })
            .catch(e => {
                console.log(e);
            })
            navigate(0);
        }
        else {
            alert("The warehouse needs to be emptied first before delete~");
        }
    }

    async function updateWareHouse(event, warehouseID) {
        event.preventDefault();
        const response = await countWareHouseProduct(warehouseID);
        // console.log(response);
        if (response.count === 0) {
            navigate(`${warehouseID}/update`);
        }
        else {
            alert("The warehouse needs to be emptied first before update~");
        }
    }

    return (
        <div className="row">
            <div className="col-2 mt-2">
                <button className ="btn btn-primary mx-3 mt-2" onClick={() => navigate('/admin')}>
                    Go Back
                </button>
            </div>
            <div className="col-8 mt-2">
                <div className="d-flex justify-content-center">
                    <button className="btn btn-success mx-2">
                        <Link to="create" className="text text-white">Create New Warehouse</Link>
                    </button>
                    <button className="btn btn-primary mx-2">
                        <Link to="products/waiting" className="text text-white">View Waiting Products</Link>
                    </button>
                </div>
                {data.map(item => {
                    return (
                        <div className="container mt-2 justify-content-center" key={item.id}>
                            <div className="border border-3 border-primary mx-2">
                                <h1>Warehouse {item.id} : {item.warehouse_name}</h1>
                                <h1>Address: {item.address_id}</h1>
                                <h1>Volume: {item.volume}</h1>
                                <h1>Current Volume: {item.current_volume}</h1>
                            </div>
                            <div className="d-flex justify-content-center mt-2">
                                <button className="btn btn-primary mx-2">
                                    <Link to={`${item.id}/products`} className="text text-white">View Products</Link>
                                </button>
                                <button className="btn btn-warning mx-2">
                                    <Link to={`${item.id}/update`} className="text text-white" onClick={(e) => updateWareHouse(e,item.id)}>Update</Link>
                                </button>
                                <button className="btn btn-danger mx-2" onClick={() => deleteWareHouse(item.id)}>
                                    Delete
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export async function loadAllWareHouse() {
    const data = 
    await fetch('http://localhost:3001/admin/warehouse')
    .then(res => res.json())
    .then(data => {
        // console.log();
        return data;
    })
    .catch(e => {
        console.log(e);
        return null;
    })
    return data;
}
export default WareHouse;