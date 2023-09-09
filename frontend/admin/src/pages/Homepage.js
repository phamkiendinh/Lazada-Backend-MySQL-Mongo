import { Link, useNavigate } from "react-router-dom";

function Homepage() {
    return (
        <div className="d-block justify-content-center">
            <h1 className="fw-bold d-flex justify-content-center">Welcome to our group's project</h1>
            <h1 className="fw-bold d-flex justify-content-center">This app controls admin and customer</h1>
            <div className="d-block">
                <div className="d-flex justify-content-center mt-2 mb-2">
                    <button className="btn btn-primary">
                        <Link to={`admin`} className="text text-white">Admin</Link> 
                    </button>
                </div>  
                <div className="d-flex justify-content-center mt-2 mb-2">
                    <button className="btn btn-primary">
                        <Link to={`customer`} className="text text-white">Customer</Link> 
                    </button>
                </div>
            </div>
        </div>
    );
}


export default Homepage;