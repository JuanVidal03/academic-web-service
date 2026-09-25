import { Suspense, lazy } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
  
const Login = lazy(() => import("@/pages/login"));
const Dashboard = lazy(() => import("@/pages/dashboard"));

const App = () => {

  return (
    <BrowserRouter>
      <Suspense>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default App;
