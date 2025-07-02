import { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'NihonAustralia Admin',
  description: 'Admin panel for NihonAustralia platform',
};

export default function HomePage() {
  redirect('/admin/dashboard');
}