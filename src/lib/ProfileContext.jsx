import { createContext, useContext } from "react";

export const ProfileContext = createContext({ childId: null, childName: null });
export const useProfile = () => useContext(ProfileContext);
