import { Outlet } from "react-router-dom";
import AdminSidebar from "../features/admin/components/AdminSidebar";
import AdminTopbar from "../features/admin/components/AdminTopbar";

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-ivory text-ink">
      <div className="flex min-h-screen">
        <AdminSidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <AdminTopbar />

          <main className="flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}