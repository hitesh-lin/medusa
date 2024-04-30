import { createAdminUser } from "../../../helpers/create-admin-user"
import { medusaIntegrationTestRunner } from "medusa-test-utils"

jest.setTimeout(50000)

const env = { MEDUSA_FF_MEDUSA_V2: true }
const adminHeaders = {
  headers: { "x-medusa-access-token": "test_token" },
}

medusaIntegrationTestRunner({
  env,
  testSuite: ({ dbConnection, getContainer, api }) => {
    describe("POST /admin/users", () => {
      beforeEach(async () => {
        await createAdminUser(dbConnection, adminHeaders, getContainer())
      })

      it("create a user", async () => {
        const body = {
          email: "test_member@test.com",
        }

        const response = await api.post(`/admin/users`, body, adminHeaders)

        expect(response.status).toEqual(200)
        expect(response.data).toEqual({
          user: expect.objectContaining(body),
        })
      })
    })
  },
})
