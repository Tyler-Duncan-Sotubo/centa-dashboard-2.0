import { TourDefinition } from "../types/tours-id.types";

export const staffDepartmentsTour: TourDefinition = {
  id: "staff.departments",
  version: 1,
  steps: [
    {
      element: '[data-tour="departments.page"]',
      popover: {
        title: "Departments",
        description:
          "Departments help structure teams, reporting lines, and payroll.",
      },
    },
    {
      element: '[data-tour="departments.import"]',
      popover: {
        title: "Bulk import departments",
        description: "Upload multiple departments at once using a spreadsheet.",
      },
    },
    {
      element: '[data-tour="departments.add"]',
      popover: {
        title: "Add a department",
        description: "Create a single department manually when needed.",
      },
    },
    {
      element: '[data-tour="departments.list"]',
      popover: {
        title: "Department list",
        description: "All departments you create will appear here.",
      },
    },
  ],
};
