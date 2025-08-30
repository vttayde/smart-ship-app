import { authOptions } from '@/lib/auth';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const NextAuth = require('next-auth').default || require('next-auth');

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
