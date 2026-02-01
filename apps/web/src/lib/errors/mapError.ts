import { AppError } from '@/lib/errors/AppError';

function extractMissingEnvFromMessage(message: string): string[] {
  const matches = [...message.matchAll(/Environment variable not found:\s*([A-Z0-9_]+)/g)];
  return matches.map((m) => m[1]).filter(Boolean);
}

export function mapUnknownToAppError(error: unknown): AppError {
  if (error instanceof AppError) return error;

  const message =
    typeof (error as { message?: unknown })?.message === 'string' ? (error as { message: string }).message : '';

  const missingEnv = message ? extractMissingEnvFromMessage(message) : [];
  if (missingEnv.length) {
    return new AppError(5001, { meta: { missingEnv }, cause: error });
  }

  const isPrismaClientKnownRequestError =
    typeof (error as { name?: unknown })?.name === 'string' &&
    String((error as { name: string }).name).includes('Prisma');

  if (isPrismaClientKnownRequestError) {
    return new AppError(5002, { cause: error });
  }

  return new AppError(5000, { cause: error });
}

