'use server';

import { inviteUser } from '@/modules/user/application/user-invitation.service';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function inviteUserAction(formData: FormData): Promise<void> {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'company_admin') {
    throw new Error('No autorizado');
  }

  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const result = inviteUser({
    inviterRole: session.user.role,
    inviterCompanyId: session.user.companyId!,
    name,
    email,
    password,
    role: 'company_user',
  });

  if (!result.success) {
    throw new Error(result.error);
  }

  revalidatePath('/dashboard/users');
}
