import { Check } from "lucide-react";
import type React from "react";
import { cn } from "../utils/cn";

interface CheckboxProps {
	checked: boolean;
	onChange: (checked: boolean) => void;
	id?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
	checked,
	onChange,
	id,
}) => {
	return (
		<label
			htmlFor={id}
			className="inline-flex items-center cursor-pointer select-none group"
		>
			<input
				id={id}
				type="checkbox"
				checked={checked}
				onChange={(e) => onChange(e.target.checked)}
				className="peer sr-only"
			/>
			<span
				className={cn(
					"flex items-center justify-center w-4 h-4 rounded border-2 transition-all duration-150 shrink-0",
					"peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2",
					checked
						? "bg-primary border-primary"
						: "bg-base border-overlay group-hover:border-primary",
				)}
			>
				{checked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
			</span>
		</label>
	);
};
