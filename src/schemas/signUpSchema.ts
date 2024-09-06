import {z} from 'zod'

export const usernameValidation=z
.string()
.min(2, "username Must be Atleast 2 Character")
.max(20, "username no more than 20 character")
.regex(/^[a-zA-Z0-9_]+$/, "Username must not conatin Special Character")

export const signUpSchema=z.object({
      username: usernameValidation,
      email: z.string().email({message: 'invalid email address'}),
      password: z.string().min(6, {message: "password must be atleast 6 character"})
})

