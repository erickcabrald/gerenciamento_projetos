import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET as string;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in the environment variables');
}

/**
 * Gera um token JWT.
 * @param payload - Dados que deseja incluir no token.
 * @param expiresIn - Tempo de expiração do token (ex: "1h", "7d").
 * @returns Token JWT gerado.
 */
export function generateToken(
  payload: object,
  expiresIn: string = '7d'
): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

/**
 * Verifica e decodifica um token JWT.
 * @param token - Token JWT a ser verificado.
 * @returns Dados decodificados do token.
 * @throws Error se o token for inválido ou expirado.
 */
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}
