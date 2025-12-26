"use client";

import { ReactNode } from 'react';
import AdminLayout from '@/components/admin/layout/AdminLayout';

interface AdminLayoutWrapperProps {
  children: ReactNode;
}

export default function AdminLayoutWrapper({ children }: AdminLayoutWrapperProps) {
  return <AdminLayout>{children}</AdminLayout>;
}
