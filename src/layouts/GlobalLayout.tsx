import { Outlet } from "react-router-dom";
import GlobalNav from "../components/navigation/GlobalNav";

export default function GlobalLayout() {
  return (
    <>
      <GlobalNav />
      <main>
        <Outlet />
      </main>
    </>
  );
}