import { createBrowserRouter } from "react-router-dom";

// 404 Pages
import Error from "../components/Error/Error";

//Seller and Admin
import Admin from "../pages/Admin";

//Loader 
import { loadAdmin } from "../pages/Admin";
import { loadAllSubCategory } from "../components/AdminCategory/SubCategory";
import { loadAllTopCategory } from "../components/AdminCategory/TopCategory";
import { loadTopCategory } from "../components/AdminCategory/UpdateTopCategory";
//Component
import TopCategory from "../components/AdminCategory/TopCategory";
import TopCategoryDetail from "../components/AdminCategory/TopCategoryDetail";
import CreateTopCategory from "../components/AdminCategory/CreateTopCategory";
import SubCategory from "../components/AdminCategory/SubCategory";
import SubCategoryDetail from "../components/AdminCategory/SubCategoryDetail";
import CreateSubCategory, { loadTopCategoryField } from "../components/AdminCategory/CreateSubCategory";

//Ware House
import WareHouse from "../components/AdminWareHouse/WareHouse";
import { loadAllWareHouse } from "../components/AdminWareHouse/WareHouse";
import UpdateWareHouse from "../components/AdminWareHouse/UpdateWareHouse";
import ViewProducts from "../components/AdminWareHouse/ViewProducts";
import CreateWareHouse from "../components/AdminWareHouse/CreateWareHouse";
import { saveWareHouse } from "../components/AdminWareHouse/CreateWareHouse";
import { loadProducts } from "../components/AdminWareHouse/ViewProducts";
import { loadWareHouse } from "../components/AdminWareHouse/UpdateWareHouse";

//Action Function
import UpdateTopCategory from "../components/AdminCategory/UpdateTopCategory";
import UpdateSubCategory, {loadSubCategory} from "../components/AdminCategory/UpdateSubCategory";
import ViewWaitProducts, { loadWaitProducts } from "../components/AdminWareHouse/ViewWaitProducts";
export const routes = createBrowserRouter([
    {
        path : '/admin',
        element : <Admin />,
        loader : loadAdmin,
        error : <Error />
    },
    //Category Management
    {
        path : '/admin/category',
        element : <TopCategory />,
        loader : loadAllTopCategory,
        error : <Error />
    },
    {
        path : '/admin/category/create',
        element : <CreateTopCategory />,
        error : <Error />
    },
    {
        path : '/admin/category/:categoryName/update',
        element : <UpdateTopCategory />,
        loader : loadTopCategory,
        error : <Error />
    },
    {
        path : '/admin/category/:categoryName/detail',
        element : <TopCategoryDetail />,
        error : <Error />
    },
    {
        path : '/admin/category/:categoryName',
        element : <SubCategory />,
        loader : loadAllSubCategory,
        error  : <Error />
    },
    {
        path : '/admin/category/:categoryName/create',
        element : <CreateSubCategory />,
        loader : loadTopCategoryField,
        error : <Error />
    },
    {
        path : '/admin/category/:categoryName/:subCategoryName/update',
        element : <UpdateSubCategory />,
        loader: loadSubCategory,
        error : <Error />
    },
    {
        path : '/admin/category/:categoryName/:subCategoryName/detail',
        element : <SubCategoryDetail />,
        error : <Error />
    },
    // Ware House
    {
        path : '/admin/warehouse',
        element : <WareHouse />,
        loader: loadAllWareHouse,
        error : <Error />
    },
    {
        path : '/admin/warehouse/create',
        element : <CreateWareHouse />,
        action: saveWareHouse,
        error : <Error />
    },
    {
        path : '/admin/warehouse/:warehouseID/update',
        element : <UpdateWareHouse />,
        loader: loadWareHouse,
        error : <Error />
    },
    {
        path : '/admin/warehouse/:warehouseID/products',
        element : <ViewProducts />,
        loader: loadProducts,
        error : <Error />
    },
    {
        path : '/admin/warehouse/products/waiting',
        element : <ViewWaitProducts />,
        loader: loadWaitProducts,
        error : <Error />
    },
]);
