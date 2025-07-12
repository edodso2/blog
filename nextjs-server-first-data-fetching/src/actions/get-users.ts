'use server';

import { users } from '@/data/users';

export async function getUsers() {
  // Add 2 second delay to simulate server response time
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Return data
  return {
    success: true,
    users,
  };
}
