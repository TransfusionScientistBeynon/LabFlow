import { getAuth0Token } from '../auth/auth.js';

export async function retrieveUserInfo(){

const token = await getAuth0Token();
console.log(token)

    const response = await fetch ("/api/getUserInfo", {
    method: "POST",
    headers: { 
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
    }
});

const userInfo = await response.json();

return userInfo 

}