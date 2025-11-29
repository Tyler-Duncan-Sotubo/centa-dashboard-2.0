import { useState } from "react";
import { FaStar } from "react-icons/fa";

type StarRatingInputProps = {
  value?: number;
  onChange: (val: number) => void;
};

export default function StarRatingInput({
  value = 0,
  onChange,
}: StarRatingInputProps) {
  const [hover, setHover] = useState<number | null>(null);

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const active = (hover ?? value) >= star;
        return (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(null)}
            onClick={() => onChange(star)}
            className={`text-2xl transition-colors ${
              active ? "text-yellow-500" : "text-gray-300"
            }`}
          >
            <FaStar
              size={30}
              className={`cursor-pointer ${active ? "fill-current" : ""}`}
            />
          </button>
        );
      })}
    </div>
  );
}
