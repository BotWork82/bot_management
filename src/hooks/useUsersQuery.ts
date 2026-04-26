import { useQuery } from "@tanstack/react-query";
import { usersService } from "../services/users.service";

export function useUsersQuery(page: number = 1, take: number = 10) {
  return useQuery({ queryKey: ["users", { page, take }], queryFn: () => usersService.getUsers({ page, take }), staleTime: 1000 * 60 * 1 });
}
