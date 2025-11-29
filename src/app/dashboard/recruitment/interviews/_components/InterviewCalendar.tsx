"use client";

import React, { useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  addMonths,
  subMonths,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  getDay,
} from "date-fns";
import InterviewDetailsModal from "./InterviewDetailsModal"; // adjust path as needed
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

type Interview = {
  id: string;
  scheduledFor: string;
  durationMins: number;
  stage: string;
  mode: string;
  meetingLink?: string;
  applicationId: string;
  candidateName?: string;
};

type Props = {
  interviews: Interview[] | undefined;
};

const InterviewCalendar = ({ interviews }: Props) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(
    null
  );
  const [modalOpen, setModalOpen] = useState(false);

  const openModal = (interview: Interview) => {
    setSelectedInterview(interview);
    setModalOpen(true);
  };

  const firstDayOfMonth = startOfMonth(currentDate);
  const lastDayOfMonth = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({
    start: firstDayOfMonth,
    end: lastDayOfMonth,
  });

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const getInterviewsOnDate = (date: Date) => {
    return interviews?.filter((interview) => {
      const interviewDate = new Date(interview.scheduledFor);
      return (
        interviewDate.getFullYear() === date.getFullYear() &&
        interviewDate.getMonth() === date.getMonth() &&
        interviewDate.getDate() === date.getDate()
      );
    });
  };

  const renderDays = () => {
    const startDay = getDay(firstDayOfMonth);
    const totalCells = Math.ceil((daysInMonth.length + startDay) / 7) * 7;

    return Array.from({ length: totalCells }).map((_, index) => {
      const date = new Date(firstDayOfMonth);
      date.setDate(date.getDate() + (index - startDay));

      const isWeekend = getDay(date) === 0 || getDay(date) === 6;
      const interviewEvents = getInterviewsOnDate(date);
      const isCurrentMonth = isSameMonth(date, currentDate);
      const isTodayDay = isToday(date);

      let baseBg = "bg-white";
      if (isTodayDay) baseBg = "bg-brand";
      else if (isWeekend) baseBg = "bg-gray-50";

      return (
        <div
          key={index}
          className={`p-2 text-sm border h-[15vh] flex flex-col justify-between border-gray-100 ${
            !isCurrentMonth ? "opacity-50" : ""
          } ${baseBg}`}
        >
          <div className="font-semibold text-left">{format(date, "d")}</div>
          <div className="flex flex-col gap-1 text-xs text-textPrimary">
            {interviewEvents?.map((interview) => (
              <Button
                variant="link"
                key={interview.id}
                onClick={() => openModal(interview)}
                className="text-xs truncate"
              >
                {format(new Date(interview.scheduledFor), "hh:mm a")} Interview
                - {interview.stage}
              </Button>
            ))}
          </div>
        </div>
      );
    });
  };

  return (
    <div>
      <div className="bg-white mt-5">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {format(currentDate, "MMMM yyyy")}
          </h2>
          <div className="flex items-center space-x-2">
            <Button onClick={handlePrevMonth} size={"icon"}>
              <ArrowLeft />
            </Button>
            <Button onClick={handleNextMonth} size={"icon"}>
              <ArrowRight />
            </Button>
          </div>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-1 text-center text-gray-600 font-medium mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>

        {/* Calendar Grid */}

        <div className="grid grid-cols-7">{renderDays()}</div>
      </div>
      <InterviewDetailsModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        interview={selectedInterview}
      />
    </div>
  );
};

export default InterviewCalendar;
