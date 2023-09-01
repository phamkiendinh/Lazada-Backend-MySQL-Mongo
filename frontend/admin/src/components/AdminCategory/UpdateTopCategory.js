import { useState } from "react";
import { Form, redirect, useLoaderData, useNavigate, useParams } from "react-router-dom";

function UpdateTopCategory() {
    var params = useParams();
    var topCategory = params.categoryName;
    const data = useLoaderData();
    const navigate = useNavigate();
    const entries = Object.entries(data);

    //Additional Attribute Form
    const [defaultCategory, setDefaultCategory] = useState([]);
    const [category, setCategory] = useState([]);
    const [nameInput, setNameInput] = useState({name: topCategory});
    const [input, setInput] = useState('');
    const [require, setRequire] = useState("true");
    const [type, setType] = useState('text');
    const [fieldFormVisibility, setFieldFormVisibility] = useState('none');

    //Update Form
    const [entry, setEntry] = useState(entries);
    // console.log(entry);
    const [updateFormVisibility, setUpdateFormVisibility] = useState('none');
    const [updateInput, setUpdateInput] = useState('');
    const [updateRequire, setUpdateRequire] = useState('true');
    const [updateType, setUpdateType] = useState('text');
    const [oldInput, setOldInput] = useState('');


    function updateNameInput(event) {
        var object = {
            name : event.target.value,
        }
        setNameInput(object);
    }

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

    async function saveTopCategory(event) {
        const newData = category.map(item => {
            var newObject = {};
            newObject[item.name] = {type: item.type, required : item.required};
            return newObject;
        })
        nameInput.name = nameInput.name.toLowerCase().replace(' ','').replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '');
        var oldInputArray = [];
        entry.map(item => {
            let object = {};
            if (item[0] !== "name") {
                object[item[0]] = item[1];
                oldInputArray.push(object);
            }
        })
        let data = [
            nameInput,
            ...oldInputArray,
            ...newData
        ];
        // console.log(data);
        await fetch(`http://localhost:3001/admin/category/${topCategory}/update`, 
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
        navigate('/admin/category');
        return null;
    }
    
    
    function addField() {
        if (input === '') {
            window.alert('Input must not be blanked');
            return;
        }
        if (input === "Name" || input === "name") {
            window.alert('Cant have extra name column');
            return;
        }
        let item = {
            name: input.toLowerCase(),
            type: type,
            required: require
        };
        let newItem = [
            ...category,
            item
        ]
        // console.log(newItem);
        setCategory(newItem);
        closeFieldForm();
    }

    function resetForm() {
        setCategory(defaultCategory);
        closeFieldForm();
    }

    function renderUpdateForm(key) {
        entries.map(item => {
            var k = item[0];
            var v = item[1];
            if (k === key) {
                setOldInput(key);
                setUpdateInput(k);
                setUpdateRequire(v.required);
                setUpdateType(v.type);
            }
        })
        setUpdateFormVisibility('block');
    }
    
    function closeUpdateForm() {
        setUpdateFormVisibility('none');
    }
    
    function addUpdateForm() {
        if (updateInput === '') {
            window.alert('Input must not be blanked');
            return;
        }
        if (updateInput === "Name" || updateInput === "name") {
            window.alert('Cant have extra name column');
            return;
        }
        let item = {
            type: updateType,
            required: updateRequire
        };

        if (oldInput === '') {
            return;
        }
        
        let newItem = [];
        entry.map(item => {
            const k = item[0];
            const v = item[1];
            if (k === oldInput) {
                newItem.push(updateInput.toLowerCase());
                newItem.push(v);
            }
            else {
                return item;
            }
        })

        if (newItem.length !== 0) {
            entry.push(newItem);
        }

        var newArray = [];

        entry.map(item => {
            if (item[0] !== oldInput) {
                newArray.push(item);
                
            }
        })

        setEntry(newArray);
        closeUpdateForm();
    }

    return (
        <div className="row">
            <div className='col-2 left-panel mt-5'>
            <button className="btn btn-primary w-100 m-1" onClick={() => navigate(`/admin/category`)}>
                Go Back
            </button>
            </div>
            <div className="col-8 mt-5 w-75">
                <div className="container-fluid d-flex justify-content-center">
                    <h1 className="fw-bold">Update Top-Category</h1>
                </div>

                <div>
                    {
                        entry.map(entry => {
                            var key = entry[0];
                            var value = entry[1];
                            if (key === "name") {
                                return (
                                    <div>
                                        <label htmlFor="name" className="form-label"><h1>Name</h1></label>
                                        <input type="text" className="form-control" name="name" defaultValue={value} required onChange={(e) => updateNameInput(e)}/>
                                    </div>
                                )
                            }
                            else {
                                return (

                                    <div className="border border-2 border-primary mt-2 d-flex justify-content-between">
                                       <h1>{key}</h1>
                                       <button className="btn btn-primary" onClick={() => renderUpdateForm(key)}>Update</button>
                                    </div>
                                )
                            }
                        })
                    }
                </div>

                <div id="updateForm" style={{display: updateFormVisibility}} className="mt-5 border border-2 border-danger">
                    <div className="container d-flex justify-content-center">
                        <h1 className="fw-bold text text-danger">Update Field</h1>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="update-input" className="form-label fw-bold">Input</label>
                        <input type="text" id="fieldInput" className="form-control" name="update-input" defaultValue={updateInput} onChange={(e) => setUpdateInput(e.target.value)}/>
                    </div>

                    <div className="mb-3">
                        <h6 className="fw-bold">Required</h6>
                        <input type="radio" id="required" name="update-required" value="true" checked={updateRequire === "true"} onChange={(e) => setUpdateRequire(e.target.value)}/>
                        <label htmlFor="required">Required</label>
                        <br/>
                        <input type="radio" id="not-required" name="update-required" value="false" checked={updateRequire === "false"} onChange={(e) => setUpdateRequire(e.target.value)}/>
                        <label htmlFor="required">Not Required</label>
                    </div>
                    <div className="mb-3">
                        <h6 className="fw-bold">Type</h6>
                        <input type="radio" id="required" name="update-type" value="text" checked={updateType === "text"} onChange={(e) => setUpdateType(e.target.value)}/>
                        <label htmlFor="type">Text</label>
                        <br/>
                        <input type="radio" id="not-required" name="update-type" value="number" checked={updateType === "number"} onChange={(e) => setUpdateType(e.target.value)}/>
                        <label htmlFor="type">Number</label>
                    </div>
                    <button className="btn btn-primary m-2" onClick={() => addUpdateForm()}>Add</button>
                    <button type="reset" className="btn btn-danger m-2" onClick={() => closeUpdateForm()}>Close</button>
                </div>
                <Form onSubmit={saveTopCategory}>
                    <fieldset>
                        <div className="container-fluid d-flex justify-content-center">
                            <h1 className="fw-bold">Add Additional Attributes</h1>
                        </div>
                        {
                            category.map(item => {
                                    return (
                                        <div className="container mt-5 border border-primary border-5">
                                            <div><h4><strong>Field: </strong>{item.name}</h4></div>
                                            <div><h4><strong>Type: </strong>{item.type}</h4></div>
                                            <div><h4><strong>Require: </strong>{item.required}</h4></div>
                                        </div>
                                    );
                                }
                            )
                        }
                        <div className="mb-3 d-flex justify-content-center align-item-center">
                            <button type="submit" className="btn btn-primary m-3">Save</button>
                            <button type="button" className="btn btn-success m-3" onClick={() => {addFieldForm()}}>Add Field</button>
                            <button type="button" className="btn btn-danger m-3" onClick={() => {resetForm()}}>Reset</button>
                        </div>
                    </fieldset>
                </Form>

                <div id="addFieldForm" style={{display: fieldFormVisibility}} className="mt-1 mb-5 border border-2 border-success">
                    <legend className="fw-bold">Add Field</legend>
                    <div className="mb-3">
                        <label htmlFor="input" className="form-label fw-bold">Input</label>
                        <input type="text" id="fieldInput" className="form-control" name="input" onChange={(e) => logInput(e)}/>
                    </div>

                    <div className="mb-3">
                        <h6 className="fw-bold">Required</h6>
                        <input type="radio" id="required" name="required" value="true" checked={require === "true"} onChange={(e) => updateRequireInput(e)}/>
                        <label htmlFor="required">Required</label>
                        <br/>
                        <input type="radio" id="not-required" name="required" value="false" checked={require === "false"} onChange={(e) => updateRequireInput(e)}/>
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


export async function loadTopCategory({request, params}) {
    const param = params.categoryName;
    const data = await fetch(`http://localhost:3001/admin/category/${param}/update`)
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

export default UpdateTopCategory;