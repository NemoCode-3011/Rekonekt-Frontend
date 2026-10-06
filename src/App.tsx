import { Navigate, Route, Routes } from "react-router-dom";
import GlobalLayout from "./layouts/GlobalLayout";
import AuthLayout from "./layouts/AuthLayout";
import AccountLayout from "./layouts/AccountLayout";
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
import Search from "./pages/Search/Search";
import Profile from "./pages/Account/Profile";
import Progress from "./pages/Account/Progress";
import Bookmarks from "./pages/Account/Bookmarks";
import RequireAuth from "./features/auth/components/RequireAuth";
import { BookmarksProvider } from "./features/bookmarks/BookmarksProvider";
import { DiscoveryProvider } from "./features/experience/discovery/DiscoveryProvider";

function App() {
  return (
    <DiscoveryProvider>
      <BookmarksProvider>
        <Routes>
          <Route element={<GlobalLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/explore/exhibitions" element={<Exhibitions />} />
            <Route path="/exhibitions/:slug" element={<ExhibitionDetail />} />
            <Route path="/search" element={<Search />} />

            <Route path="/account" element={<RequireAuth />}>
              <Route element={<AccountLayout />}>
                <Route index element={<Navigate to="profile" replace />} />
                <Route path="profile" element={<Profile />} />
                <Route path="progress" element={<Progress />} />
                <Route path="bookmarks" element={<Bookmarks />} />
              </Route>
            </Route>
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
      </BookmarksProvider>
    </DiscoveryProvider>
  );
}

export default App;