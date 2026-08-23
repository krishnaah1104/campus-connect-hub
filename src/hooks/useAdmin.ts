import { useMyProfile, useSession } from "./useProfile";

/**
 * Hook to determine if the currently logged in student has Admin/Owner privileges.
 * An admin is identified by having 'admin' in their profile roles array or by
 * having an admin email.
 */
export function useIsAdmin() {
  const { data: user, isLoading: isSessionLoading } = useSession();
  const { data: profile, isLoading: isProfileLoading } = useMyProfile();

  const isLoading = isSessionLoading || isProfileLoading;

  const roles = profile?.roles ?? [];
  const hasAdminRole = roles.includes("admin") || roles.includes("owner");
  const email = (user?.email ?? profile?.email ?? "").toLowerCase();
  const hasAdminEmail =
    email.includes("admin") ||
    email.includes("owner") ||
    email.startsWith("krishna"); // owner fallback

  const isAdmin = Boolean(hasAdminRole || hasAdminEmail);

  return {
    isAdmin,
    isLoading,
    user,
    profile,
  };
}
