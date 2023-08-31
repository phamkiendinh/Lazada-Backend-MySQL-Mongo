import { Form, useLoaderData, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

function UpdateWareHouse() {
    const navigate = useNavigate();
    const data = useLoaderData();
    const [wareHouseName, setWareHouseName] = useState('');
    const [addressID, setAddressID] = useState(0);
    const [volume, setVolume] = useState(0);
    const [addressList, setAddressList] = useState([]);
    var current_volume = 0;

    var json;
    if (data.length !== 0 || data !== null) {
        json = data[0];
    }
    // console.log(json);

    useEffect(() => {
        fetch(`http://localhost:3001/admin/warehouse/${json.id}/update/address`)
        .then(res => res.json())
        .then(data => {
            setAddressList(data);
        })
        .catch(e => console.log(e))
    }, [])

    async function updateWareHouse() {
        var aID = 0;
        var v = '';
        var wName = '';
        if (wareHouseName === '') {
            wName = json.warehouse_name;
        }
        else {
            wName = wareHouseName;
        }

        if (volume === 0) {
            v = json.volume;
        }
        
        else {
            v = volume;
        }

        if (addressID === 0) {
            aID = json.address_id;
        }
        else {
            aID = addressID;
        }
        const response = await fetch(`http://localhost:3001/admin/warehouse/${json.id}/update`, {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "warehouse_name": wName,
                "address_id": aID,
                "volume": v,
                "current_volume": current_volume
            })
        })
        .then(res => res.json())
        .then(data => {
            console.log(data);
        })
        .catch(e => console.log(e))
        navigate('/admin/warehouse');
    }
    // console.log(volume);
    // console.log(addressID);
    // console.log(json.address_id);
    // console.log(addressList);

    return (
        <div className='row'>
            <div className="col-2 mb-2 mt-2"> 
                <button className="btn btn-primary mx-5" onClick={() => navigate('/admin/warehouse')}>
                    Go Back
                </button>
            </div>
            <div className='col-8'>
                <h1 className='fw-bold'>Update Warehouse {json.id} : {json.warehouse_name}</h1>
                <Form onSubmit={() => updateWareHouse()}>
                    <div>
                        <label htmlFor="warehouse_name" className="form-label fw-bold">Name</label>
                        <input type="text" id="fieldInput" className="form-control" name="warehouse_name" defaultValue={json.warehouse_name} required onChange={(e) => setWareHouseName(e.target.value)}/>

                        <label htmlFor="volume" className="form-label fw-bold">Volume</label>
                        <input type="number" id="fieldInput" className="form-control" name="volume" defaultValue={json.volume} required onChange={(e) => setVolume(e.target.value)}/>


                        <label htmlFor="current_volume" className="form-label fw-bold">Current Volume</label>
                        <input type="number" id="fieldInput" className="form-control" name="current_volume" disabled value={0}/>

                        <div className='mt-2'>
                            <label htmlFor="address_id">Choose address</label>
                            <select id="address_id" name="address_id" onChange={(e) => setAddressID(e.target.value)} required>
                                <option>Choose</option>
                                {
                                    addressList.map(item => {
                                        return (
                                            <>
                                                <option value={item.id}>Address: {item.id}</option>
                                            </>
                                        );
                                    })
                                }
                            </select>
                        </div>
                    </div>
                    <div className='mt-2'>
                        <button type='submit' className='btn btn-primary mx-2'>Save</button>
                        <button type='reset' className='btn btn-warning'>Reset</button>
                    </div>
                </Form>
            </div>
        </div>
    );
}

export async function loadWareHouse({request, params}) {
    const warehouseID = params.warehouseID;
    const data = await 
    fetch(`http://localhost:3001/admin/warehouse/${warehouseID}`)
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


export default UpdateWareHouse;