import { Form, useLoaderData, useNavigate } from 'react-router-dom';

function UpdateWareHouse() {
    const navigate = useNavigate();
    const data = useLoaderData();

    var json;
    if (data.length !== 0 || data !== null) {
        json = data[0];
    }
    console.log(json);
    return (
        <div>
            <div className="mb-2 mt-2 d-flex justify-content-center"> 
                <button className="btn btn-primary" onClick={() => navigate('/admin/warehouse')}>
                    Go Back
                </button>
            </div>
            <div>
                <Form>
                    {

                    }
                </Form>
            </div>
        </div>
    );
}

export async function loadWareHouse({request, params}) {
    const warehouseID = params.warehouseID;
    console.log(warehouseID);
    const data = await 
    fetch(`http://localhost:3001/admin/warehouse/${warehouseID}`)
    .then(res => res.json())
    .then(data => {
        console.log(data);
        return data;
    })
    .catch(e => {
        console.log(e); 
        return null;
    })
    return data;
}


export default UpdateWareHouse;