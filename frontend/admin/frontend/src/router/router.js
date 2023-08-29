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

//Action Function
import UpdateTopCategory, { updateTopCategory } from "../components/AdminCategory/UpdateTopCategory";
import UpdateSubCategory, {loadSubCategory, updateSubCategory} from "../components/AdminCategory/UpdateSubCategory";
export const routes = createBrowserRouter([
    {
        path : '/admin',
        element : <Admin />,
        loader : loadAdmin,
        error : <Error />
    },
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
        action : updateTopCategory,
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
        action: updateSubCategory,
        loader: loadSubCategory,
        error : <Error />
    },
    {
        path : '/admin/category/:categoryName/:subCategoryName/detail',
        element : <SubCategoryDetail />,
        error : <Error />
    },
    {
        path : '/admin/warehouse',
        element : <WareHouse />,
        error : <Error />
    }
]);
