'use client'

import { User } from '@/data/users';

interface UsersTableProps {
  users: User[];
}

export default function UsersTable({ users }: UsersTableProps) {
  return (
    <table className="w-full border-collapse border border-gray-300">
      <thead className="bg-gray-50 text-gray-800">
        <tr>
          <th className="border border-gray-300 px-4 py-2 text-left font-medium">
            Name
          </th>
          <th className="border border-gray-300 px-4 py-2 text-left font-medium">
            Email
          </th>
        </tr>
      </thead>
      <tbody>
        {users.map(({ id, name, email }) => (
          <tr key={id}>
            <td className="border border-gray-300 px-4 py-2">{name}</td>
            <td className="border border-gray-300 px-4 py-2">{email}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
