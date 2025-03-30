// Mock quiz data to use when the API is unavailable
export const mockQuizData = [
  {
    id: "q1",
    text: "What is the capital city of France?",
    category: "Geography",
    difficulty: "easy" as const,
    options: [
      { id: "a1", text: "Paris", isCorrect: true },
      { id: "a2", text: "London", isCorrect: false },
      { id: "a3", text: "Berlin", isCorrect: false },
      { id: "a4", text: "Madrid", isCorrect: false },
    ],
  },
  {
    id: "q2",
    text: "Which planet is known as the Red Planet?",
    category: "Astronomy",
    difficulty: "medium" as const,
    options: [
      { id: "a1", text: "Venus", isCorrect: false },
      { id: "a2", text: "Mars", isCorrect: true },
      { id: "a3", text: "Jupiter", isCorrect: false },
      { id: "a4", text: "Saturn", isCorrect: false },
    ],
  },
  {
    id: "q3",
    text: "What is the chemical symbol for gold?",
    category: "Chemistry",
    difficulty: "medium" as const,
    options: [
      { id: "a1", text: "Go", isCorrect: false },
      { id: "a2", text: "Gd", isCorrect: false },
      { id: "a3", text: "Au", isCorrect: true },
      { id: "a4", text: "Ag", isCorrect: false },
    ],
  },
  {
    id: "q4",
    text: "Which programming language was created by Brendan Eich in 1995?",
    category: "Programming",
    difficulty: "medium" as const,
    options: [
      { id: "a1", text: "Java", isCorrect: false },
      { id: "a2", text: "JavaScript", isCorrect: true },
      { id: "a3", text: "Python", isCorrect: false },
      { id: "a4", text: "C++", isCorrect: false },
    ],
  },
  {
    id: "q5",
    text: "What is the largest mammal on Earth?",
    category: "Biology",
    difficulty: "easy" as const,
    options: [
      { id: "a1", text: "African Elephant", isCorrect: false },
      { id: "a2", text: "Blue Whale", isCorrect: true },
      { id: "a3", text: "Giraffe", isCorrect: false },
      { id: "a4", text: "Polar Bear", isCorrect: false },
    ],
  },
  {
    id: "q6",
    text: "What is the main function of the mitochondria in a cell?",
    category: "Biology",
    difficulty: "medium" as const,
    options: [
      { id: "a1", text: "Protein synthesis", isCorrect: false },
      { id: "a2", text: "Energy production", isCorrect: true },
      { id: "a3", text: "Cell division", isCorrect: false },
      { id: "a4", text: "Waste removal", isCorrect: false },
    ],
  },
  {
    id: "q7",
    text: "Which of these is NOT a JavaScript framework?",
    category: "Programming",
    difficulty: "easy" as const,
    options: [
      { id: "a1", text: "React", isCorrect: false },
      { id: "a2", text: "Angular", isCorrect: false },
      { id: "a3", text: "Vue", isCorrect: false },
      { id: "a4", text: "Pascal", isCorrect: true },
    ],
  },
  {
    id: "q8",
    text: "What is the capital of Japan?",
    category: "Geography",
    difficulty: "easy" as const,
    options: [
      { id: "a1", text: "Seoul", isCorrect: false },
      { id: "a2", text: "Beijing", isCorrect: false },
      { id: "a3", text: "Tokyo", isCorrect: true },
      { id: "a4", text: "Bangkok", isCorrect: false },
    ],
  },
  {
    id: "q9",
    text: "Which data structure operates on a Last-In-First-Out (LIFO) principle?",
    category: "Programming",
    difficulty: "medium" as const,
    options: [
      { id: "a1", text: "Queue", isCorrect: false },
      { id: "a2", text: "Stack", isCorrect: true },
      { id: "a3", text: "Linked List", isCorrect: false },
      { id: "a4", text: "Tree", isCorrect: false },
    ],
  },
  {
    id: "q10",
    text: "What is the largest ocean on Earth?",
    category: "Geography",
    difficulty: "easy" as const,
    options: [
      { id: "a1", text: "Atlantic Ocean", isCorrect: false },
      { id: "a2", text: "Indian Ocean", isCorrect: false },
      { id: "a3", text: "Arctic Ocean", isCorrect: false },
      { id: "a4", text: "Pacific Ocean", isCorrect: true },
    ],
  },
  {
    id: "q11",
    text: "Which of the following is a strongly typed programming language?",
    category: "Programming",
    difficulty: "hard" as const,
    options: [
      { id: "a1", text: "JavaScript", isCorrect: false },
      { id: "a2", text: "Python", isCorrect: false },
      { id: "a3", text: "TypeScript", isCorrect: true },
      { id: "a4", text: "Ruby", isCorrect: false },
    ],
  },
  {
    id: "q12",
    text: "What is the smallest prime number?",
    category: "Mathematics",
    difficulty: "easy" as const,
    options: [
      { id: "a1", text: "0", isCorrect: false },
      { id: "a2", text: "1", isCorrect: false },
      { id: "a3", text: "2", isCorrect: true },
      { id: "a4", text: "3", isCorrect: false },
    ],
  },
  {
    id: "q13",
    text: "What is the chemical formula for water?",
    category: "Chemistry",
    difficulty: "easy" as const,
    options: [
      { id: "a1", text: "H2O", isCorrect: true },
      { id: "a2", text: "CO2", isCorrect: false },
      { id: "a3", text: "NaCl", isCorrect: false },
      { id: "a4", text: "CH4", isCorrect: false },
    ],
  },
  {
    id: "q14",
    text: "Which of these is NOT a primary color in the RGB color model?",
    category: "Art",
    difficulty: "medium" as const,
    options: [
      { id: "a1", text: "Red", isCorrect: false },
      { id: "a2", text: "Green", isCorrect: false },
      { id: "a3", text: "Blue", isCorrect: false },
      { id: "a4", text: "Yellow", isCorrect: true },
    ],
  },
  {
    id: "q15",
    text: "What is the square root of 144?",
    category: "Mathematics",
    difficulty: "easy" as const,
    options: [
      { id: "a1", text: "12", isCorrect: true },
      { id: "a2", text: "14", isCorrect: false },
      { id: "a3", text: "10", isCorrect: false },
      { id: "a4", text: "16", isCorrect: false },
    ],
  },
  {
    id: "q16",
    text: "Which planet has the most moons?",
    category: "Astronomy",
    difficulty: "hard" as const,
    options: [
      { id: "a1", text: "Jupiter", isCorrect: false },
      { id: "a2", text: "Saturn", isCorrect: true },
      { id: "a3", text: "Uranus", isCorrect: false },
      { id: "a4", text: "Neptune", isCorrect: false },
    ],
  },
  {
    id: "q17",
    text: "What is the most abundant gas in Earth's atmosphere?",
    category: "Science",
    difficulty: "medium" as const,
    options: [
      { id: "a1", text: "Oxygen", isCorrect: false },
      { id: "a2", text: "Carbon Dioxide", isCorrect: false },
      { id: "a3", text: "Nitrogen", isCorrect: true },
      { id: "a4", text: "Hydrogen", isCorrect: false },
    ],
  },
  {
    id: "q18",
    text: "Which of these is NOT a JavaScript primitive type?",
    category: "Programming",
    difficulty: "medium" as const,
    options: [
      { id: "a1", text: "String", isCorrect: false },
      { id: "a2", text: "Number", isCorrect: false },
      { id: "a3", text: "Boolean", isCorrect: false },
      { id: "a4", text: "Array", isCorrect: true },
    ],
  },
  {
    id: "q19",
    text: "What is the capital of Australia?",
    category: "Geography",
    difficulty: "medium" as const,
    options: [
      { id: "a1", text: "Sydney", isCorrect: false },
      { id: "a2", text: "Melbourne", isCorrect: false },
      { id: "a3", text: "Canberra", isCorrect: true },
      { id: "a4", text: "Perth", isCorrect: false },
    ],
  },
  {
    id: "q20",
    text: "Which of these sorting algorithms has the best average time complexity?",
    category: "Programming",
    difficulty: "hard" as const,
    options: [
      { id: "a1", text: "Bubble Sort", isCorrect: false },
      { id: "a2", text: "Insertion Sort", isCorrect: false },
      { id: "a3", text: "Quick Sort", isCorrect: true },
      { id: "a4", text: "Selection Sort", isCorrect: false },
    ],
  },
  {
    id: "q21",
    text: "What is the largest organ in the human body?",
    category: "Biology",
    difficulty: "easy" as const,
    options: [
      { id: "a1", text: "Heart", isCorrect: false },
      { id: "a2", text: "Liver", isCorrect: false },
      { id: "a3", text: "Skin", isCorrect: true },
      { id: "a4", text: "Brain", isCorrect: false },
    ],
  },
  {
    id: "q22",
    text: "Which of these is NOT a React hook?",
    category: "Programming",
    difficulty: "medium" as const,
    options: [
      { id: "a1", text: "useState", isCorrect: false },
      { id: "a2", text: "useEffect", isCorrect: false },
      { id: "a3", text: "useContext", isCorrect: false },
      { id: "a4", text: "useHistory", isCorrect: true },
    ],
  },
  {
    id: "q23",
    text: "What is the value of π (pi) to two decimal places?",
    category: "Mathematics",
    difficulty: "easy" as const,
    options: [
      { id: "a1", text: "3.14", isCorrect: true },
      { id: "a2", text: "3.12", isCorrect: false },
      { id: "a3", text: "3.16", isCorrect: false },
      { id: "a4", text: "3.18", isCorrect: false },
    ],
  },
  {
    id: "q24",
    text: "Which of these is NOT a valid HTTP status code?",
    category: "Programming",
    difficulty: "hard" as const,
    options: [
      { id: "a1", text: "200 OK", isCorrect: false },
      { id: "a2", text: "404 Not Found", isCorrect: false },
      { id: "a3", text: "500 Internal Server Error", isCorrect: false },
      { id: "a4", text: "600 Server Timeout", isCorrect: true },
    ],
  },
  {
    id: "q25",
    text: "What is the tallest mountain in the world?",
    category: "Geography",
    difficulty: "easy" as const,
    options: [
      { id: "a1", text: "K2", isCorrect: false },
      { id: "a2", text: "Mount Everest", isCorrect: true },
      { id: "a3", text: "Kangchenjunga", isCorrect: false },
      { id: "a4", text: "Makalu", isCorrect: false },
    ],
  },
  {
    id: "q26",
    text: "Which of these is NOT a feature of TypeScript?",
    category: "Programming",
    difficulty: "medium" as const,
    options: [
      { id: "a1", text: "Static typing", isCorrect: false },
      { id: "a2", text: "Interfaces", isCorrect: false },
      { id: "a3", text: "Generics", isCorrect: false },
      { id: "a4", text: "Built-in DOM manipulation", isCorrect: true },
    ],
  },
  {
    id: "q27",
    text: "What is the chemical symbol for silver?",
    category: "Chemistry",
    difficulty: "medium" as const,
    options: [
      { id: "a1", text: "Si", isCorrect: false },
      { id: "a2", text: "Sv", isCorrect: false },
      { id: "a3", text: "Ag", isCorrect: true },
      { id: "a4", text: "Sr", isCorrect: false },
    ],
  },
  {
    id: "q28",
    text: "Which of these is NOT a principle of object-oriented programming?",
    category: "Programming",
    difficulty: "hard" as const,
    options: [
      { id: "a1", text: "Encapsulation", isCorrect: false },
      { id: "a2", text: "Inheritance", isCorrect: false },
      { id: "a3", text: "Polymorphism", isCorrect: false },
      { id: "a4", text: "Fragmentation", isCorrect: true },
    ],
  },
  {
    id: "q29",
    text: "What is the smallest country in the world by land area?",
    category: "Geography",
    difficulty: "medium" as const,
    options: [
      { id: "a1", text: "Monaco", isCorrect: false },
      { id: "a2", text: "Vatican City", isCorrect: true },
      { id: "a3", text: "San Marino", isCorrect: false },
      { id: "a4", text: "Liechtenstein", isCorrect: false },
    ],
  },
  {
    id: "q30",
    text: "Which of these is NOT a valid JavaScript variable name?",
    category: "Programming",
    difficulty: "easy" as const,
    options: [
      { id: "a1", text: "myVar", isCorrect: false },
      { id: "a2", text: "_privateVar", isCorrect: false },
      { id: "a3", text: "$specialVar", isCorrect: false },
      { id: "a4", text: "123var", isCorrect: true },
    ],
  },
];

// Function to get mock questions based on subject and count
export const getMockQuestions = (subject: string, count: number = 5) => {
  // Filter by subject if it matches any category, otherwise return all
  const filteredQuestions = mockQuizData.filter(
    (q) =>
      q.category.toLowerCase().includes(subject.toLowerCase()) ||
      subject === "",
  );

  // If we have enough questions after filtering, return the requested count
  if (filteredQuestions.length >= count) {
    return filteredQuestions.slice(0, count);
  }

  // Otherwise return all available questions
  return mockQuizData.slice(0, count);
};
