import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
    interface ViewUser {
        id: string;
        role: string;
        biometricEnabled: boolean;
    }
    interface Session {
        user: {
            id: string;
            role: string;
            biometricEnabled: boolean;
        } & DefaultSession["user"];
    }

    interface User {
        id: string;
        role: string;
        biometricEnabled: boolean;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        role: string;
        biometricEnabled: boolean;
    }
}
