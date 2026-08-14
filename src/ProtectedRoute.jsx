import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "./supabaseClient";

function ProtectedRoute({ children, allowedRoles = [] }) {
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const authenticatorToken =
  localStorage.getItem(
    "payroll_authenticator_token"
  );


// --------------------------------
// Google Authenticator session
// --------------------------------

if (authenticatorToken) {

  try {

    const payload =
      JSON.parse(
        atob(
          authenticatorToken.split(".")[1]
        )
      );

    if (
      payload.authMethod ===
      "authenticator"
    ) {

      setUserRole(
        payload.role
      );

      setLoading(false);

      return;

    }

  } catch (error) {

    console.error(
      "Invalid Authenticator token:",
      error
    );

    localStorage.removeItem(
      "payroll_authenticator_token"
    );

    localStorage.removeItem(
      "payroll_authenticator_user"
    );

  }

}


// --------------------------------
// Existing Supabase session
// --------------------------------

const {
  data: { session },
} = await supabase.auth.getSession();

if (!session) {
  setLoading(false);
  return;
}

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setLoading(false);
          return;
        }

        const { data: profile, error } = await supabase
          .from("employee_profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (error || !profile) {
          console.error("Unable to determine user role:", error);
          setLoading(false);
          return;
        }

        setUserRole(profile.role);
      } catch (error) {
        console.error("Route security check failed:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, []);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0f172a",
          color: "#f8fafc",
          fontSize: "18px",
          fontWeight: "600",
        }}
      >
        Checking access...
      </div>
    );
  }

  if (!userRole) {
    return <Navigate to="/login" replace />;
  }

  if (
    allowedRoles.length > 0 &&
    !allowedRoles.includes(userRole)
  ) {
    if (userRole === "employee") {
      return <Navigate to="/employee-dashboard" replace />;
    }

    if (userRole === "hr") {
      return <Navigate to="/dashboard" replace />;
    }

    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;