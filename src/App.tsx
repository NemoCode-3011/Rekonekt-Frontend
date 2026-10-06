import { Routes, Route } from "react-router-dom";
import GlobalLayout from "./layouts/GlobalLayout";
import AuthLayout from "./layouts/AuthLayout";
import Home from "./pages/Home/Home";
import SignUp from "./pages/Auth/SignUp";
import Verify from "./pages/Auth/Verify";
import SignIn from "./pages/Auth/SignIn";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import ResetPassword from "./pages/Auth/ResetPassword";
import Explore from "./pages/Explore/Explore";
import Exhibitions from "./pages/Explore/Exhibitions";
import ExhibitionDetail from "./pages/Exhibitions/ExhibitionsDetail";
import ExperienceDetail from "./pages/Experiences/ExperienceDetail";
function App() {
  return (
    <Routes>
      <Route element={<GlobalLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/explore/exhibitions" element={<Exhibitions />} />
        <Route path="/exhibitions/:slug" element={<ExhibitionDetail />} />
      </Route>

      <Route path="/experiences/:slug" element={<ExperienceDetail />} />

      <Route path="/auth" element={<AuthLayout />}>
        <Route path="signup" element={<SignUp />} />
        <Route path="verify" element={<Verify />} />
        <Route path="login" element={<SignIn />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password" element={<ResetPassword />} />
      </Route>
    </Routes>
  );
}

export default App;
