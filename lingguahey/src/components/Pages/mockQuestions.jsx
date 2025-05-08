// mockQuestions.js
// Example mock data based on Swagger JSON structure

export const mockQuestions = [
    {
      questionId: 1,
      questionDescription: "Translate the following phrase:",
      questionText: "How are you?",
      questionImage: null,
      choices: [
        { choiceId: 11, choiceText: "Kamusta ka?", choiceOrder: 1, correct: true },
        { choiceId: 12, choiceText: "Magandang araw", choiceOrder: 2, correct: false },
        { choiceId: 13, choiceText: "Salamat", choiceOrder: 3, correct: false }
      ],
      score: { scoreId: 101, score: 10 }
    },
    {
      questionId: 2,
      questionDescription: null,
      questionText: "Dog",
      questionImage: null,
      choices: [
        { choiceId: 21, choiceText: "Aso", choiceOrder: 1, correct: true },
        { choiceId: 22, choiceText: "Pusa", choiceOrder: 2, correct: false },
        { choiceId: 23, choiceText: "Ibon", choiceOrder: 3, correct: false }
      ],
      score: { scoreId: 102, score: 5 }
    },
    {
      questionId: 3,
      questionDescription: null,
      questionText: null,
      questionImage: "https://via.placeholder.com/200?text=Bahay",
      choices: [
        { choiceId: 31, choiceText: "Bahay", choiceOrder: 1, correct: true },
        { choiceId: 32, choiceText: "Lamesa", choiceOrder: 2, correct: false },
        { choiceId: 33, choiceText: "Upuan", choiceOrder: 3, correct: false },
        { choiceId: 34, choiceText: "Pinto", choiceOrder: 4, correct: false }
      ],
      score: { scoreId: 103, score: 5 }
    }
  ];
  