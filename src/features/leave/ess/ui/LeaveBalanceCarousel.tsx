"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules"; // <-- Import Pagination module
import "swiper/css";
import "swiper/css/pagination"; // <-- Import Pagination styles

const getIconForLeaveType = (type: string) => {
  switch (type.toLowerCase()) {
    case "annual leave":
      return <span className="text-xl">🏖️</span>;
    case "sick leave":
      return <span className="text-xl">🤒</span>;
    case "unpaid leave":
      return <span className="text-xl">💸</span>;
    case "compensatory leave":
      return <span className="text-xl">⏱️</span>;
    default:
      return <span className="text-xl">📅</span>;
  }
};

interface LeaveBalanceEntry {
  leaveTypeId: string;
  leaveTypeName: string;
  year: number;
  entitlement: string;
  used: string;
  balance: string;
}

export default function LeaveBalanceCarousel({
  balance,
}: {
  balance: LeaveBalanceEntry[];
}) {
  return (
    <Swiper
      slidesPerView={1}
      breakpoints={{
        320: { slidesPerView: 2 },
        640: { slidesPerView: 2 },
        768: { slidesPerView: 4 },
        1024: { slidesPerView: 5 },
      }}
      spaceBetween={16}
      pagination={{ clickable: true }} // <-- Add this
      modules={[Pagination]} // <-- Add this
      className="w-full custom-swiper"
    >
      {balance.map((entry) => (
        <SwiperSlide key={entry.leaveTypeId} style={{ width: "300px" }}>
          <div className="p-4 h-full rounded-xl border">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-secondary text-white">
                {getIconForLeaveType(entry.leaveTypeName)}
              </div>
              <h3 className="text-md font-medium">{entry.leaveTypeName}</h3>
            </div>
            <div className="text-sm text-muted-foreground">
              Year: {entry.year}
            </div>
            <div className="mt-4">
              <div className="text-md">
                Available:{" "}
                <span className="font-semibold text-lg">
                  {parseFloat(entry.balance).toLocaleString()}
                </span>
              </div>
              <div className="text-md">
                Used:{" "}
                <span className="font-semibold text-lg">
                  {parseFloat(entry.used).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
