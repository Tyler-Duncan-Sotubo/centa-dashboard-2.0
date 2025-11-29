"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import FeedbackSettings from "./_components/FeedbackSettings";
import FeedbackQuestionPanel from "./_components/FeedbackQuestionPanel";

export default function PerformanceSettingsPage() {
  return (
    <div className="px-4">
      <h1 className="text-2xl font-bold mb-6">Performance Settings</h1>

      <Tabs defaultValue="feedback" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="feedback">Feedback Settings</TabsTrigger>
          <TabsTrigger value="questions">Feedback Questions</TabsTrigger>
        </TabsList>

        <TabsContent value="feedback">
          <FeedbackSettings />
        </TabsContent>

        <TabsContent value="questions">
          <FeedbackQuestionPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
