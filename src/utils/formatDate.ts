export const formatDate = (isoString: string): string => {
  const date = new Date(isoString);

  // Options for formatting the date
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  // Convert date to readable format
  return date.toLocaleDateString("en-US", options);
};

// give me Its wednesday, 24 of March 2021
const date = new Date();

const daysOfWeek = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const dayOfWeek = daysOfWeek[date.getDay()];
const day = date.getDate();
const month = months[date.getMonth()];
const year = date.getFullYear();

export const formattedDate = `It's ${dayOfWeek}, ${day} of ${month} ${year}`;

const hours = date.getHours();
export const timeOfDay =
  hours < 12 ? "morning" : hours < 18 ? "afternoon" : "evening";
