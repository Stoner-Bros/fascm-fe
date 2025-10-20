import { redirect } from 'next/navigation';

export default async function ConsigneePage() {
  // const { userId } = await auth();

  // if (!userId) {
  //   return redirect('/auth/sign-in');
  // } else {
  //   redirect('/consignee/dashboard');
  // }

  redirect('/consignee/dashboard');
}
