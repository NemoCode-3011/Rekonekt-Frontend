import { Navigate, Route, Routes } from "react-router-dom";

import GlobalLayout from "./layouts/GlobalLayout";
import AuthLayout from "./layouts/AuthLayout";
import AccountLayout from "./layouts/AccountLayout";
import AdminLayout from "./layouts/AdminLayout";

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

import Dashboard from "./pages/Admin/Dashboard";

import RequireAuth from "./features/auth/components/RequireAuth";
import RequireAdmin from "./features/admin/components/RequireAdmin";
import AdminSignIn from "./pages/Admin/AdminSignIn";

import { BookmarksProvider } from "./features/bookmarks/BookmarksProvider";
import { DiscoveryProvider } from "./features/experience/discovery/DiscoveryProvider";

import CollectionPage from "./pages/Explore/CollectionPage";
import About from "./pages/About/About";
import NotFound from "./pages/NotFound";
import Settings from "./pages/Account/Settings";
import AdminExhibitions from "./pages/Admin/Exhibitions";
import ExhibitionWorkspace from "./pages/Admin/ExhibitionsWorkspace";
import Team from "./pages/Admin/Team";
import AdminSettings from "./pages/Admin/AdminSettings";
import RequireSuperAdmin from "./features/admin/components/RequireSuperAdmin";
function App() {
  return (
    <DiscoveryProvider>
      <BookmarksProvider>
        <Routes>
          {/* Public / visitor experience */}
          <Route element={<GlobalLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/explore/exhibitions" element={<Exhibitions />} />
            <Route
              path="/explore/people"
              element={<CollectionPage kind="people" />}
            />
            <Route
              path="/explore/events"
              element={<CollectionPage kind="events" />}
            />
            <Route
              path="/explore/places"
              element={<CollectionPage kind="places" />}
            />
            <Route
              path="/explore/artifacts"
              element={<CollectionPage kind="artifacts" />}
            />
            <Route path="/exhibitions/:slug" element={<ExhibitionDetail />} />
            <Route path="/search" element={<Search />} />
            <Route path="/about" element={<About />} />

            {/* Visitor account */}
            <Route path="/account" element={<RequireAuth />}>
              <Route element={<AccountLayout />}>
                <Route index element={<Navigate to="profile" replace />} />

                <Route path="profile" element={<Profile />} />
                <Route path="progress" element={<Progress />} />
                <Route path="bookmarks" element={<Bookmarks />} />
                <Route path="settings" element={<Settings />} />
              </Route>
            </Route>
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Admin authentication */}
          <Route path="/admin/login" element={<AdminSignIn />} />

          {/* Admin */}
          <Route path="/admin" element={<RequireAdmin />}>
            <Route element={<AdminLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="exhibitions" element={<AdminExhibitions />} />
              <Route path="exhibitions/:id" element={<ExhibitionWorkspace />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route element={<RequireSuperAdmin />}>
                <Route path="team" element={<Team />} />
              </Route>
            </Route>
          </Route>

          {/* Immersive experience */}
          <Route path="/experiences/:slug" element={<ExperienceDetail />} />

          {/* Authentication */}
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
