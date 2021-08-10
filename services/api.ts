import axios, { AxiosError } from 'axios';
import { apiResolver } from 'next/dist/next-server/server/api-utils';
import { parseCookies, setCookie } from 'nookies'

let cookies = parseCookies()
let isRefreshing = false;

export const api = axios.create({
    baseURL: 'http://localhost:3333',
    headers: {
        Authorization: `Bearer ${cookies['nextauth.token']}`
    }
});


api.interceptors.response.use(response => {
    return response;
}, (error: AxiosError) => {
    //console.error(error.response.status)

    if (error.response.status === 401) {
        if (error.response.data?.code === 'token.expired') {
            //renew token
            cookies = parseCookies()
            const { 'nextauth.refreshToken': refreshToken } = cookies;

            api.post('refresh', {
                refreshToken,
            }).then(response => {
                const { token } = response.data;

                setCookie(undefined, 'nextauth.token', token, {
                    maxAge: 60 * 60 * 24 * 30,//30 days
                    path: '/'

                })


                setCookie(undefined, 'nextauth.refreshToken', response.data.refreshToken, {
                    maxAge: 60 * 60 * 24 * 30,//30 days
                    path: '/'

                })

                api.defaults.headers['Authorization'] = `Bearer ${token}`;


            });

        } else {
            //logoff user
        }
    }

}
)