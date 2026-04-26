import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usersService, type CreateUserDto, type UpdateUserDto } from "../services/users.service";

export function useUsersQuery(page: number = 1, take: number = 10) {
  return useQuery({ queryKey: ["users", { page, take }], queryFn: () => usersService.getUsers({ page, take }), staleTime: 1000 * 60 });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateUserDto) => usersService.createUser(dto),
    onSuccess() {
      qc.invalidateQueries({ predicate: (q) => q.queryKey[0] === "users" });
    }
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateUserDto }) => usersService.updateUser(id, dto),
    onSuccess() {
      qc.invalidateQueries({ predicate: (q) => q.queryKey[0] === "users" });
    }
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => usersService.deleteUser(id),
    onSuccess() {
      qc.invalidateQueries({ predicate: (q) => q.queryKey[0] === "users" });
    }
  });
}
