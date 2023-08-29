import { useState } from "react";
import { Form, redirect, useLoaderData, useNavigate } from "react-router-dom";

function UpdateSubCategory() {
    const loadData = useLoaderData();
    const data = loadData.sub_category;

    var initialState = [...data];
    const navigate = useNavigate();

    const [defaultCategory, setDefaultCategory] = useState(initialState);
    const [category, setCategory] = useState([]);
    const [input, setInput] = useState('');
    const [require, setRequire] = useState("required");
    const [type, setType] = useState('text');
    const [fieldFormVisibility, setFieldFormVisibility] = useState('none');

    function addFieldForm() {
        setFieldFormVisibility('block');
    }
    
    function updateTypeInput(event) {
        setType(event.target.value);
    }
    
    function updateRequireInput(event) {
        setRequire(event.target.value);
    }
    
    function logInput(e) {
        setInput(e.target.value);
    }
    
    
    function closeFieldForm() {
        setFieldFormVisibility('none');
    }
    
    
    function addField() {
        if (input === '') {
            window.alert('Input must not be blanked');
            return;
        }
        let item = {
            name: input,
            type: type,
            required: require
        };
        console.log(require);
        let newItem = [
            ...category,
            item
        ]
        console.log(newItem);
        setCategory(newItem);
        closeFieldForm();
    }

    function resetForm() {
        setCategory([]);
        closeFieldForm();
    }


    return (
        <div className="row">
            <div className='col-2 left-panel mt-5'>
            <button className="btn btn-primary w-100 m-1" onClick={() => navigate(-1)}>
                Go Back
            </button>
            </div>
            <div className="col-8 mt-5 w-75">
                <legend className="fw-bold h1">Update Sub-Category</legend>
                <Form method="POST">
                    <fieldset>
                        {
                            defaultCategory.map(item => {
                                var entries = Object.entries(item);
                                var data = entries.map(data => {
                                    var key = data[0];
                                    var value = data[1];
                                    return (
                                        <div className="mb-3" key={key}>
                                            <label htmlFor={key} className="form-label">{key.charAt(0).toUpperCase()}{key.slice(1)}</label>
                                            <input type="text" className="form-control" name={key} defaultValue={value} required/>
                                        </div>
                                    );
                                })
                                return data;
                            })
                        }
                        {
                            category.map(item => {
                                switch (item.type) {
                                    case 'text':
                                        return (
                                            <div className="mb-3" key={item.name}>
                                                <label htmlFor={item.name} className="form-label">{item.name.charAt(0).toUpperCase() + item.name.slice(1)}</label>
                                                <input type="text" className="form-control" name={item.name} required={item.required === "required"}/>
                                            </div>
                                        );
                                    case 'number':
                                        return (
                                            <div className="mb-3" key={item.name}>
                                                <label htmlFor={item.name} className="form-label">{item.name.charAt(0).toUpperCase() + item.name.slice(1)}</label>
                                                <input type="number" className="form-control" name={item.name} required={item.required === "required"}/>
                                            </div>
                                    );
                                    default:
                                        return (
                                            <div className="mb-3" key={item.name}>
                                                <label htmlFor={item.name} className="form-label">{item.name.charAt(0).toUpperCase() + item.name.slice(1)}</label>
                                                <input type="text" className="form-control" name={item.name} required={item.required === "required"}/>
                                            </div>
                                        );
                                }
                            })
                        }
                        <div className="mb-3 d-flex justify-content-center align-item-center">
                            <button type="submit" className="btn btn-primary m-3">Update</button>
                            <button type="button" className="btn btn-success m-3" onClick={() => {addFieldForm()}}>Add Field</button>
                            <button type="button" className="btn btn-danger m-3" onClick={() => {resetForm()}}>Reset</button>
                        </div>
                    </fieldset>
                </Form>

                <div id="addFieldForm" style={{display: fieldFormVisibility}}>
                    <legend className="fw-bold">Add Field</legend>
                    <div className="mb-3">
                        <label htmlFor="input" className="form-label fw-bold">Input</label>
                        <input type="text" id="fieldInput" className="form-control" name="input" onChange={(e) => logInput(e,setInput, input)}/>
                    </div>

                    <div className="mb-3">
                        <h6 className="fw-bold">Required</h6>
                        <input type="radio" id="required" name="required" value="required" checked={require === "required"} onChange={(e) => updateRequireInput(e)}/>
                        <label htmlFor="required">Required</label>
                        <br/>
                        <input type="radio" id="not-required" name="required" value="not-required" checked={require === "not-required"} onChange={(e) => updateRequireInput(e)}/>
                        <label htmlFor="required">Not Required</label>
                    </div>
                    <div className="mb-3">
                        <h6 className="fw-bold">Type</h6>
                        <input type="radio" id="required" name="type" value="text" checked={type === "text"} onChange={(e) => updateTypeInput(e)}/>
                        <label htmlFor="type">Text</label>
                        <br/>
                        <input type="radio" id="not-required" name="type" value="number" checked={type === "number"} onChange={(e) => updateTypeInput(e)}/>
                        <label htmlFor="type">Number</label>
                    </div>
                    <button className="btn btn-primary m-2" onClick={() => addField()}>Add</button>
                    <button type="reset" className="btn btn-danger m-2" onClick={() => closeFieldForm()}>Close</button>
                </div>
            </div>
        </div>
    );
}


export async function loadSubCategory({request, params}) {
    const topCategory = params.categoryName;
    const subCategory = params.subCategoryName;
    const data = await fetch(`http://localhost:3001/admin/category/${topCategory}/${subCategory}`)
    .then(res => res.json())
    .then(data => {
        return data;
    })
    .catch(e => {
        console.log(e);
        return null;
    })
    return data;
}


export async function updateSubCategory({request, params}) {
    // console.log("Update Called");
    const topCategory = params.categoryName;
    const subCategory = params.subCategoryName;
    const formData = await request.formData();
    const data = Object.fromEntries(formData);
    await fetch(`http://localhost:3001/admin/category/${topCategory}/${subCategory}/update`, 
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
    return redirect(`/admin/category/${topCategory}`);
}

export default UpdateSubCategory;