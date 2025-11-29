"use client";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "../../app/announcement-carousel.css";

export type BannerItem = {
  id: string;
  message: string | React.ReactNode; // Allow message to be a string or a React node
  icon?: string;
};

type Props = {
  banners: BannerItem[];
  interval?: number;
};

export const AnnouncementCarousel: React.FC<Props> = ({
  banners,
  interval = 5000,
}) => {
  if (banners.length === 0) return null;

  return (
    <div className="relative">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: interval, pauseOnMouseEnter: true }}
        loop
        className="announcement-swiper"
      >
        {banners.map((banner) => (
          <SwiperSlide key={banner.id}>
            <div className="bg-monzo-background text-monzo-textPrimary flex items-center justify-center min-h-[100px] transition-all duration-500 ease-in-out">
              <span className="mr-2 text-xl">{banner.icon}</span>
              <p className="text-md text-monzo-textPrimary font-semibold">
                {banner.message}
              </p>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};
