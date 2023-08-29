import { RouterProvider } from 'react-router-dom';
import './App.css';
import {routes} from './router/router';

function App() {
  return (
    <div className="App">
      <RouterProvider router={routes} />
    </div>
  );
}

export default App;
