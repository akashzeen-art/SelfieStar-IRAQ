import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { apiClient } from "@/lib/axios";
import { mediaUrlFromToken } from "@/lib/api";
import { getLocalSelfies, deleteLocalSelfie, saveLocalSelfie } from "@/lib/local-selfies";
import { useAuth } from "@/contexts/AuthContext";

export interface UserSelfie {
  id: string;
  image: string;
  score: number;
  caption?: string;
  isPublic: boolean;
  likes: number;
  comments: number;
  createdAt: string;
  challengeId?: string;
}

interface SelfieContextType {
  selfies: UserSelfie[];
  addSelfie: (selfie: UserSelfie) => void;
  deleteSelfie: (id: string) => Promise<void>;
  refreshMine: () => Promise<void>;
  refreshPublic: () => Promise<UserSelfie[]>;
  likeSelfie: (id: string) => Promise<number>;
  addComment: (id: string, text: string) => Promise<number>;
  getTotalScore: () => number;
  getAverageScore: () => number;
  getBestScore: () => number;
}

const SelfieContext = createContext<SelfieContextType | undefined>(undefined);

function localToUserSelfie(selfie: { id: string; image: string; createdAt: string }): UserSelfie {
  return {
    id: selfie.id,
    image: selfie.image,
    score: 0,
    isPublic: false,
    likes: 0,
    comments: 0,
    createdAt: selfie.createdAt,
  };
}

export function SelfieProvider({ children }: { children: React.ReactNode }) {
  const [selfies, setSelfies] = useState<UserSelfie[]>([]);
  const { user } = useAuth();
  const isPortalUser = Boolean(user?.portal || user?.phone);

  const toUserSelfie = (selfie: any): UserSelfie => ({
    id: selfie.id,
    image: selfie.imageUrl || (selfie.mediaToken ? mediaUrlFromToken(selfie.mediaToken) : ""),
    score: selfie.score,
    caption: selfie.caption,
    isPublic: selfie.isPublic,
    likes: selfie.likes,
    comments: selfie.comments,
    createdAt: selfie.createdAt,
    challengeId: selfie.challengeId,
  });

  const refreshMine = useCallback(async () => {
    if (isPortalUser) {
      setSelfies(getLocalSelfies().map(localToUserSelfie));
      return;
    }
    const response = await apiClient.get<{ selfies: any[] }>("/selfies/mine");
    setSelfies(response.data.selfies.map(toUserSelfie));
  }, [isPortalUser]);

  useEffect(() => {
    if (user) {
      refreshMine().catch(() => {});
    }
  }, [user?.id, isPortalUser, refreshMine]);

  const addSelfie = (selfie: UserSelfie) => {
    setSelfies((current) => [selfie, ...current]);
  };

  const deleteSelfie = async (id: string) => {
    if (isPortalUser) {
      deleteLocalSelfie(id);
      setSelfies((current) => current.filter((s) => s.id !== id));
      return;
    }
    await apiClient.delete<{ message: string }>(`/selfies/${id}`);
    setSelfies((current) => current.filter((s) => s.id !== id));
  };

  const refreshPublic = async () => {
    if (isPortalUser) return [];
    const response = await apiClient.get<{ selfies: any[] }>("/selfies/public");
    return response.data.selfies.map(toUserSelfie);
  };

  const likeSelfie = async (id: string) => {
    if (isPortalUser) return 0;
    const response = await apiClient.post<{ likes: number }>(`/selfies/${id}/like`);
    return response.data.likes;
  };

  const addComment = async (id: string, text: string) => {
    if (isPortalUser) return 0;
    const response = await apiClient.post<{ comments: number }>(`/selfies/${id}/comments`, { text });
    return response.data.comments;
  };

  const getTotalScore = () => selfies.reduce((sum, s) => sum + s.score, 0);
  const getAverageScore = () => (selfies.length ? Math.round(getTotalScore() / selfies.length) : 0);
  const getBestScore = () => (selfies.length ? Math.max(...selfies.map((s) => s.score)) : 0);

  return (
    <SelfieContext.Provider
      value={{
        selfies,
        addSelfie,
        deleteSelfie,
        refreshMine,
        refreshPublic,
        likeSelfie,
        addComment,
        getTotalScore,
        getAverageScore,
        getBestScore,
      }}
    >
      {children}
    </SelfieContext.Provider>
  );
}

export function useSelfies() {
  const context = useContext(SelfieContext);
  if (context === undefined) {
    throw new Error("useSelfies must be used within a SelfieProvider");
  }
  return context;
}

export { saveLocalSelfie };
