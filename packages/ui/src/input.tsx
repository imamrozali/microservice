import * as React from "react";

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, label, error, ...props }, ref) => {
        const baseStyles = "flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";
        const errorStyles = error ? "border-red-500 focus-visible:ring-red-500" : "";

        return (
            <div className="w-full">
                {label && (
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                        {label}
                    </label>
                )}
                <input
                    type={type}
                    className={`${baseStyles} ${errorStyles} ${className || ""}`}
                    ref={ref}
                    {...props}
                />
                {error && (
                    <p className="text-red-500 text-sm mt-1">{error}</p>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";

export { Input };