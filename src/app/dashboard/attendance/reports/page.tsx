import React from "react";
import { timeOffReportData } from "@/features/reports/config/report.data"; // Import report data
import { FaChevronRight } from "react-icons/fa"; // Import Chevron Down icon
import Link from "next/link";
import PageHeader from "@/shared/ui/page-header";
import { Button } from "@/shared/ui/button";

const ReportsPage = () => {
  return (
    <div className="px-6 mb-10">
      <PageHeader
        title="Reports"
        description="Generate and view various reports related to attendance and time off."
      />
      {/* Categories Grid (3 Columns) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-10">
        {timeOffReportData.map((category) => (
          <section key={category.category}>
            <h2 className="text-xl font-semibold mb-4">{category.category}</h2>
            <ul className="">
              {category.reports.map((report) => (
                <li
                  key={report.title}
                  className="flex justify-between items-center rounded-lg"
                >
                  <Link
                    href={report.link}
                    className="flex items-center text-gray-800"
                  >
                    <Button variant={"link"} className="p-0 text-md">
                      <FaChevronRight className="text-gray-600" size={20} />
                      {report.title}
                    </Button>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
};

export default ReportsPage;
