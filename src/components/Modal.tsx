import { Check, X } from "lucide-react";
import type React from "react";
import { useTranslation } from "../i18n/I18nProvider";

interface ModalProps {
	isOpen: boolean;
	title: string;
	message: string;
	onConfirm: () => void;
	onCancel?: () => void;
	confirmText?: string;
	cancelText?: string;
}

export const Modal: React.FC<ModalProps> = ({
	isOpen,
	title,
	message,
	onConfirm,
	onCancel,
	confirmText,
	cancelText,
}) => {
	const { t } = useTranslation();

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm transition-opacity">
			<div className="fade-in zoom-in w-full max-w-sm animate-in overflow-hidden rounded-lg border border-overlay bg-surface shadow-xl duration-200">
				<div className="p-6">
					<h3 className="mb-2 font-bold text-lg text-main">{title}</h3>
					<p className="text-subtle">{message}</p>
				</div>
				<div className="flex flex-row-reverse space-x-2 space-x-reverse bg-overlay/50 px-6 py-4">
					<button
						onClick={onConfirm}
						className="flex items-center rounded bg-primary px-4 py-2 font-semibold text-white transition-all hover:opacity-90 active:scale-95"
						type="button"
					>
						<Check className="mr-1 h-4 w-4" />
						{confirmText ?? t("modal.confirm")}
					</button>
					{onCancel && (
						<button
							onClick={onCancel}
							className="flex items-center rounded border border-overlay bg-surface px-4 py-2 font-semibold text-main transition-all hover:bg-overlay active:scale-95"
							type="button"
						>
							<X className="mr-1 h-4 w-4" />
							{cancelText ?? t("modal.cancel")}
						</button>
					)}
				</div>
			</div>
		</div>
	);
};
