import React, { useState } from "react";
import {
  Search,
  BookOpen,
  Code,
  Brain,
  Dumbbell,
  Microscope,
  Music,
  Palette,
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

interface SubjectSelectorProps {
  onSubjectSelect?: (subject: string) => void;
  popularSubjects?: Array<{
    id: string;
    name: string;
    icon: React.ReactNode;
    description: string;
  }>;
}

const SubjectSelector = ({
  onSubjectSelect = () => {},
  popularSubjects = [
    {
      id: "programming",
      name: "Programming",
      icon: <Code className="h-6 w-6" />,
      description:
        "Test your coding knowledge across various languages and concepts",
    },
    {
      id: "science",
      name: "Science",
      icon: <Microscope className="h-6 w-6" />,
      description: "Explore topics in physics, chemistry, biology and more",
    },
    {
      id: "mathematics",
      name: "Mathematics",
      icon: <Brain className="h-6 w-6" />,
      description: "Challenge yourself with problems from algebra to calculus",
    },
    {
      id: "literature",
      name: "Literature",
      icon: <BookOpen className="h-6 w-6" />,
      description: "Test your knowledge of classic and contemporary works",
    },
    {
      id: "fitness",
      name: "Fitness & Health",
      icon: <Dumbbell className="h-6 w-6" />,
      description: "Learn about exercise, nutrition, and wellness",
    },
    {
      id: "arts",
      name: "Arts & Music",
      icon: <Palette className="h-6 w-6" />,
      description: "Explore visual arts, music theory, and artistic movements",
    },
  ],
}: SubjectSelectorProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  const handleSubjectSelect = (subjectId: string) => {
    setSelectedSubject(subjectId);
    onSubjectSelect(subjectId);
  };

  const filteredSubjects = popularSubjects.filter((subject) =>
    subject.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="w-full max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-sm">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Select a Subject</h2>
        <p className="text-gray-600">
          Choose a subject area to test your knowledge
        </p>
      </div>

      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <Input
          type="text"
          placeholder="Search for a subject..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {filteredSubjects.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">
            No subjects found matching your search.
          </p>
          <p className="text-gray-500 mt-2">
            Try a different search term or browse the popular subjects below.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSubjects.map((subject) => (
            <Card
              key={subject.id}
              className={`cursor-pointer transition-all hover:shadow-md ${selectedSubject === subject.id ? "ring-2 ring-primary" : ""}`}
              onClick={() => handleSubjectSelect(subject.id)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/10 text-primary">
                    {subject.icon}
                  </div>
                  <CardTitle>{subject.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{subject.description}</CardDescription>
              </CardContent>
              <CardFooter>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSubjectSelect(subject.id);
                  }}
                >
                  Select
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {searchQuery && filteredSubjects.length > 0 && (
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Don't see what you're looking for?
          </p>
          <Button
            variant="outline"
            className="mt-2"
            onClick={() => handleSubjectSelect(searchQuery)}
          >
            Create custom quiz on "{searchQuery}"
          </Button>
        </div>
      )}
    </div>
  );
};

export default SubjectSelector;
