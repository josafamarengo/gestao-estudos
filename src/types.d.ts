export interface Subject {
    id: number;
    name: string;
    number_of_questions: number;
    points_per_question: number;
    number_of_lessons: number;
}

type AlertType = "success" | "error";

export interface Alert {
    message: string
    type: AlertType 
}