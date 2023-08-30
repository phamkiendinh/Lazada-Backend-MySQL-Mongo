import { useLocation, useNavigate } from "react-router-dom";



function TopCategoryDetail() {
    const navigate = useNavigate();
    const data = useLocation().state;
    console.log(data);
    var entries = Object.entries(data);
    var items = entries.map(item => {
        const key = item[0];
        const value = item[1];
        if (typeof value === 'object') {
            const entry = Object.entries(value);
            const result = entry.map(pair => {
                const k = pair[0];
                const v = pair[1];
                return (
                    <h1>
                        <span>{k} : {v}</span>
                    </h1>
                );
            })
            return (
                <div className="border border-success border-2 mt-2">
                    <h1>
                        <strong>{key}</strong>
                    </h1>
                    {result}
                </div>
            );
        }
        else {
            return (
                <div>
                    <h1>
                        <span><strong>{key}</strong> : {value}</span>
                    </h1>
                </div>
            );
        }
    });
    return (
        <div>
            <div className="container d-flex justify-content-center">
                <button className="btn btn-primary" onClick={() => navigate(-1)}>Go Back</button>
            </div>
            {items}
        </div>
    );
}



export default TopCategoryDetail;