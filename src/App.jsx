import { createBrowserRouter,RouterProvider } from "react-router-dom"
import AppLayout from "./layout/AppLayout"
import Home from "./pages/Home"


const router = createBrowserRouter([
  {
    path:"/",
    element:<AppLayout/>,
    children:[
      {
        path:"/",
        element:<Home/>
      }
    ]
  }
])


function App() {
  return <RouterProvider router={router}></RouterProvider>
}

export default App
