import { UserDatabase } from "../database/UserDatabase"
import { DeleteInputUserByIdDTO, DeleteOutputDTO } from "../dtos/user/deleteUser.dto"
import { GetUserByIdInputDTO } from "../dtos/user/getUserBy.dto"
import { GetUsersInputDTO, GetUsersOutputDTO } from "../dtos/user/getUsers.dto"
import { LoginInputDTO, LoginOutputDTO } from "../dtos/user/login.dto"
import { SignupInputDTO, SignupOutputDTO } from "../dtos/user/signup.dto"
import { BadRequestError } from "../errors/BadRequestError"
import { NotFoundError } from "../errors/NotFoundError"
import { TokenPayload, USER_ROLES, User, UserModel } from "../models/User"
import { HashManager } from "../services/HashManager"
import { IdGenerator } from "../services/IdGenerator"
import { TokenManager } from "../services/TokenManager"

export class UserBusiness implements UserBusinessInterface{
  constructor(
    private userDatabase: UserDatabase,
    private idGenerator: IdGenerator,
    private tokenManager: TokenManager,
    private hashManager: HashManager
  ) { }

  public getUsers = async (
    input: GetUsersInputDTO
  ): Promise<GetUsersOutputDTO> => {
    const { q, token } = input

    const payload = this.tokenManager.getPayload(token)

    if (payload === null) {
        throw new BadRequestError("token inválido")
    } 

    if (payload.role !== USER_ROLES.ADMIN) {
      throw new BadRequestError("somente admins podem acessar")
    }

    const usersDB = await this.userDatabase.findUsers(q)

    const users = usersDB.map((userDB) => {
      const user = new User(
        userDB.id,
        userDB.name,
        userDB.email,
        userDB.password,
        userDB.role,
        userDB.created_at
      )

      return user.toBusinessModel()
    })

    const output: GetUsersOutputDTO = users

    return output
  }

  public getUserById = async (input: GetUserByIdInputDTO): Promise<UserModel> => {
    const {id, token} = input

    const tokenIsvalid = this.tokenManager.getPayload(token)

    if(!tokenIsvalid){
      throw new BadRequestError("Token inválido")
    }

    if(tokenIsvalid.role === USER_ROLES.NORMAL){
      throw new BadRequestError("Usuários noramis não tem acesso a essa ferramenta.")
    }

    const [userExist] = await this.userDatabase.findUsers(id)

    if(!userExist){
      throw new NotFoundError("Usuário não encontrado.")
    }

    const newUser = new User(
      userExist.id,
      userExist.name,
      userExist.email,
      userExist.password,
      userExist.role,
      userExist.created_at
    )

    return newUser.toBusinessModel()
  }

  public signup = async (
    input: SignupInputDTO
  ): Promise<SignupOutputDTO> => {
    const { name, email, password } = input

    const id = this.idGenerator.generate()
    const hashedPassword = await this.hashManager.hash(password)

    const newUser = new User(
      id,
      name,
      email,
      hashedPassword,
      USER_ROLES.NORMAL,
      new Date().toISOString()
    )

    const newUserDB = newUser.toDBModel()
    await this.userDatabase.insertUser(newUserDB)

    const tokenPayload: TokenPayload = {
      id: newUser.getId(),
      name: newUser.getName(),
      role: newUser.getRole()
    }

    const token = this.tokenManager.createToken(tokenPayload)

    const output: SignupOutputDTO = {
      message: "Cadastro realizado com sucesso",
      token: token
    }

    return output
  }

  public login = async (
    input: LoginInputDTO
  ): Promise<LoginOutputDTO> => {
    const { email, password } = input

    const userDB = await this.userDatabase.findUserByEmail(email)

    if (!userDB) {
      throw new NotFoundError("'email' não encontrado")
    }

    const hashedPassword = userDB.password

    const isPasswordCorrect = await this.hashManager.compare(password, hashedPassword)

    if (!isPasswordCorrect) {
      throw new BadRequestError("'email' ou 'password' incorretos")
    }

    const user = new User(
      userDB.id,
      userDB.name,
      userDB.email,
      userDB.password,
      userDB.role,
      userDB.created_at
    )

    const tokenPayload: TokenPayload = {
      id: user.getId(),
      name: user.getName(),
      role: user.getRole()
    }

    const token = this.tokenManager.createToken(tokenPayload)

    const output: LoginOutputDTO = {
      message: "Login realizado com sucesso",
      token: token
    }

    return output
  }

  public deleteUserById = async (input: DeleteInputUserByIdDTO): Promise<DeleteOutputDTO> => {

    const {id, token, password} = input

    const tokenIsValid = this.tokenManager.getPayload(token)

    if(!tokenIsValid){
      throw new BadRequestError("Token inválido.")
    }
    
    const userExist = await this.userDatabase.findUserById(id)

    if(!userExist){
      throw new NotFoundError("Usuário não localizado.")
    }

    if(tokenIsValid.role === USER_ROLES.NORMAL){
      
      const passwordIsValid = await this.hashManager.compare(password ? password : "", userExist.password)

      if(!passwordIsValid){
        throw new BadRequestError("Senha inválida")
      }

      if(tokenIsValid.id !== id){
        throw new BadRequestError("Usuário NORMAL não tem permissão para deletar outro usuário.")
      }
    }else if(tokenIsValid.role === USER_ROLES.ADMIN){

      if(tokenIsValid.role === userExist.role && tokenIsValid.id !== userExist.id){
        throw new BadRequestError("Usuário 'ADMIN' pode deletar sua própria conta ou a conta de um usuário 'NORMAL'.")
      }

      const passwordIsValid = await this.hashManager.compare(password ? password : "", userExist.password)

      if(!passwordIsValid && userExist.role === USER_ROLES.ADMIN){
        throw new BadRequestError("Senha inválida.")
      }

    }else {

      const passwordIsValid = await this.hashManager.compare(password ? password : "", userExist.password)

      if(!passwordIsValid && userExist.role === USER_ROLES.MASTER){
        throw new BadRequestError("Senha inválida.")
      }

    }

    await this.userDatabase.deleteUserById(id)
    
    return {
      message: `O usuário '${userExist.name}', foi deletado com sucesso!`
    }
  }
}


export interface UserBusinessInterface {

  getUsers(input: GetUsersInputDTO): Promise<GetUsersOutputDTO>;
  signup(input: SignupInputDTO): Promise<SignupOutputDTO>;
  login(input: LoginInputDTO): Promise<LoginOutputDTO>;
  deleteUserById(input: DeleteInputUserByIdDTO): Promise<DeleteOutputDTO>;
  getUserById(input: GetUserByIdInputDTO): Promise<UserModel>;
}