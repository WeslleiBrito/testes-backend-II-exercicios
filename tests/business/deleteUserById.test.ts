import { UserBusiness } from "../../src/business/UserBusiness"
import { DeleteInputUserByIdDTO } from "../../src/dtos/user/deleteUser.dto"
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

describe("Testando o delete", () => {
  

  test("Teste de confimação de deleção com sucesso", async () => {
    const input: DeleteInputUserByIdDTO = {
        token: "token-mock-fulano",
        id: "id-mock-fulano",
        password: "fulano123"
    }
    const output = await userBusiness.deleteUserById(input)
    
    expect(output).toEqual({ message: "O usuário 'Fulano', foi deletado com sucesso!" })
  })

})