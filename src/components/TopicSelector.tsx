import React, { useState } from "react";
import {
  Search,
  BookOpen,
  Code,
  Database, // Added for Databases
  Network, // Added for Networking
  Terminal, // Added for Linux
  Cloud, // Added for Cloud Native
  Globe, // Added for General Knowledge
} from "lucide-react";
import { Input } from "./ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";

interface TopicSelectorProps { // Renamed interface
  onTopicSelect?: (topic: string) => void; // Renamed prop
  popularTopics?: Array<{ // Renamed prop
    id: string;
    name: string;
    icon: React.ReactNode;
    description: string;
  }>;
}

const TopicSelector = ({ // Renamed component
  onTopicSelect = () => {}, // Renamed prop
  popularTopics = [ // Renamed prop
    {
      id: "programming",
      name: "Programming",
      icon: <Code className="h-6 w-6" />,
      description: "Test your coding knowledge across various languages and concepts.",
    },
    {
      id: "databases",
      name: "Databases",
      icon: <Database className="h-6 w-6" />,
      description: "Explore SQL, NoSQL, database design, and administration.",
    },
    {
      id: "networking",
      name: "Networking",
      icon: <Network className="h-6 w-6" />,
      description: "Understand network protocols, topologies, and security.",
    },
    {
      id: "linux",
      name: "Linux",
      icon: <Terminal className="h-6 w-6" />,
      description: "Master the command line, system administration, and scripting.",
    },
    {
      id: "cloud-native",
      name: "Cloud Native",
      icon: <Cloud className="h-6 w-6" />,
      description: "Learn about containers, orchestration, and cloud platforms.",
    },
    {
      id: "general-knowledge",
      name: "General Knowledge",
      icon: <Globe className="h-6 w-6" />,
      description: "Broaden your horizons with quizzes on diverse topics.",
    },
  ],
}: TopicSelectorProps) => { // Use renamed interface
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null); // Renamed state variable

  const handleTopicSelect = (topicId: string) => { // Renamed handler
    setSelectedTopic(topicId); // Use renamed state setter
    onTopicSelect(topicId); // Use renamed prop
  };

  const filteredTopics = popularTopics.filter((topic) => // Renamed variable, use renamed prop
    topic.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="w-full max-w-7xl mx-auto bg-card p-6 rounded-xl shadow-sm">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Select a Topic</h2> {/* Renamed text */}
        <p className="text-muted-foreground">
          Choose a topic area to test your knowledge {/* Updated text */}
        </p>
      </div>

      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <Input
          type="text"
          placeholder="Search for a topic..." // Renamed placeholder
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {filteredTopics.length === 0 ? ( // Use renamed variable
        <div className="text-center py-8">
          <p className="text-gray-500">
            No topics found matching your search. {/* Renamed text */}
          </p>
          <p className="text-gray-500 mt-2">
            Try a different search term or browse the popular topics below. {/* Renamed text */}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTopics.map((topic) => ( // Use renamed variable
            <Card
              key={topic.id} // Use topic.id
              className={`cursor-pointer transition-all hover:shadow-md ${selectedTopic === topic.id ? "ring-2 ring-primary" : ""}`} // Use renamed state variable
              onClick={() => handleTopicSelect(topic.id)} // Use renamed handler
            >
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/10 text-primary">
                    {topic.icon} {/* Use topic.icon */}
                  </div>
                  <CardTitle>{topic.name}</CardTitle> {/* Use topic.name */}
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{topic.description}</CardDescription> {/* Use topic.description */}
              </CardContent>
              <CardFooter>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTopicSelect(topic.id); // Use renamed handler
                  }}
                >
                  Select
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {searchQuery && filteredTopics.length > 0 && ( // Use renamed variable
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Don't see what you're looking for?
          </p>
          <Button
            variant="outline"
            className="mt-2"
            onClick={() => handleTopicSelect(searchQuery)} // Use renamed handler
          >
            Create custom quiz on "{searchQuery}" {/* Text remains the same */}
          </Button>
        </div>
      )}
    </div>
  );
};

export default TopicSelector; // Renamed export
