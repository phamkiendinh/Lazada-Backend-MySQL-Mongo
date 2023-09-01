import { useLoaderData, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

function SubCategory() {
    const loadData = useLoaderData();
    const navigate = useNavigate();
    var url = window.location.href;
    const topCategory = url.slice(url.lastIndexOf('/') + 1);

    async function countCategoryProduct(category) {
        const data = await 
        fetch(`http://localhost:3001/admin/category/${category}/count`)
        .then(res => res.json())
        .then(data => {
            return data;
        })
        .catch(e => console.log(e))
        return data;
    }

    if (loadData === null || loadData.length === 0) {
        return (
            <div>
                <div className='row'>
                    <div className='col-2 left-panel mt-5'>
                        <button className="btn btn-primary w-100 m-1" onClick={() => navigate(`/admin/category/${topCategory}`)}>
                            Go Back
                        </button>
                    </div>
                    <div className='col-8 d-inline-block mt-5'>
                        <div className='d-flex justify-content-center mt-5'>
                            <h1 className="text text-white fw-bold border border-3 p-5 bg-primary border-black">Add Your First Sub-Category</h1>
                        </div>
                        <div id='category-crud' className='container d-flex justify-content-center'>
                            <button className='btn btn-success'>
                                <Link to="create" className='text-white' state={{history: `${window.location.href}`}}>
                                    Create New Sub-Category
                                </Link>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    async function updateSubCategory(category) {
        const response = await countCategoryProduct(category);
        console.log(response);
        if (response.count === 0) {
            navigate(`/admin/category/${topCategory}/${category}/update`);
        }
        else {
            alert("The products in this category needs to be emptied first before delete~");
        }
    }

    async function deleteSubCategory(category) {
        const response = await countCategoryProduct(category);
        if (response.count === 0) {
            await fetch(`http://localhost:3001/admin/category/${topCategory}/${category}/delete`, {
                method: 'DELETE'
            })
            .then(res => res.json())
            .then(data => {
                return data;
            })
            .catch(e => {
                console.log(e);
                return null;
            })
            navigate(0);
        }
        else {
            alert("The products in this category needs to be emptied first before delete~");
        }
        

    }

    var data = Object.entries(loadData);
    var result = data.map(category => {
        var key = category[0];
        var values = category[1];
        var newEntries = Object.entries(values);
        var name = "";
        return (
            <div className='d-flex container-fluid'>
                <div className="container-fluid border border-2 border-primary w-100 mt-2 d-flex">
                    {
                        <h3> 
                            {newEntries.map(entry => {
                                console.log(entry);
                                var k = entry[0];
                                var v = entry[1];
                                if (k === "name") {
                                    name = v;
                                    return (
                                        <>
                                            <span className='text-danger'>
                                                {v.charAt(0).toUpperCase()}{v.slice(1)}
                                            </span>
                                            <br/>
                                        </>
                                    );
                                }
                            })}
                        </h3>
                    }
                </div>
                <div className='d-flex w-25'>
                    <button className='btn btn-primary mx-1 mt-2'>
                        <Link to={`${name}/detail`} className='text text-white' state={category}>Details</Link>
                    </button>
                    <button className='btn btn-primary mx-1 mt-2' onClick={() => updateSubCategory(name)}>Update</button>
                    <button className='btn btn-danger mx-1 mt-2' onClick={() => deleteSubCategory(name)}>Delete</button>
                </div>
            </div>
            );
        })
    return (
        <div>
            <div className='row'>
                <div className='col-2 left-panel mt-5'>
                        <button className="btn btn-primary w-100 m-1" onClick={() => navigate(`/admin/category`)}>
                            Go Back
                        </button>
                </div>
                <div className='col-8 d-inline-block mt-5'>
                    <div id='category-crud' className='container d-flex justify-content-center'>
                        <button className='btn btn-success'>
                            <Link to="create" className='text-white' state={{history: `${window.location.href}`}}>
                                Create New Sub-Category
                            </Link>
                        </button>
                    </div>
                    <div className='d-block justify-content-center'>
                        {result}
                    </div>
                </div>
            </div>
        </div>
    );
}

export async function loadAllSubCategory({request, params}) {
    var categoryName = params.categoryName;
    var data = await
    fetch(`http://localhost:3001/admin/category/${categoryName}`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({category : `${categoryName}`})
    })
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

export default SubCategory;