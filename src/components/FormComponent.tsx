interface InputField {
    name: string;
    type: string;
    step?: string | number;
    placeholder: string;
}

interface FormProps {
    inputs: InputField[];
    formData: Record<string, string | number>;
    onChange: (e: Event) => void;
    onSubmit: (e: Event) => void;
}

export function FormComponent({ inputs, formData, onChange, onSubmit }: Readonly<FormProps>) {
    return (
        <form onSubmit={onSubmit}>
            {inputs.map(input => (
                <input
                    key={input.name}
                    type={input.type}
                    step={input.step}
                    name={input.name}
                    placeholder={input.placeholder}
                    value={formData[input.name]}
                    onInput={onChange}
                />
            ))}
            <button type="submit">Adicionar Disciplina</button>
        </form>
    );
}
