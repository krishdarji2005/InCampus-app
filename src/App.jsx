import { createBrowserRouter,RouterProvider } from "react-router-dom"
import AppLayout from "./layout/AppLayout"
import Home from "./pages/Home"
import Events from "./pages/Events"
import EventDetails from "./pages/EventDetails";
import { AuthWrapper, ProtectedRoute } from './auth/AuthWrapper';

const router = createBrowserRouter([
  {
    path:"/",
    element:<AuthWrapper><AppLayout/></AuthWrapper>,
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
      }
    ]
  }
])


function App() {
  return <RouterProvider router={router}></RouterProvider>
}

export default App
