import { Outlet } from "react-router-dom";
import GlobalNav from "../components/navigation/GlobalNav";
import Footer from "../components/navigation/Footer";
import NotesWidget from "../features/notes/noteWidget";

export default function GlobalLayout() {
  return (
    <>
      <GlobalNav />
      <main>
        <Outlet />
      </main>
      <Footer />
      <NotesWidget />
    </>
  );
}