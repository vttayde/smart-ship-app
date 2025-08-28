/* eslint-disable @typescript-eslint/no-explicit-any */
declare module 'next-auth' {
  interface NextAuthOptions {
    providers?: any[];
    adapter?: any;
    session?: {
      strategy?: 'jwt' | 'database';
      maxAge?: number;
    };
    jwt?: {
      secret?: string;
      maxAge?: number;
    };
    callbacks?: {
      jwt?: (params: any) => any;
      session?: (params: any) => any;
      signIn?: (params: any) => any;
      redirect?: (params: any) => any;
      signOut?: (params: any) => any;
    };
    pages?: {
      signIn?: string;
      signOut?: string;
      error?: string;
      verifyRequest?: string;
      newUser?: string;
    };
    events?: {
      signIn?: (params: any) => any;
      signOut?: (params: any) => any;
    };
    debug?: boolean;
    secret?: string;
    useSecureCookies?: boolean;
    cookies?: any;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role?: string;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    role?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role?: string;
  }
}
