import { useState, useEffect } from "preact/hooks";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";

interface Subject {
  id: number;
  name: string;
  number_of_questions: number;
  points_per_question: number;
  number_of_lessons: number;
}

function App() {
  const [name, setName] = useState("");
  const [numberOfQuestions, setNumberOfQuestions] = useState(0);
  const [pointsPerQuestion, setPointsPerQuestion] = useState(0.0);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();

    console.log({ name, numberOfQuestions, pointsPerQuestion });

    try {
      await invoke("insert_subject", {
        name,
        numberOfQuestions,
        pointsPerQuestion,
      });

      setSubjects((prevSubjects) => [
        ...prevSubjects,
        {
          id: Date.now(), // Ou outro identificador único que você tenha no banco
          name,
          number_of_questions: numberOfQuestions,
          points_per_question: pointsPerQuestion,
          number_of_lessons: 0, // Inicialize com 0 ou o valor correto
        },
      ]);

      setName("");
      setNumberOfQuestions(0);
      setPointsPerQuestion(0.0);
    } catch (error) {
      console.error("Erro ao adicionar disciplina: " + error);
    }
  };

  useEffect(() => {
    const fetchSubjects = async () => {
      const data = await invoke<Subject[]>("get_all_subjects");
      setSubjects(data);
    };

    fetchSubjects();
  }, []);

  return (
    <main class="container">
      <h1>Gestão de Estudos</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nome da Disciplina"
          value={name}
          onInput={(e) => setName((e.target as HTMLInputElement).value)}
        />
        <input
          type="number"
          placeholder="Número de Questões"
          value={numberOfQuestions}
          onInput={(e) => setNumberOfQuestions(parseInt((e.target as HTMLInputElement).value))}
        />
        <input
          type="number"
          step="0.1"
          placeholder="Pontos por Questão"
          value={pointsPerQuestion}
          onInput={(e) => setPointsPerQuestion(parseFloat((e.target as HTMLInputElement).value))}
        />
        <button type="submit">Adicionar Disciplina</button>
      </form>

      <div>
        <h1>Lista de Disciplinas</h1>
        <ul>
          {subjects.map((subject) => (
            <li key={subject.id}>
              {subject.name} - {subject.number_of_lessons} aulas
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}

export default App;
