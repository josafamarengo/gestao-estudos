import { useState } from "preact/hooks";
import { invoke } from "@tauri-apps/api/core";

import { inputsAddSubject } from "../config/config";
import { Subject, Alert } from "../types";

import { FormComponent } from "../components/FormComponent";
import { Link } from "wouter";
import { Alert as AlertComponent } from "../components/Alert";

export const AddSubject = () => {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [name, setName] = useState("");
    const [numberOfQuestions, setNumberOfQuestions] = useState(0);
    const [pointsPerQuestion, setPointsPerQuestion] = useState(0.0);

    const [alert, setAlert] = useState<Alert|null>(null);

    const [formData, setFormData] = useState<Record<string, string | number>>({
        name: "",
        number_of_questions: 0,
        points_per_question: 0.0,
    });

    const handleChange = (e: Event) => {
        const { name, value, type } = e.target as HTMLInputElement;
        setFormData(prev => ({
            ...prev,
            [name]: type === "number" ? parseFloat(value) || 0 : value,
        }));

        switch (name) {
            case "name":
                setName(value);
                break;
            case "number_of_questions":
                setNumberOfQuestions(Number(value));
                break;
            case "points_per_question":
                setPointsPerQuestion(Number(value));
                break;
            default:
                return;
        }
    };

    const handleSubmit = async (e: Event) => {
        e.preventDefault();

        console.log(formData);

        try {
            if (name.length < 3) throw new Error("Nome deve ter ao menos 3 caracteres");
            if (numberOfQuestions <= 0) throw new Error("Deve ter pelo menos uma questão");
            if (pointsPerQuestion < 0.1) throw new Error("Pontos por questão inválidos");

            await invoke("insert_subject", {
                name,
                numberOfQuestions,
                pointsPerQuestion,
            });

            setSubjects(prevSubjects => [
                ...prevSubjects,
                {
                    id: Date.now(),
                    name,
                    number_of_questions: numberOfQuestions,
                    points_per_question: pointsPerQuestion,
                    number_of_lessons: 0,
                },
            ]);

            const sucesso: Alert = {
                message: "Matéria adicionada com sucesso",
                type: "success"
            }

            setAlert(sucesso)

            setName("");
            setNumberOfQuestions(0);
            setPointsPerQuestion(0.0);
        } catch (error) {
            console.error("Erro ao adicionar disciplina: " + error);

            let message = "Erro desconhecido";

            if (typeof error === "string") {
                message = error;
            } else if (error instanceof Error) {
                message = error.message;
            }

            const erro: Alert = {
                message: message ,
                type: "error"
            }

            setAlert(erro);
            setTimeout(() => setAlert(null), 5000)
        }
    };
    
    return (
        <div>
            <Link href={"/"}>Voltar para Home</Link>
            <FormComponent
                inputs={inputsAddSubject}
                formData={formData}
                onChange={handleChange}
                onSubmit={handleSubmit}
            />

            {alert && (
                <AlertComponent message={alert.message} type={alert.type}/>
            )}
        </div>
    )
}
