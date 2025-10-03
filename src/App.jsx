import { createBrowserRouter,RouterProvider } from "react-router-dom"
import AppLayout from "./layout/AppLayout"
import Home from "./pages/Home"
import Events from "./pages/Events"
import EventDetails from "./pages/EventDetails";
import { AuthWrapper, ProtectedRoute } from './auth/AuthWrapper';
import ErrorBoundary from "./components/ErrorBoundary";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ErrorPage from "./pages/ErrorPage";

const router = createBrowserRouter([
  {
    path:"/",
    element:<AuthWrapper><ErrorBoundary><AppLayout/></ErrorBoundary></AuthWrapper>,
    errorElement : <ErrorPage/>,
    children:[
      {
        path:"/",
        element:<Home/>
      },
      {
        path:"/events",
        element:<ProtectedRoute><Events/></ProtectedRoute>
      },
      {
        path:"/events/:id",
        element:<ProtectedRoute><EventDetails/></ProtectedRoute>
      },
 
    ]
  }
])


function App() {
  return (
    <>
      <RouterProvider router={router} />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        toastStyle={{
          background: '#1a1a2e',
          color: '#ffffff',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      />
    </>
  )
}

export default App
