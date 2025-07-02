'use client';

import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { SupabaseClient } from '@supabase/supabase-js';
import { useState } from 'react';

export const SupabaseProvider = ({
  children,
  supabaseClient: injectedClient,
}: {
  children: React.ReactNode;
  supabaseClient?: SupabaseClient;
}) => {
  const [supabaseClient] = useState<SupabaseClient>(
    () => injectedClient || createPagesBrowserClient(),
  );

  return (
    <SessionContextProvider supabaseClient={supabaseClient}>
      {children}
    </SessionContextProvider>
  );
};