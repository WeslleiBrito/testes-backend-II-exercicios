import z from 'zod'

export interface GetUserByIdInputDTO {
    id: string
    token: string
}


export const InputGetUserByIdSchema = z.object(
    {
        id: z.string({invalid_type_error: "O id deve ser uma string.", required_error: "O id é obrigatório."}).min(1, {message: "O id veio vazio"}),
        token: z.string({invalid_type_error: "O token deve ser uma string.", required_error: "O token é obrigatório."}).min(1, {message: "O id veio vazio"})
    }
).transform(data => data as GetUserByIdInputDTO)