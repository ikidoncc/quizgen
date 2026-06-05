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
			className="group inline-flex cursor-pointer select-none items-center"
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
					"flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 transition-all duration-150",
					"peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2",
					checked
						? "border-primary bg-primary"
						: "border-overlay bg-base group-hover:border-primary",
				)}
			>
				{checked && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
			</span>
		</label>
	);
};
