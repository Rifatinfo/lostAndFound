"use client";

import { SessionProvider } from "./SessionProvider";
import { ComposerProvider } from "@/components/modules/contexts/ComposerProvider";
import { PostsProvider } from "@/components/modules/contexts/PostContexts";
import { ProfileProvider } from "@/components/modules/contexts/ProfileProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ProfileProvider>
        <ComposerProvider>
          <PostsProvider>{children}</PostsProvider>
        </ComposerProvider>
      </ProfileProvider>
    </SessionProvider>
  );
}
