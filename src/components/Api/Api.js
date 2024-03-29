import axios from 'axios';
import { API_NOTIFICATION_MESSAGES, SERVICE_URLS } from './api_messages';

const API_URL = 'http://localhost:8000'

const axiosInstance = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': "application/json"
    }
})

axiosInstance.interceptors.request.use(
    function (config) {
        return config;
    },
    function (error) {
        return Promise.reject(error);
    }
)


axiosInstance.interceptors.response.use(
    function (response) {
        // stop global loader here
        console.log(processresponse(response))
        return processresponse(response);
    },
    function (error) {
        // stop global loader here
        return Promise.reject(processError(error));
    }
)


// if success ->return {isSuccess: true, data:object}
// if fail ->return {isFailure:true, status:string, msg:string,code:int}
const processresponse = (response) => {
    if (response?.status === 200) {
        return { Success: true, data: response.data }
    }
    else {
        return {
            isFailure: true,
            status: response?.status,
            msg: response?.msg,
            code: response?.code
        }
    }
}


const processError = (error) => {
    if (error.response) {
        // request made and server responded with a status other thanthat falls out of the range 2.x.x
        console.log('Error in response:', error.toJSON());
        return {
            isError: true,
            msg: API_NOTIFICATION_MESSAGES.responseFailure,
            code: error.response.status
        }
    } else if (error.request) {
        // request made but no response was received
        console.log('Error in request:', error.toJSON());
        return {
            isError: true,
            msg: API_NOTIFICATION_MESSAGES.requestFailure,
            code: ""
        }
    }
    else {
        // someting happened is setting up request that triggers an error
        console.log('Error in response:', error.toJSON());
        return {
            isError: true,
            msg: API_NOTIFICATION_MESSAGES.networkError,
            code: ""
        }
    }
}


const API = {};

for (const [key, value] of Object.entries(SERVICE_URLS)) {
    API[key] = (body, showUploadProgress, showDownloadProgress) => {
        axiosInstance({
            method: value.method,
            url: value.url,
            data: body,
            responseType: value.responseType,
            onUploadProgress: function (progressEvent) {
                if (showUploadProgress) {
                    let percentagecompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
                    showUploadProgress(percentagecompleted);
                }

            },
            onDownloadProgress: function (progressEvent) {
                if (showDownloadProgress) {

                    let percentagecompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
                    showDownloadProgress(percentagecompleted);
                }
            }
        })
    }
}

export { API };