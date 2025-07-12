---
path: 'nextjs-server-first-data-fetching'
title: 'Modern Data Fetching in Next.js Apps with Server Components and useOptimistic'
description: 'An opinionated approach to data fetching in Next.js app with Server Components and useOptimistic'
date: 'Jul 12, 2025'
category: 'Next.js'
---

# Modern Data Fetching in Next.js Apps with Server Components and useOptimistic

If you've been building React apps with libraries like React Query, SWR, or Apollo Client, you know the drill: loading states, error boundaries, cache invalidation, and complex state management. While these tools are powerful, Next.js App Router offers a simpler path forward.

By embracing server components for data fetching and combining them with useOptimistic for instant UI updates, we can eliminate most client-side data fetching complexity. You get server-side performance with the responsiveness users expect—often with less code.

Here's the pattern that has transformed how I build Next.js applications.

## Server-Side Data Fetching

The basic app layout follows this structure:

The `app/page.tsx` file fetches data on the server side, allowing us to fetch data faster without hooks. To show error or loading states, Next.js automatically renders `app/error.tsx` or `app/loading.tsx` files when available for the corresponding state.

```javascript
// app/page.tsx
import { getUsers } from '@/actions/get-users';
import Users from '@/components/Users';

export default async function Home() {
  // Fetch data in the server component
  const { users } = await getUsers();

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <h1>Users</h1>
        <Users users={users} />
      </main>
    </div>
  );
}
```

The `Users` component acts as a wrapper for our user display feature, consisting of a table and a form to add new users. The wrapper component manages adding new users to the list optimistically, allowing us to immediately update the user list. If the `addUser` action fails, React automatically removes the user that failed.

We wrap our optimistic update in `startTransition` to tell React that this is a non-urgent update that can be interrupted if needed. This keeps the UI responsive while the server action runs in the background.

```javascript
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
```

In this solution, no loading indicator is shown in the UI. If we wanted to show an indicator, we could add a new property to the optimistic user to denote that it's pending:

```javascript
addOptimisticUser({ id: Date.now(), name, email, pending: true });
```

The UI now updates instantly. But how do we sync it with the backend after the action completes? Next.js has the perfect built-in solution for this. In our action, we can call `revalidatePath` to re-fetch the users if successful:

```javascript
'use server';

import { revalidatePath } from 'next/cache';
import { users } from '@/data/users';

export async function addUser(name: string, email: string) {
  // Add 2 second delay to simulate server response time
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Randomly throw error 50% of the time
  if (Math.random() < 0.5) {
    throw Error('failure!!!');
  }

  users.push({
    id: users.length + 1,
    name,
    email,
  });

  revalidatePath('/');
}
```

I've also added a random failure so the optimistic rollback can be observed. If you're fast enough, you'll notice that if two additional users are added but the first user fails, React will only remove the first user and the list will be fully in sync after the backend updates complete.

## Conclusion

While this pattern works for most use cases, client-side data fetching will be necessary in certain scenarios like infinite scroll. However, I plan to follow the data fetching pattern outlined in this article for my next few Next.js apps. For edge cases that require it, I'll use SWR for client-side fetching.

---

_Want to see this in action? Check out the [complete demo repository](https://github.com/edodso2/blog/tree/master/nextjs-server-first-data-fetching) with both the Next.js application and backend service._
