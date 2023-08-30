import {Link, useLoaderData} from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
function TopCategory() {
    const navigate = useNavigate();
    const categories = useLoaderData();

    async function deleteTopCategory(category) {
        await fetch(`http://localhost:3001/admin/category/${category}/delete`, {
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

    async function updateTopCategory(category) {
        navigate(`/admin/category/${category}/update`);
    }
    
    if (categories === null) {
        return (
            <div>
                <div className='row'>
                    <div className='col-2 left-panel mt-5'>
                        <button className="btn btn-primary w-100 m-1" onClick={() => navigate(-1)}>
                            Go Back
                        </button>
                    </div>
                    <div className='col-8 d-inline-block mt-5'>
                        <div className='d-flex justify-content-center mt-5'>
                            <h1 className="text text-white fw-bold border border-3 p-5 bg-primary border-black">Add Your First Category</h1>
                        </div>
                        <div id='category-crud' className='container d-flex justify-content-center'>
                            <button className='btn btn-success'>
                                <Link to="create" className='text-white' state={{history: `${window.location.href}`}}>
                                    Create New Top-Category
                                </Link>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    var counter = 0;
    var result = categories.map(category => {
        counter += 1
        var name = category.name;
        // delete category.name
        console.log(category);
        return (
            <div className='d-flex container-fluid' key={`${category['name']}${counter}`}>
                <Link to={name} className='w-75'>
                    <div className="container-fluid border border-2 border-primary w-100 mt-2">
                        {
                            <h3 key={`${category['name']}`}> 
                                {name.charAt(0).toUpperCase()}{name.slice(1)}
                            </h3>
                        }
                    </div>
                </Link>
                <div className='d-flex w-25'>
                    <button className='btn btn-primary mx-1 mt-2'>
                        <Link to={`${name}/detail`} className='text text-white' state={category}>Details</Link>
                    </button>
                    <button className='btn btn-primary mx-1 mt-2' onClick={() => updateTopCategory(name)}>Update</button>
                    <button className='btn btn-danger mx-1 mt-2' onClick={() => deleteTopCategory(name)}>Delete</button>
                </div>
            </div>
            );
        })
    counter = 0;
    return (
        <div>
            <div className='row'>
                <div className='col-2 left-panel mt-5'>
                    <button className="btn btn-primary w-100 m-1" onClick={() => navigate(-1)}>
                        Go Back
                    </button>
                </div>
                <div className='col-8 d-inline-block mt-5'>
                    <div id='category-crud' className='container d-flex justify-content-center'>
                        <button className='btn btn-success'>
                            <Link to="create" className='text-white'>
                                Create New Category
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


export default TopCategory;


export async function loadAllTopCategory({params}) {
    var data = await
    fetch('http://localhost:3001/admin/category')
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

