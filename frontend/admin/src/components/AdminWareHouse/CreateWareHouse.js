import { useState } from "react";
import { Form, redirect, useNavigate } from "react-router-dom";

function CreateWareHouse() {
    const navigate = useNavigate();
    const [volume, setVolume] = useState(0);

    function updateCurrentVolume(e) {
        setVolume(e.target.value);
    }
    return (
        <div className="row">
            <div className="col-2">
                <button className="btn btn-primary m-2" onClick={() => navigate(-1)}>
                    Go Back
                </button>
            </div>
            <div className="col-8 mt-2">
                <Form method="POST">
                    <div className="container d-flex justify-content-center">
                        <h1 className="fw-bold">Create Warehouse</h1>
                    </div>
                    <div>
                        <div className="mb-3">
                            <label htmlFor="warehouse_name" className="form-label fw-bold">Name</label>
                            <input type="text" id="fieldInput" className="form-control" name="warehouse_name" required/>

                            <label htmlFor="province" className="form-label fw-bold">Province</label>
                            <input type="text" id="fieldInput" className="form-control" name="province" required/>

                            <label htmlFor="city" className="form-label fw-bold">City</label>
                            <input type="text" id="fieldInput" className="form-control" name="city" required/>

                            <label htmlFor="district" className="form-label fw-bold">District</label>
                            <input type="text" id="fieldInput" className="form-control" name="district" required/>

                            <label htmlFor="street" className="form-label fw-bold">Street</label>
                            <input type="text" id="fieldInput" className="form-control" name="street" required/>

                            <label htmlFor="street_number" className="form-label fw-bold">Street Number</label>
                            <input type="text" id="fieldInput" className="form-control" name="street_number" required/>

                            <label htmlFor="volume" className="form-label fw-bold">Volume</label>
                            <input type="number" id="fieldInput" className="form-control" name="volume" required onChange={(e) => updateCurrentVolume(e)} value={volume}/>

                            <label htmlFor="current_volume" className="form-label fw-bold">Current Volume : 0</label>
                            <input type="number" id="fieldInput" className="form-control d-none" name="current_volume" value={0}/>

                        </div>
                        <button type="submit" className="btn btn-primary m-2">Create</button>
                        <button type="reset" className="btn btn-danger m-2">Close</button>
                    </div>
                </Form>
            </div>
        </div>
    );
}

export async function saveWareHouse({request, params}) {
    const formData = await request.formData();
    const data = Object.fromEntries(formData);
    console.log(data);
    await fetch(`http://localhost:3001/admin/warehouse/create`,
    {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(data => {
        console.log(data);
    })
    .catch(e => {
        console.log(e);
        return null;
    })
    return redirect('/admin/warehouse');
    // return null;
}

export default CreateWareHouse;