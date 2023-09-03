import { UserBusiness } from "../../src/business/UserBusiness"
import { GetUserByIdInputDTO } from "../../src/dtos/user/getUserBy.dto"
import { USER_ROLES, UserModel } from "../../src/models/User"
import { HashManagerMock } from "../mocks/HashManagerMock"
import { IdGeneratorMock } from "../mocks/IdGeneratorMock"
import { TokenManagerMock } from "../mocks/TokenManagerMock"
import { UserDatabaseMock } from "../mocks/UserDatabaseMock"

const userBusiness = new UserBusiness(
    new UserDatabaseMock(),
    new IdGeneratorMock(),
    new TokenManagerMock(),
    new HashManagerMock()
  )


describe("Testando o getUserById", () => {

    test("Sucesso na busca", async () => {

        const input: GetUserByIdInputDTO = {
            id: "id-mock-fulano",
            token: "token-mock-astrodev"
        }

        const output = await userBusiness.getUserById(input)
        
        const result: UserModel = {
            id: "id-mock-fulano",
            name: "Fulano",
            email: "fulano@email.com",
            role: USER_ROLES.NORMAL,
            createdAt: expect.any(String)
        }

        expect(output).toEqual(result)
    })
})