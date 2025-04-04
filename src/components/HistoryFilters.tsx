import React, { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Search, SlidersHorizontal, X } from "lucide-react";

interface HistoryFiltersProps {
  onFilterChange?: (filters: {
    search: string;
    topic: string; // Renamed from subject
    sortBy: string;
    dateRange: string;
  }) => void;
}

const HistoryFilters = ({ onFilterChange = () => {} }: HistoryFiltersProps) => {
  const [filters, setFilters] = useState({
    search: "",
    topic: "all", // Renamed from subject
    sortBy: "newest",
    dateRange: "all-time",
  });

  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleClearFilters = () => {
    const defaultFilters = {
      search: "",
      topic: "all", // Renamed from subject
      sortBy: "newest",
      dateRange: "all-time",
    };
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  // Renamed from subjects
  const topics = [
    { value: "all", label: "All Topics" }, // Updated label
    { value: "math", label: "Mathematics" },
    { value: "science", label: "Science" },
    { value: "history", label: "History" },
    { value: "language", label: "Language" },
    { value: "programming", label: "Programming" },
  ];

  const sortOptions = [
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "highest", label: "Highest Score" },
    { value: "lowest", label: "Lowest Score" },
  ];

  const dateRanges = [
    { value: "all-time", label: "All Time" },
    { value: "today", label: "Today" },
    { value: "this-week", label: "This Week" },
    { value: "this-month", label: "This Month" },
    { value: "this-year", label: "This Year" },
  ];

  return (
    <div className="w-full bg-card p-4 rounded-lg shadow-sm border border-border"> {/* Replaced bg-white, border-gray-100 */}
      <div className="flex flex-col gap-4">
        {/* Search and Filter Toggle Row */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" /> {/* Use theme color */}
            <Input
              placeholder="Search quiz history..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="pl-9"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
            className="relative"
          >
            <SlidersHorizontal className="h-4 w-4" />
            {Object.values(filters).some(
              (value, index) =>
                index > 0 && // Skip search
                value !== topics[0].value && // Check against topics array
                value !== sortOptions[0].value &&
                value !== dateRanges[0].value,
            ) && (
              <span className="absolute -top-1 -right-1 h-2 w-2 bg-primary rounded-full" /> // Use theme color
            )}
          </Button>
        </div>

        {/* Expanded Filters */}
        {isFiltersExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Topic</label> {/* Changed label */}
              <Select
                value={filters.topic} // Use topic filter state
                onValueChange={(value) => handleFilterChange("topic", value)} // Use topic key
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select topic" /> {/* Changed placeholder */}
                </SelectTrigger>
                <SelectContent>
                  {topics.map((topic) => ( // Use topics array
                    <SelectItem key={topic.value} value={topic.value}>
                      {topic.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Sort By</label> {/* Use theme color */}
              <Select
                value={filters.sortBy}
                onValueChange={(value) => handleFilterChange("sortBy", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Date Range</label> {/* Use theme color */}
              <Select
                value={filters.dateRange}
                onValueChange={(value) =>
                  handleFilterChange("dateRange", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  {dateRanges.map((range) => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-3 flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="flex items-center gap-1"
              >
                <X className="h-3 w-3" /> Clear Filters
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryFilters;
