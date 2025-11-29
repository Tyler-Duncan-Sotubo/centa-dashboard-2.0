import CommentForm from "./CommentForm";
import {
  FaCheckCircle,
  FaUserClock,
  FaClock,
  FaCalendarAlt,
} from "react-icons/fa";

interface Attendance {
  present: number;
  absent: number;
  late: number;
  totalDays: number;
}

export default function AttendanceSection({
  attendance,
  assessmentId,
  comment,
}: {
  attendance: Attendance;
  assessmentId: string;
  comment: string;
}) {
  const summaryData = [
    {
      title: "Total Days",
      icon: <FaCalendarAlt className="text-blue-600" />,
      value: attendance.totalDays,
    },
    {
      title: "Present",
      icon: <FaCheckCircle className="text-green-600" />,
      value: attendance.present,
    },
    {
      title: "Absent",
      icon: <FaUserClock className="text-red-600" />,
      value: attendance.absent,
    },
    {
      title: "Late",
      icon: <FaClock className="text-yellow-600" />,
      value: attendance.late,
    },
  ];

  return (
    <>
      <h2 className="text-lg font-semibold">Attendance Summary</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
        {summaryData.map(({ title, icon, value }) => (
          <div
            key={title}
            className="px-4 py-6 shadow rounded-lg bg-white flex flex-col items-center space-y-2"
          >
            <div className="flex items-center gap-2">
              <div className="bg-gray-100 p-2 rounded-full text-xl">{icon}</div>
              <span className="text-2xl font-semibold">{value}</span>
            </div>
            <p className="text-sm text-muted-foreground">{title}</p>
          </div>
        ))}
      </div>
      <CommentForm
        name="attendanceComment"
        assessmentId={assessmentId}
        comment={comment}
      />
    </>
  );
}
