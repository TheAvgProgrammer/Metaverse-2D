const axios2 = require("axios");

const BACKEND_URL = "http://localhost:3000"

const axios = {
    post: async (...args) => {
    },
    get: async (...args) => {
    },
    put: async (...args) => {
    },
    delete: async (...args) => {
    },
}

describe("Authentication", () => {
    test('User is able to sign up only once', async () => {
        const username = "kirat" + Math.random(); // kirat0.12331313
        const password = "123456";
        const response = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type: "admin"
        })

        expect(response.status).toBe(200)
        const updatedResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type: "admin"
        })

        expect(updatedResponse.status).toBe(400);
    });

    test('Signup request fails if the username is empty', async () => {
        const username = `kirat-${Math.random()}` // kirat-0.12312313
        const password = "123456"

        const response = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            password
        })

        expect(response.status).toBe(400)
    })

    test('Signin succeeds if the username and password are correct', async() => {
        const username = `kirat-${Math.random()}`
        const password = "123456"

        await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type: "admin"
        });

        const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username,
            password
        });

        expect(response.status).toBe(200)
        expect(response.data.token).toBeDefined()
        
    })

    test('Signin fails if the username and password are incorrect', async() => {
        const username = `kirat-${Math.random()}`
        const password = "123456"

        await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            role: "admin"
        });

        const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username: "WrongUsername",
            password
        })

        expect(response.status).toBe(403)
    })
})

describe("User metadata endpoint", () => {
    let token = "";
    let avatarId = ""

    beforeAll(async () => {
       const username = `kirat-${Math.random()}`
       const password = "123456"

       await axios.post(`${BACKEND_URL}/api/v1/signup`, {
        username,
        password,
        type: "admin"
       });

       const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
        username,
        password
       })

       token = response.data.token

       const avatarResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/avatar`, {
            "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
            "name": "Timmy"
        }, {
            headers: {
                authorization: `Bearer ${token}`
            }
        })
        console.log("avatarresponse is " + avatarResponse.data.avatarId)

        avatarId = avatarResponse.data.avatarId;

    })

    test("User cant update their metadata with a wrong avatar id", async () => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/user/metadata`, {
            avatarId: "123123123"
        }, {
            headers: {
                "authorization": `Bearer ${token}`
            }
        })

        expect(response.status).toBe(400)
    })

    test("User can update their metadata with the right avatar id", async () => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/user/metadata`, {
            avatarId
        }, {
            headers: {
                "authorization": `Bearer ${token}`
            }
        })

        expect(response.status).toBe(200)
    })

    test("User is not able to update their metadata if the auth header is not present", async () => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/user/metadata`, {
            avatarId
        })

        expect(response.status).toBe(403)
    })

    test("test 3", () => {
        
    })
});

describe("User avatar information", () => {
    let avatarId;
    let token;
    let userId;

    beforeAll(async () => {
        const username = `kirat-${Math.random()}`
        const password = "123456"
 
        const signupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
         username,
         password,
         type: "admin"
        });

        userId = signupResponse.data.userId
 
        console.log("userid is " + userId)
        const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
         username,
         password
        })
 
        token = response.data.token
 
        const avatarResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/avatar`, {
             "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
             "name": "Timmy"
         }, {
            headers: {
                authorization: `Bearer ${token}`
            }
         })
 
         avatarId = avatarResponse.data.avatarId;
 
    })

    test("Get back avatar information for a user", async () => {
        console.log("asking for user with id " + userId)
        const response = await axios.get(`${BACKEND_URL}/api/v1/user/metadata/bulk?ids=[${userId}]`);
        console.log("response was " + userId)
        console.log(JSON.stringify(response.data))
        expect(response.data.avatars.length).toBe(1);
        expect(response.data.avatars[0].userId).toBe(userId);
    })

    test("Available avatars lists the recently created avatar", async () => {
        const response = await axios.get(`${BACKEND_URL}/api/v1/avatars`);
        expect(response.data.avatars.length).not.toBe(0);
        const currentAvatar = response.data.avatars.find(x => x.id == avatarId);
        expect(currentAvatar).toBeDefined()
    })

})
