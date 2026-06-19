import { useQuery } from "@tanstack/react-query";
import { authApi } from "../api/modules";

export function useAuth() {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: authApi.me,
    enabled: Boolean(localStorage.getItem("wm_token")),
    retry: false
  });
}
