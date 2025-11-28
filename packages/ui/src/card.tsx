import * as React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={`rounded-lg border border-gray-200 bg-white shadow-sm ${className || ""}`}
                {...props}
            >
                {children}
            </div>
        );
    }
);

const CardHeader = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={`flex flex-col space-y-1.5 p-6 ${className || ""}`}
                {...props}
            >
                {children}
            </div>
        );
    }
);

const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
    ({ className, children, ...props }, ref) => {
        return (
            <h3
                ref={ref}
                className={`text-lg font-semibold leading-none tracking-tight ${className || ""}`}
                {...props}
            >
                {children}
            </h3>
        );
    }
);

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
    ({ className, children, ...props }, ref) => {
        return (
            <p
                ref={ref}
                className={`text-sm text-gray-600 ${className || ""}`}
                {...props}
            >
                {children}
            </p>
        );
    }
);

const CardContent = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={`p-6 pt-0 ${className || ""}`}
                {...props}
            >
                {children}
            </div>
        );
    }
);

const CardFooter = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={`flex items-center p-6 pt-0 ${className || ""}`}
                {...props}
            >
                {children}
            </div>
        );
    }
);

Card.displayName = "Card";
CardHeader.displayName = "CardHeader";
CardTitle.displayName = "CardTitle";
CardDescription.displayName = "CardDescription";
CardContent.displayName = "CardContent";
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };