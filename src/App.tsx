import { Navigate, Route, Routes } from "react-router-dom";
import GlobalLayout from "./layouts/GlobalLayout";
import AuthLayout from "./layouts/AuthLayout";
import AccountLayout from "./layouts/AccountLayout";
import AdminLayout from "./layouts/AdminLayout";
import RequireAuth from "./features/auth/components/RequireAuth";
import RequireAdmin from "./features/admin/components/RequireAdmin";
import { BookmarksProvider } from "./features/bookmarks/BookmarksProvider";
import { DiscoveryProvider } from "./features/experience/discovery/DiscoveryProvider";
import RequireSuperAdmin from "./features/admin/components/RequireSuperAdmin";
import Scrolltotop from "./components/navigation/ScrollToTop";
import PageChange from "./components/navigation/PageChange";
import { lazy, Suspense } from "react";
import { SplashProvider } from "./components/splash/SplashProvider";
import { SplashLayer } from "./components/splash/SplashScreen";
import PageLoader from "./components/ui/PageLoader";
import { Analytics } from "@vercel/analytics/react";

const Home = lazy(() => import("./pages/Home/Home"));
const SignUp = lazy(() => import("./pages/Auth/SignUp"));
const Verify = lazy(() => import("./pages/Auth/Verify"));
const SignIn = lazy(() => import("./pages/Auth/SignIn"));
const ForgotPassword = lazy(() => import("./pages/Auth/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/Auth/ResetPassword"));
const Explore = lazy(() => import("./pages/Explore/Explore"));
const Exhibitions = lazy(() => import("./pages/Explore/Exhibitions"));
const ExhibitionDetail = lazy(
  () => import("./pages/Exhibitions/ExhibitionsDetail"),
);
const ExperienceDetail = lazy(
  () => import("./pages/Experiences/ExperienceDetail"),
);
const Search = lazy(() => import("./pages/Search/Search"));
const Wonders = lazy(() => import("./pages/Wonders/Wonders"));
const WonderDetail = lazy(() => import("./pages/Wonders/WonderDetail"));
const Profile = lazy(() => import("./pages/Account/Profile"));
const Progress = lazy(() => import("./pages/Account/Progress"));
const Bookmarks = lazy(() => import("./pages/Account/Bookmarks"));
const Dashboard = lazy(() => import("./pages/Admin/Dashboard"));
const AdminSignIn = lazy(() => import("./pages/Admin/AdminSignIn"));
const CollectionPage = lazy(() => import("./pages/Explore/CollectionPage"));
const About = lazy(() => import("./pages/About/About"));
const Stories = lazy(() => import("./pages/Stories/Stories"));
const StoryDetail = lazy(() => import("./pages/Stories/StoryDetail"));
const NotFound = lazy(() => import("./NotFound"));
const Settings = lazy(() => import("./pages/Account/Settings"));
const AdminExhibitions = lazy(() => import("./pages/Admin/Exhibitions"));
const AdminStories = lazy(() => import("./pages/Admin/Stories"));
const AdminStoryEditor = lazy(() => import("./pages/Admin/StoryEditor"));
const AdminWonders = lazy(() => import("./pages/Admin/Wonders"));
const AdminWonderEditor = lazy(() => import("./pages/Admin/WonderEditor"));
const ExhibitionWorkspace = lazy(
  () => import("./pages/Admin/ExhibitionsWorkspace"),
);
const Team = lazy(() => import("./pages/Admin/Team"));
const AdminSettings = lazy(() => import("./pages/Admin/AdminSettings"));
const AdminContentLibrary = lazy(
  () => import("./pages/Admin/AdminContentLibrary"),
);
const AdminSetupPassword = lazy(
  () => import("./pages/Admin/AdminSetupPassword"),
);
const PersonPage = lazy(() => import("./pages/People/PersonPage"));
const ObjectViewer = lazy(() => import("./pages/Experiences/ObjectViewer"));

function App() {
  return (
    <SplashProvider>
      <SplashLayer />
      <BookmarksProvider>
        <DiscoveryProvider>
          <Scrolltotop />
          <PageChange />
          <Suspense fallback={<PageLoader fullScreen />}>
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
                <Route
                  path="/exhibitions/:slug"
                  element={<ExhibitionDetail />}
                />
                <Route path="/search" element={<Search />} />
                <Route path="/about" element={<About />} />
                <Route path="/stories" element={<Stories />} />
                <Route path="/stories/:slug" element={<StoryDetail />} />
                <Route path="/people/:slug" element={<PersonPage />} />
                <Route path="/wonders" element={<Wonders />} />
                <Route path="/wonders/:slug" element={<WonderDetail />} />

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
              <Route
                path="/admin/setup-password"
                element={<AdminSetupPassword />}
              />

              {/* Admin */}
              <Route path="/admin" element={<RequireAdmin />}>
                <Route element={<AdminLayout />}>
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="exhibitions" element={<AdminExhibitions />} />
                  <Route
                    path="exhibitions/:id"
                    element={<ExhibitionWorkspace />}
                  />
                  <Route path="stories" element={<AdminStories />} />
                  <Route path="stories/:id" element={<AdminStoryEditor />} />
                  <Route path="wonders" element={<AdminWonders />} />
                  <Route path="wonders/:id" element={<AdminWonderEditor />} />
                  <Route
                    path="events"
                    element={<AdminContentLibrary kind="events" />}
                  />
                  <Route
                    path="events/:id"
                    element={<AdminContentLibrary kind="events" />}
                  />
                  <Route
                    path="people"
                    element={<AdminContentLibrary kind="people" />}
                  />
                  <Route
                    path="people/:id"
                    element={<AdminContentLibrary kind="people" />}
                  />
                  <Route
                    path="places"
                    element={<AdminContentLibrary kind="places" />}
                  />
                  <Route
                    path="places/:id"
                    element={<AdminContentLibrary kind="places" />}
                  />
                  <Route path="settings" element={<AdminSettings />} />
                  <Route element={<RequireSuperAdmin />}>
                    <Route path="team" element={<Team />} />
                  </Route>
                </Route>
              </Route>

              {/* Immersive experience */}
              <Route path="/experiences/:slug" element={<ExperienceDetail />} />
              <Route
                path="/experiences/:slug/object/:key"
                element={
                  <Suspense fallback={<div className="min-h-svh bg-ink" />}>
                    <ObjectViewer />
                  </Suspense>
                }
              />

              {/* Authentication */}
              <Route path="/auth" element={<AuthLayout />}>
                <Route path="signup" element={<SignUp />} />
                <Route path="verify" element={<Verify />} />
                <Route path="login" element={<SignIn />} />
                <Route path="forgot-password" element={<ForgotPassword />} />
                <Route path="reset-password" element={<ResetPassword />} />
              </Route>
            </Routes>
            <Analytics />
          </Suspense>
        </DiscoveryProvider>
      </BookmarksProvider>
    </SplashProvider>
  );
}

export default App;