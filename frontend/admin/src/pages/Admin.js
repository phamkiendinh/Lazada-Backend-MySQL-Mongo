import { useLoaderData, Link, useNavigate} from 'react-router-dom';

function Admin() {
    const navigate = useNavigate();
    const data = useLoaderData();
    if (data === null || data === undefined) {
        return (
            <div className='row'>
                <div className='col-2 left-panel bg-dark mt-5'>
                    <button className="btn btn-primary w-100 m-1" onClick={() => navigate(-1)}>
                        Go Back
                    </button>
                    <button className="btn btn-primary w-100 m-1">
                        <Link to="category" className="text text-white">Category Management</Link>
                    </button>
                    <button className="btn btn-primary w-100 m-1">
                        <Link to="warehouse" className="text text-white">Warehouse Management</Link>
                    </button>
                </div>
                <div className='col-8 mt-5'>
                    <h1>
                        Admin page, please click on these buttons to manage warehouse and category
                    </h1>
                </div>
            </div>
        );
    }
    const keys = Object.keys(data);


    return (
        <div className='row'>
            <div className='col-2 left-panel bg-dark mt-5'>
                <button className="btn btn-primary w-100 m-1" onClick={() => navigate(-1)}>
                    Go Back
                </button>
                <button className="btn btn-primary w-100 m-1">
                    <Link to="category" className="text text-white">Category Management</Link>
                </button>
                <button className="btn btn-primary w-100 m-1">
                    <Link to="warehouse" className="text text-white">Warehouse Management</Link>
                </button>
            </div>
            <div className='col-8 d-inline-block mt-5'>
                <div>
                    {
                        keys.map(key => {
                            return (
                                <h1 key={key}>{key} : {data[key]}</h1>
                            );
                        })
                    }
                </div>
            </div>
        </div>
    );
}

export async function loadAdmin() {
    var data = await
    fetch('http://localhost:3001/admin')
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


export default Admin;