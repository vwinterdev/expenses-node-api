import { db } from "@/db"
import { users } from "@/db/schema/users"
import { eq } from "drizzle-orm"

interface User {
    name: string
    email: string
    password: string
}

export const getUserByEmail = async (email: string) => {
    return await db.query.users.findFirst({
        where: eq(users.email, email),
    })
}

export const getUserById = async (id: number) => {
    return await db.query.users.findFirst({
        where: eq(users.id, id),
    })
}

export const createUser = async (user: User) => {
    const [ newUser ] = await db.insert(users).values(user).returning()
    return newUser
}

