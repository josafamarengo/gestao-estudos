import { Alert as AlertType } from "../types";

interface Props extends AlertType {}

export const Alert = ({ message, type }: Props) => {
  return (
    <div className = {`error-message ${type === "error" ? "bg-red-400" : "bg-green-400"}`}>
        <div className="px-4 py-2">
            <div className="mx-3">
                <span className="font-semibold">{type === "error" ? "Erro" : "Sucesso"}</span>
                <p className="text-sm text-gray-600 dark:text-gray-200">{message}</p>
            </div>
        </div>
    </div>
  )
}
