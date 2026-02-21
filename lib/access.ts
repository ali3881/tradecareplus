export function hasDashboardAccess(user: any, subscription: any) {
  if (!user) return false;
  if (user.role === "ADMIN") return true;
  return Boolean(
    subscription?.status === "active" || 
    subscription?.status === "trialing" ||
    // For legacy/compatibility with uppercase values if used elsewhere
    subscription?.status === "ACTIVE" || 
    subscription?.status === "TRIALING"
  );
}

export function hasServiceAccess(user: any, subscription: any) {
    // Alias for dashboard access, can add specific service checks if needed
    return hasDashboardAccess(user, subscription);
}
