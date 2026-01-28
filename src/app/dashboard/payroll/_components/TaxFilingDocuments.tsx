"use client";

import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { DownloadIcon } from "lucide-react";
import Image from "next/image";

const taxFolders = [
  {
    name: "PAYE",
    description: "Pay As You Earn tax deductions for employees",
  },
  {
    name: "NHF",
    description: "National Housing Fund contribution deductions",
  },
  {
    name: "Pension",
    description: "Pension contribution deductions for employees",
  },
];

// Generate dynamic months for 2025
const months2025 = [
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

const TaxFilingDocuments = () => {
  const [selectedFolder, setSelectedFolder] = useState("PAYE");

  return (
    <div>
      {/* Tabs for Tax Folders */}
      <Tabs className="my-10 mt-24 border-0" defaultValue="PAYE">
        <TabsList className="flex border-0 gap-6 bg-transparent">
          {taxFolders.map((folder) => (
            <TabsTrigger
              value={folder.name}
              key={folder.name}
              onClick={() => setSelectedFolder(folder.name)}
              className={`cursor-pointer border-0 bg-transparent data-[state=active]:shadow-none ${
                selectedFolder === folder.name ? "text-white" : "text-black"
              }`}
            >
              {selectedFolder === folder.name ? (
                <Image
                  src={`https://res.cloudinary.com/dw1ltt9iz/image/upload/v1757586193/folder-open_m9qvwu.png`}
                  alt={folder.name}
                  width={80}
                  height={100}
                />
              ) : (
                <Image
                  src={`https://res.cloudinary.com/dw1ltt9iz/image/upload/v1757586194/folder_nffbsg.png`}
                  alt={folder.name}
                  width={80}
                  height={100}
                />
              )}
              <p className="font-semibold mt-2">{folder.name}</p>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Tab Panels for Each Folder */}
        {taxFolders.map((folder) => (
          <TabsContent value={folder.name} key={folder.name}>
            <div className="mt-12">
              {/* Display documents for each month */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {months2025.map((month, index) => (
                  <div
                    key={index}
                    className="border p-4 rounded-lg flex justify-between"
                  >
                    <div>
                      <h3 className="text-lg font-medium">{month}</h3>
                      <Image
                        src={`/templates/csv.png`}
                        alt={month}
                        width={30}
                        height={30}
                      />
                    </div>
                    <Button className="mt-4" variant="secondary">
                      <DownloadIcon className="w-5 h-5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default TaxFilingDocuments;
