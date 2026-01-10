import { Navigate } from "react-router-dom";
import useAuth from "./useAuth";
import PendingApproval from "../../pages/common/PendingApproval";
import { ROLE_HOME } from "../../config/navigation";

/**
 * Sends an authenticated user to the dashboard that matches their role.
 */
export default function RoleBasedRoute() {
  const { user } = useAuth();

  if (!user) return null;

  if (!user.approve_status) {
    return <PendingApproval />;
  }

  const home = ROLE_HOME[user.role];

  if (home) {
    return <Navigate to={home} replace />;
  }

  return <PendingApproval />;
}
