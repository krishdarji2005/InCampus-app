import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AppLayout from "./layout/AppLayout";
import Home from "./pages/Home";
import Events from "./pages/Events";
import EventDetails from "./pages/EventDetails";
import { AuthWrapper, ProtectedRoute } from "./auth/AuthWrapper";
import ErrorBoundary from "./components/ErrorBoundary";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ErrorPage from "./pages/ErrorPage";
import Committees from "./pages/Committees";
import CreateEvent from "./pages/CreateEvent";
import Profile from "./pages/Profile";
import ScrollToTop from "./components/ScrollToTop/ScrollToTop";
import OnboardingFlow from "./components/OnboardingFlow/OnboardingFlow";
import Dashboard from "./pages/Dashboard";
import EditEvent from "./pages/EditEvent";
import AboutUs from "./pages/AboutUs";
const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <AuthWrapper>
        <ErrorBoundary>
          <ScrollToTop />
          <AppLayout />
        </ErrorBoundary>
      </AuthWrapper>
    ),
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/events",
        element: (
          <ProtectedRoute>
            <Events />
          </ProtectedRoute>
        ),
      },
      {
        path: "/events/:id",
        element: (
          <ProtectedRoute>
            <EventDetails />
          </ProtectedRoute>
        ),
      },
      {
        path: "/events/:id/edit",
        element: (
          <ProtectedRoute>
            <EditEvent />
          </ProtectedRoute>
        ),
      },
      {
        path: "/committees",
        element: (
          <ProtectedRoute>
            <Committees />
          </ProtectedRoute>
        ),
      },
      {
        path: "/create-event",
        element: (
          <ProtectedRoute>
            <CreateEvent />
          </ProtectedRoute>
        ),
      },
      {
        path: "/profile",
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },
      {
        path: "/onboarding",
        element: (
          <ProtectedRoute>
            <OnboardingFlow />
          </ProtectedRoute>
        ),
      },
      {
        path: "/dashboard",
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "/aboutus",
        element: (
          <ProtectedRoute>
            <AboutUs />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

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
          background: "#1a1a2e",
          color: "#ffffff",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      />
    </>
  );
}

export default App;
