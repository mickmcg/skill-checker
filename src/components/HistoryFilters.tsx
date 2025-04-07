import React, { useState } from "react"; // Keep useState for isFiltersExpanded
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

// Define the structure of the filters object passed from the parent
interface FilterValues {
  search: string;
  topic: string;
  sortBy: string;
  dateRange: string;
  // Note: difficulty is managed by the parent's activeTab, not directly here
}

interface HistoryFiltersProps {
  currentFilters: FilterValues; // Receive current filters from parent
  onFilterChange?: (filters: Partial<FilterValues>) => void; // Allow partial updates
}

const HistoryFilters = ({
  currentFilters,
  onFilterChange = () => {},
}: HistoryFiltersProps) => {
  // Remove internal state for filters
  // const [filters, setFilters] = useState({ ... });

  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);

  // Update handler to call onFilterChange with only the changed value
  const handleFilterChange = (key: keyof FilterValues, value: string) => {
    // Call parent's handler with the specific change
    onFilterChange({ [key]: value });
  };

  // Update clear handler to call onFilterChange with default values for relevant fields
  const handleClearFilters = () => {
    onFilterChange({
      search: "",
      topic: "all",
      sortBy: "newest",
      dateRange: "all-time",
    });
  };

  // Use topics from TopicSelector.tsx
  const topics = [
    { value: "all", label: "All Topics" },
    { value: "programming", label: "Programming" },
    { value: "databases", label: "Databases" },
    { value: "networking", label: "Networking" },
    { value: "linux", label: "Linux" },
    { value: "cloud-native", label: "Cloud Native" },
    { value: "general-knowledge", label: "General Knowledge" },
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
              value={currentFilters.search} // Use prop value
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="pl-9"
            />
          </div>
          {/* Correctly wrap the Button element */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
            className="relative"
          >
            <SlidersHorizontal className="h-4 w-4" />
            {/* Check against currentFilters prop */}
            {Object.entries(currentFilters).some(
              ([key, value]) =>
                key !== 'search' && // Skip search
                value !== topics[0].value && // Check against default topic
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
              <label className="text-sm font-medium text-foreground">Topic</label>
              <Select
                value={currentFilters.topic} // Use prop value
                onValueChange={(value) => handleFilterChange("topic", value)}
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
              <label className="text-sm font-medium text-foreground">Sort By</label>
              <Select
                value={currentFilters.sortBy} // Use prop value
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
              <label className="text-sm font-medium text-foreground">Date Range</label>
              <Select
                value={currentFilters.dateRange} // Use prop value
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
