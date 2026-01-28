export type SelectOption = { id: string; name: string };

export type CreateAnnouncementElements = {
  categories: SelectOption[];
  departments: SelectOption[];
  locations: SelectOption[];
};
