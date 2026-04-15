import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader, Sparkles } from "lucide-react";
import { apiClient } from "@/lib/axios";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

export default function CreateChallenge() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    theme: "",
    banner: "",
    hashtags: [] as string[],
    startDate: "",
    duration: "3",
    winningReward: "",
  });
  const [calculatedEndDate, setCalculatedEndDate] = useState<string>("");
  const { t } = useLanguage();

  const updateEndDate = (start: string, durationDays: string) => {
    if (!start) {
      setCalculatedEndDate("");
      return;
    }
    const startDate = new Date(start);
    if (isNaN(startDate.getTime())) {
      setCalculatedEndDate("");
      return;
    }
    const days = Number(durationDays);
    const endDate = new Date(startDate.getTime() + days * 24 * 60 * 60 * 1000);
    setCalculatedEndDate(
      endDate.toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const startDate = new Date(formData.startDate);
      if (isNaN(startDate.getTime())) {
        toast.error("Please select a valid start date");
        setIsLoading(false);
        return;
      }
      if (!formData.winningReward.trim()) {
        toast.error("Please enter a winning reward");
        setIsLoading(false);
        return;
      }

      const description = formData.description?.trim() || formData.title;
      const theme = formData.theme?.trim() || "General";

      const response = await apiClient.post("/challenge/create", {
        title: formData.title,
        description,
        theme,
        startDate: startDate.toISOString(),
        duration: Number(formData.duration),
        winningReward: formData.winningReward.trim(),
      });

      toast.success("Challenge created successfully!");
      navigate(`/challenge/${response.data.challenge.uniqueCode}`);
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "Failed to create challenge";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout
      title={t.createChallenge.title}
      description={t.createChallenge.description}
    >
      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2 text-white">{t.createChallenge.challengeTitle}</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder={t.createChallenge.titlePlaceholder}
              required
              minLength={3}
              maxLength={120}
              className="bg-white/10 border-white/20 text-white"
            />
          </div>

          {/* Dates */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-white">{t.createChallenge.startDate}</label>
                <Input
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData({ ...formData, startDate: value });
                    updateEndDate(value, formData.duration);
                  }}
                  required
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-white">{t.createChallenge.duration}</label>
                <select
                  value={formData.duration}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData({ ...formData, duration: value });
                    updateEndDate(formData.startDate, value);
                  }}
                  className="w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-sm text-white"
                >
                  <option value="1">{t.createChallenge.day1}</option>
                  <option value="3">{t.createChallenge.day3}</option>
                  <option value="7">{t.createChallenge.day7}</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-white">{t.createChallenge.endDateAuto}</label>
              <div className="w-full rounded-md border border-white/20 bg-white/5 px-3 py-2 text-sm text-white/80">
                {calculatedEndDate || t.createChallenge.selectStartDate}
              </div>
            </div>
          </div>

          {/* Winning Reward */}
          <div>
            <label className="block text-sm font-medium mb-2 text-white">{t.createChallenge.winningReward}</label>
            <Input
              value={formData.winningReward}
              onChange={(e) => setFormData({ ...formData, winningReward: e.target.value })}
              placeholder={t.createChallenge.rewardPlaceholder}
              required
              minLength={3}
              maxLength={200}
              className="bg-white/10 border-white/20 text-white"
            />
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-white/20 hover:bg-white/30 text-white"
            >
              {isLoading ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />{t.createChallenge.creating}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />{t.createChallenge.createChallenge}
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/challenges")}
              className="border-white/20 text-white hover:bg-white/10"
            >
              {t.createChallenge.cancel}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
