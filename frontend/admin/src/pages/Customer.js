import { Link } from "react-router-dom";

function Customer() {
    return (
        <div className="">
            <div className="d-flex justify-content-center">
                <h1>Please choose customer ID</h1>   
            </div>
            <div className="d-flex justify-content-center">
                <button className="btn btn-primary">
                    <Link to="1" className="text text-white">Customer 1</Link>
                </button>
            </div>
            <div className="d-flex justify-content-center mt-2">
                <button className="btn btn-primary">
                    <Link to="2" className="text text-white">Customer 2</Link>
                </button>
            </div>
        </div>
    );
}


export default Customer;