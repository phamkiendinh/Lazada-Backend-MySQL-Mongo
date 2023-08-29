import { Form, useLocation, useNavigate, redirect} from "react-router-dom";
import { useRef, useState } from "react";

function CreateTopCategory () {

    const navigate = useNavigate();
    const [defaultCategory, setDefaultCategory] = useState([]);
    const [category, setCategory] = useState([]);
    const [nameInput, setNameInput] = useState({categoryName: ""});
    const [input, setInput] = useState('');
    const [require, setRequire] = useState("true");
    const [type, setType] = useState('text');
    const [fieldFormVisibility, setFieldFormVisibility] = useState('none');

    function updateNameInput(event) {
        var object = {
            categoryName : event.target.value,
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
        nameInput.categoryName = nameInput.categoryName.toLowerCase().replace(' ','').replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '');
        let data = [
            nameInput,
            ...category
        ];
        console.log(data);
        await fetch('http://localhost:3001/admin/category/create', 
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
        setCategory(defaultCategory);
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
                <div className="container-fluid d-flex justify-content-center">
                    <h1 className="fw-bold">Create Top-Category</h1>
                </div>

                <Form onSubmit={saveTopCategory}>
                    <fieldset>
                        <label htmlFor="name" className="form-label"><h1>Name</h1></label>
                        <input type="text" className="form-control" name="name" required onChange={(e) => updateNameInput(e)}/>
                        <div className="container-fluid d-flex justify-content-center">
                            <h1 className="fw-bold">Additional Attributes</h1>
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

                <div id="addFieldForm" style={{display: fieldFormVisibility}}>
                    <legend className="fw-bold">Add Field</legend>
                    <div className="mb-3">
                        <label htmlFor="input" className="form-label fw-bold">Input</label>
                        <input type="text" id="fieldInput" className="form-control" name="input" onChange={(e) => logInput(e)}/>
                    </div>

                    <div className="mb-3">
                        <h6 className="fw-bold">Required</h6>
                        <input type="radio" id="required" name="required" value="required" checked={require === "true"} onChange={(e) => updateRequireInput(e)}/>
                        <label htmlFor="required">Required</label>
                        <br/>
                        <input type="radio" id="not-required" name="required" value="not-required" checked={require === "false"} onChange={(e) => updateRequireInput(e)}/>
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


export default CreateTopCategory;
