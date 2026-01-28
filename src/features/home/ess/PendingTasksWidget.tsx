type ChecklistItem = {
  statusId: string;
  checkListStatus: string;
  checklistId: string;
  title: string;
  dueDaysAfterStart: number;
  startDate: string; // ISO format
};

export default function PendingTasksWidget({
  checklist,
}: {
  checklist: ChecklistItem[];
}) {
  const pendingTasks = checklist.filter(
    (item) => item.checkListStatus === "pending"
  );

  return (
    <div className="p-4 rounded-xl border bg-white">
      <h2 className="text-lg font-semibold mb-4">Pending Tasks</h2>
      {pendingTasks.length === 0 ? (
        <p className="text-muted-foreground">You&apos;re all caught up 🎉</p>
      ) : (
        <ul className="space-y-3">
          {pendingTasks.map((task) => {
            const start = new Date(task.startDate);
            const dueDate = new Date(
              start.getTime() + task.dueDaysAfterStart * 86400000
            );

            return (
              <li key={task.statusId} className="">
                <div className="font-medium">{task.title}</div>
                <div className="text-sm text-muted-foreground">
                  Status:{" "}
                  {task.checkListStatus.charAt(0).toUpperCase() +
                    task.checkListStatus.slice(1)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Due: {dueDate.toDateString()}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
