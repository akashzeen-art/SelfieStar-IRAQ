import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Calendar, Zap, Plus, Link as LinkIcon } from "lucide-react";
import { apiClient } from "@/lib/axios";
import SelfieUploadModal from "@/components/SelfieUploadModal";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Challenges() {
  const navigate = useNavigate();
  const [challenges, setChallenges] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [selectedChallengeId, setSelectedChallengeId] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const response = await apiClient.get("/challenge/trending");
        setChallenges(response.data.challenges || []);
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || "Could not load challenges");
      }
    };
    fetchChallenges();
  }, []);

  return (
    <AppLayout
      title={t.challenges.title}
      description={t.challenges.description}
    >
      <div className="space-y-6">
        {/* Create Challenge Button */}
        <div className="flex justify-end">
          <Button
            onClick={() => navigate("/challenge/create")}
            className="bg-white/20 hover:bg-white/30 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t.challenges.createChallenge}
          </Button>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-destructive/20 border border-destructive/40 text-destructive text-sm">
            {error}
          </div>
        )}
        {/* Challenge Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {challenges.map((challenge) => (
            <div
              key={challenge.id}
              className="rounded-xl border border-border/40 bg-transparent backdrop-blur-sm overflow-hidden hover:border-white/50 transition-colors group"
            >
              {/* Image */}
              <div
                className="h-48 w-full bg-black/20 flex items-center justify-center border-b border-border/40 overflow-hidden"
              >
                {challenge.bannerImage ? (
                  <img
                    src={challenge.bannerImage}
                    alt={challenge.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Zap className="h-12 w-12 text-white/40" />
                )}
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-lg font-bold mb-2">{challenge.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{challenge.description}</p>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-4 text-center py-4 border-t border-b border-border/40">
                  <div>
                    <p className="text-2xl font-bold text-white">{challenge.participantsCount || challenge.participants || 0}</p>
                    <p className="text-xs text-muted-foreground">{t.challenges.participants}</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white">{challenge.theme}</p>
                    <p className="text-xs text-muted-foreground">{t.challenges.theme}</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white">
                      {challenge.isActive ? daysLeft(challenge.endDate) : t.challenges.ended}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {challenge.isActive ? t.challenges.ends : t.challenges.status}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => navigate(`/challenge/${challenge.uniqueCode}`)}
                    variant="outline"
                    className="flex-1 border-white/20 text-white hover:bg-white/10"
                  >
                    <LinkIcon className="h-4 w-4 mr-2" />
                    {t.challenges.view}
                  </Button>
                  <Button
                    onClick={() => {
                      setSelectedChallengeId(challenge.id);
                      setIsUploadModalOpen(true);
                    }}
                    disabled={!challenge.isActive}
                    className="flex-1 bg-white/20 hover:bg-white/30 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {challenge.isActive ? t.challenges.participate : t.challenges.ended}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {challenges.length === 0 && (
          <div className="p-8 rounded-xl border border-border/40 bg-transparent backdrop-blur-sm text-center">
            <Calendar className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
            <h3 className="text-lg font-bold mb-2">{t.challenges.noChallenge}</h3>
            <p className="text-muted-foreground">{t.challenges.noChallengeDesc}</p>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <SelfieUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          setSelectedChallengeId(null);
        }}
        challengeId={selectedChallengeId || undefined}
      />
    </AppLayout>
  );
}

function daysLeft(endDateIso: string) {
  const remainingMs = new Date(endDateIso).getTime() - Date.now();
  const days = Math.max(0, Math.ceil(remainingMs / (24 * 60 * 60 * 1000)));
  return `${days} days`;
}
