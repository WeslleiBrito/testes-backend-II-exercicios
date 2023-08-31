import z from 'zod'

export interface DeleteInputUserByIdDTO {
    token: string,
    id: string,
    password?: string
}

export interface DeleteOutputDTO {
    message: string
}

export const DeleteInputUserByIdSchema = z.object(
    {
        token: z.string({required_error: "É obrigatório informar o token do usuário.", invalid_type_error: "O token deve ser uma string."})
                .min(1, {message: "O token veio vazio."}),
        id: z.string({required_error: "É preciso o id do usuária para processeguir com a requisição.", invalid_type_error: "O id precisa ser uma string."})
            .min(1, {message: "O id veio vazio."}),
        password: z.string({invalid_type_error: "O password deve ser uma string."}).min(1, {message: "O password veio vazio."}).optional()        
    }
).transform(data => data as DeleteInputUserByIdDTO)