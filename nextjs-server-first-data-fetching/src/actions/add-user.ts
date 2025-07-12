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
