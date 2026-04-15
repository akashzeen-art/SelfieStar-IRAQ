import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  User, Edit2, Save, X, Camera, Star, Trophy, TrendingUp, Award, Calendar,
  Mail, Shield, Trash2, Upload, Image as ImageIcon
} from "lucide-react";
import { apiClient } from "@/lib/axios";
import { useAuth } from "@/contexts/AuthContext";
import { useSelfies } from "@/contexts/SelfieContext";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

interface UserProfile {
  id: string; username: string; email: string; role: string;
  profileImage?: string; totalSelfies: number; totalVideos: number;
  totalScore: number; challengeWins: number; badges: string[];
  isVerified: boolean; createdAt: string; lastLogin?: string;
}

interface UserStats {
  totalSelfies: number; totalVideos: number; totalScore: number;
  averageScore: number; challengeWins: number; badges: string[];
  leaderboardRank: number;
  selfieStats: { totalSelfies: number; averageScore: number; totalLikes: number; publicSelfies: number; };
  challengesParticipated: number;
}

export default function Profile() {
  const navigate = useNavigate();
  const { user: authUser, logout } = useAuth();
  const { selfies, refreshMine } = useSelfies();
  const { toast } = useToast();
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [formData, setFormData] = useState({ username: "", name: "", profileImage: "" });

  useEffect(() => {
    if (!authUser) { navigate("/login"); return; }
    loadProfile();
  }, [authUser]);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const [profileRes, statsRes] = await Promise.all([
        apiClient.get("/user/profile"),
        apiClient.get("/user/stats"),
      ]);
      setProfile(profileRes.data.user);
      setStats(statsRes.data.stats);
      setFormData({ username: profileRes.data.user.username || "", name: profileRes.data.user.username || "", profileImage: profileRes.data.user.profileImage || "" });
      await refreshMine();
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.message || "Failed to load profile", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (profile) setFormData({ username: profile.username || "", name: profile.username || "", profileImage: profile.profileImage || "" });
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const response = await apiClient.put("/user/update", {
        username: formData.username || undefined,
        name: formData.name || undefined,
        profileImage: formData.profileImage || undefined,
      });
      setProfile(response.data.user);
      setIsEditing(false);
      await loadProfile();
      toast({ title: "Success", description: "Profile updated successfully" });
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.message || "Failed to update profile", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast({ title: "Invalid file", description: "Please upload an image file", variant: "destructive" }); return; }
    if (file.size > 5 * 1024 * 1024) { toast({ title: "File too large", description: "Image must be less than 5MB", variant: "destructive" }); return; }
    try {
      setIsUploadingImage(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        setFormData({ ...formData, profileImage: reader.result as string });
        await handleSave();
      };
      reader.readAsDataURL(file);
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to upload image", variant: "destructive" });
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm(t.profile.deleteConfirm)) return;
    try {
      await apiClient.delete("/user/delete-account");
      toast({ title: "Account deleted", description: "Your account has been deleted successfully" });
      logout();
      navigate("/");
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.message || "Failed to delete account", variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <AppLayout title={t.profile.title}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block h-12 w-12 border-4 border-neon-purple border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-muted-foreground">{t.profile.loading}</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!profile || !stats) {
    return (
      <AppLayout title={t.profile.title}>
        <div className="text-center py-12">
          <p className="text-muted-foreground">{t.profile.failedLoad}</p>
          <Button onClick={loadProfile} className="mt-4">{t.profile.retry}</Button>
        </div>
      </AppLayout>
    );
  }

  const recentSelfies = selfies.slice(0, 6);

  return (
    <AppLayout title={t.profile.title}>
      <div className="space-y-6 md:space-y-8 animate-fade-in">
        {/* Profile Header */}
        <div className="rounded-xl border border-border/40 bg-transparent backdrop-blur-sm p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="relative group">
              <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-white/30 bg-white/10">
                {formData.profileImage ? (
                  <img src={formData.profileImage} alt={profile.username} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="h-12 w-12 md:h-16 md:w-16 text-neon-purple" />
                  </div>
                )}
                {isEditing && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    <Button size="sm" variant="secondary" onClick={() => fileInputRef.current?.click()} disabled={isUploadingImage}>
                      {isUploadingImage ? <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Upload className="h-4 w-4" />}
                    </Button>
                  </div>
                )}
              </div>
              {profile.isVerified && (
                <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1 border-2 border-background">
                  <Shield className="h-4 w-4 text-white" />
                </div>
              )}
            </div>

            <div className="flex-1 space-y-4">
              {isEditing ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t.profile.username}</label>
                    <Input value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} placeholder={t.profile.username} className="max-w-md" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t.profile.name}</label>
                    <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder={t.profile.displayName} className="max-w-md" />
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={handleSave} disabled={isSaving} className="bg-gradient-to-r from-neon-purple to-neon-pink hover:from-neon-purple/90 hover:to-neon-pink/90 text-white">
                      {isSaving ? <><div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />{t.profile.saving}</> : <><Save className="h-4 w-4 mr-2" />{t.profile.saveChanges}</>}
                    </Button>
                    <Button onClick={handleCancel} variant="outline"><X className="h-4 w-4 mr-2" />{t.profile.cancel}</Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-neon-purple to-neon-pink bg-clip-text text-transparent">{profile.username}</h1>
                    {profile.isVerified && (
                      <span className="px-2 py-1 text-xs font-medium bg-green-500/20 text-green-400 rounded-full flex items-center gap-1">
                        <Shield className="h-3 w-3" />{t.profile.verified}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2"><Mail className="h-4 w-4" /><span>{profile.email}</span></div>
                    <div className="flex items-center gap-2"><Calendar className="h-4 w-4" /><span>{t.profile.joined} {new Date(profile.createdAt).toLocaleDateString()}</span></div>
                  </div>
                  <Button onClick={() => setIsEditing(true)} variant="outline" className="mt-4">
                    <Edit2 className="h-4 w-4 mr-2" />{t.profile.editProfile}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-lg border border-border/40 bg-transparent backdrop-blur-sm p-4 text-center">
            <Star className="h-6 w-6 text-neon-purple mx-auto mb-2" />
            <div className="text-2xl font-bold">{stats.totalSelfies}</div>
            <div className="text-xs text-muted-foreground">{t.profile.totalSelfies}</div>
          </div>
          <div className="rounded-lg border border-border/40 bg-transparent backdrop-blur-sm p-4 text-center">
            <Trophy className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">#{stats.leaderboardRank}</div>
            <div className="text-xs text-muted-foreground">{t.profile.rank}</div>
          </div>
          <div className="rounded-lg border border-border/40 bg-transparent backdrop-blur-sm p-4 text-center">
            <TrendingUp className="h-6 w-6 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{stats.averageScore.toFixed(1)}</div>
            <div className="text-xs text-muted-foreground">{t.profile.avgScore}</div>
          </div>
          <div className="rounded-lg border border-border/40 bg-transparent backdrop-blur-sm p-4 text-center">
            <Award className="h-6 w-6 text-neon-pink mx-auto mb-2" />
            <div className="text-2xl font-bold">{stats.challengeWins}</div>
            <div className="text-xs text-muted-foreground">{t.profile.wins}</div>
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-xl border border-border/40 bg-transparent backdrop-blur-sm p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><TrendingUp className="h-5 w-5 text-neon-purple" />{t.profile.performance}</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center"><span className="text-muted-foreground">{t.profile.totalScore}</span><span className="font-bold">{stats.totalScore}</span></div>
              <div className="flex justify-between items-center"><span className="text-muted-foreground">{t.profile.averageScore}</span><span className="font-bold">{stats.averageScore.toFixed(1)}</span></div>
              <div className="flex justify-between items-center"><span className="text-muted-foreground">{t.profile.totalLikes}</span><span className="font-bold">{stats.selfieStats.totalLikes}</span></div>
              <div className="flex justify-between items-center"><span className="text-muted-foreground">{t.profile.publicSelfies}</span><span className="font-bold">{stats.selfieStats.publicSelfies}</span></div>
            </div>
          </div>
          <div className="rounded-xl border border-border/40 bg-transparent backdrop-blur-sm p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Camera className="h-5 w-5 text-neon-pink" />{t.profile.activity}</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center"><span className="text-muted-foreground">{t.profile.challengesParticipated}</span><span className="font-bold">{stats.challengesParticipated}</span></div>
              <div className="flex justify-between items-center"><span className="text-muted-foreground">{t.profile.challengeWins}</span><span className="font-bold">{stats.challengeWins}</span></div>
              <div className="flex justify-between items-center"><span className="text-muted-foreground">{t.profile.totalVideos}</span><span className="font-bold">{stats.totalVideos}</span></div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">{t.profile.lastLogin}</span>
                <span className="font-bold text-sm">{profile.lastLogin ? new Date(profile.lastLogin).toLocaleDateString() : t.profile.never}</span>
              </div>
            </div>
          </div>
        </div>

        {stats.badges.length > 0 && (
          <div className="rounded-xl border border-border/40 bg-transparent backdrop-blur-sm p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Award className="h-5 w-5 text-yellow-500" />{t.profile.badges}</h2>
            <div className="flex flex-wrap gap-3">
              {stats.badges.map((badge, index) => (
                <div key={index} className="px-4 py-2 rounded-full bg-gradient-to-r from-neon-purple/20 to-neon-pink/20 border border-neon-purple/30 text-sm font-medium">{badge}</div>
              ))}
            </div>
          </div>
        )}

        {recentSelfies.length > 0 && (
          <div className="rounded-xl border border-border/40 bg-transparent backdrop-blur-sm p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><ImageIcon className="h-5 w-5 text-neon-cyan" />{t.profile.recentSelfies}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {recentSelfies.map((selfie) => (
                <div key={selfie.id} className="relative aspect-square rounded-lg overflow-hidden border border-border/40 bg-gradient-to-br from-slate-800 to-slate-900 group hover:border-neon-purple/50 transition-colors">
                  {selfie.image ? <img src={selfie.image} alt="Selfie" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Camera className="h-8 w-8 text-muted-foreground" /></div>}
                  <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-gradient-to-r from-neon-purple to-neon-pink text-white text-xs font-bold">{selfie.score || 0}★</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-xl border border-destructive/40 bg-destructive/10 backdrop-blur-sm p-6">
          <h2 className="text-xl font-bold mb-4 text-destructive">{t.profile.dangerZone}</h2>
          <p className="text-sm text-muted-foreground mb-4">{t.profile.dangerDesc}</p>
          <Button onClick={handleDeleteAccount} variant="destructive" className="gap-2">
            <Trash2 className="h-4 w-4" />{t.profile.deleteAccount}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
