export const formatSource = (source: string) => {
  return (
    source
      // Replace dot with space to treat nested paths like "salary.total"
      .replace(/\./g, " ")
      // Add space before capital letters (camelCase)
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      // Replace underscores with spaces
      .replace(/_/g, " ")
      // Collapse multiple spaces and trim
      .replace(/\s+/g, " ")
      .trim()
      // Capitalize each word
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  );
};
