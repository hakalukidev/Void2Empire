"use client";

import { createContext, useContext } from "react";

// True inside the intercepted login/register modal. Switching between the two
// there replaces the history entry, so Back closes the modal instead of
// stepping through every form the user flipped between.
const AuthModalContext = createContext(false);

export const AuthModalProvider = AuthModalContext.Provider;

export function useInAuthModal() {
  return useContext(AuthModalContext);
}
