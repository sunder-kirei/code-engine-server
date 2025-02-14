export function extractToken(req: any) {
  const authHeader = req.headers.authorization;
  const cookie = req.cookies.token;
  let token: string | undefined = undefined;
  if (authHeader) {
    token = authHeader.split(" ")[1];
  }
  if (cookie) {
    token = cookie;
  }

  return token;
}
