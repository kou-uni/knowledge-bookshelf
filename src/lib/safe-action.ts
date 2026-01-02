import { z } from 'zod';

export type ActionState<T> = {
    success: boolean;
    data?: T;
    error?: string;
    fieldErrors?: Record<string, string[]>;
}

export function createSafeAction<TInput, TOutput>(
    schema: z.Schema<TInput>,
    handler: (validatedData: TInput) => Promise<TOutput>
) {
    return async (rawInput: TInput): Promise<ActionState<TOutput>> => {
        try {
            const validationResult = schema.safeParse(rawInput);
            if (!validationResult.success) {
                return {
                    success: false,
                    fieldErrors: validationResult.error.flatten().fieldErrors as Record<string, string[]>,
                    error: "Validation Error"
                };
            }

            const data = await handler(validationResult.data);
            return {
                success: true,
                data
            };
        } catch (error: any) {
            console.error("Server Action Error:", error);
            return {
                success: false,
                error: error.message || "Something went wrong"
            };
        }
    };
}
