'use client';

import { startTransition, useOptimistic } from 'react';
import toast from 'react-hot-toast';
import { addUser } from '@/actions/add-user';
import { User } from '@/data/users';
import UsersTable from './UsersTable';
import AddUserForm from './AddUserForm';

interface UserProps {
  users: User[];
}

export default function Users({ users }: UserProps) {
  const [optimisticUsers, addOptimisticUser] = useOptimistic(
    users,
    (state, newUser: User) => [...state, newUser]
  );

  const handleAddUser = async (name: string, email: string) => {
    startTransition(async () => {
      addOptimisticUser({ id: Date.now(), name, email });

      try {
        await addUser(name, email);
      } catch (e) {
        toast.error('Failed to add user. Please try again.');
      }
    });
  };

  return (
    <>
      <UsersTable users={optimisticUsers} />
      <AddUserForm onAddUser={handleAddUser} />
    </>
  );
}
