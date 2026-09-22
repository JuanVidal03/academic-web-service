import { Suspense, lazy } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
  
const Login = lazy(() => import("@/pages/Login"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));

const App = () => {

  return (
    <BrowserRouter>
      <Suspense>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default App;
